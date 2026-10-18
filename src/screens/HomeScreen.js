import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, ActivityIndicator } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocation } from "../context/LocationContext";
import { useUser } from "../context/UserContext";
import { createIncident, subscribeMyIncidents, newIncidentId } from "../services/incidentService";
import { INCIDENT_TYPES, SOS_TYPE, INCIDENT_MODE, isActiveStatus, getTypeInfo } from "../constants/incident";
import LocationEditButton from "../components/LocationEditButton";

const HomeScreen = ({ navigation }) => {

    const { location, address, addressDetail, source } = useLocation();
    const { authUser, profile } = useUser();
    const [sending, setSending] = useState(false);
    const [myIncidents, setMyIncidents] = useState([]);

    //ดูว่ามีเหตุอยู่ไหม   
    useEffect(
        () => subscribeMyIncidents(authUser.uid, setMyIncidents, (e) => console.warn(e)),
        [authUser.uid]
    );
    const activeIncident = myIncidents.find((i) => isActiveStatus(i.status));

    const openActive = () => navigation.navigate("Status", { incidentId: activeIncident.id });

    const blockIfActive = () =>  {
        if (!activeIncident) return false;
        Alert.alert("มีเหตุที่กำลังดำเนินการอยู่", "ต้องการดูสถานะเหตุเดิมหรือไม่?", [
            { text: "ปิด", style: "cancel" },
            { text: "ดูสถานะ", onPress: openActive },
        ]);
        return true;
    };

    const ensureReady = () => {
        if (!location) {
            Alert.alert("ยังไม่พบตำแหน่ง", "กรุณารอสักครู่ให้ระบบระบุตำแหน่ง GPS");
            return false;
        }
        return true;
    };

    //แจ้งแบบด่วน
    const handleSOS = () => {
        if (sending || blockIfActive() || !ensureReady()) return;
        if (!profile) return Alert.alert("กรุณารอสักครู่", "กำลังโหลดข้อมูลผู้ใช้");

        Alert.alert(
            "ยืนยันแจ้งเหตุด่วน",
            "ระบบจะส่งตำแหน่งและข้อมูลของคุณให้เจ้าหน้าที่ทันที",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ยืนยันแจ้งเหตุ",
                    style: "destructive",
                    onPress: async () => {
                        setSending(true);
                        try {
                            const id = await createIncident({
                                id: newIncidentId(),
                                uid: authUser.uid, profile,
                                mode: INCIDENT_MODE.QUICK,
                                type: SOS_TYPE.key,
                                severity: "critical",
                                location, address, addressDetail, source,
                            });
                            navigation.navigate("Status", { incidentId: id });
                        } catch (e) {
                            console.error(e);
                            Alert.alert("ส่งไม่สำเร็จ", "กรุณาลองใหม่ หรือโทร 1669");
                        } finally {
                            setSending(false);
                        }
                    },
                },
            ]
        );
    };

    //แจ้งแบบเลือกประเภท
    const goToReport = (typeKey) => {
        if (blockIfActive() || !ensureReady()) return;
        navigation.navigate("Report", { type: typeKey });
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.sosSection}>
                <TouchableOpacity style={styles.sosButton} onPress={handleSOS} disabled={sending}>
                    {sending ? <ActivityIndicator color="#fff" size="large" /> : (
                        <>
                            <MaterialIcons name="warning" size={55} color="#fff" />
                            <Text style={styles.sosText}>SOS</Text>
                            <Text style={styles.sosSub}>แจ้งเหตุด่วน</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {activeIncident && (
                <TouchableOpacity style={styles.activeBanner} onPress={openActive}>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.activeTitle}>มีเหตุที่กำลังดำเนินการ • {getTypeInfo(activeIncident.type).title}</Text>
                        <Text style={styles.activeSub}>แตะเพื่อดูสถานะการช่วยเหลือ</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={28} color="#fff" />
                </TouchableOpacity>
            )}

            <View style={styles.locationSection}>
                <View style={styles.locationHeader}>
                    <Text style={styles.locationText}>ตำแหน่งปัจจุบันของคุณ</Text>
                    <LocationEditButton onPress={() => navigation.navigate("PickLocation")} />
                </View>
                <Text style={styles.address}>{address}</Text>
                {location && (
                    <Text style={styles.latlng}>
                        {location.latitude.toFixed(5)} , {location.longitude.toFixed(5)}
                    </Text>
                )}
            </View>

            <TouchableOpacity style={styles.aedCard}>
                <View style={styles.aedIcon}>
                    <MaterialIcons name="favorite" size={25} color="#F59E0B" />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.aedTitle}>AED ที่ใกล้ที่สุด</Text>
                    <Text style={styles.aedSub}>กองบริหารกิจการนิสิต</Text>
                </View>
                <MaterialIcons name="chevron-right" size={30} color="#C97B00" />
            </TouchableOpacity>

            <Text style={styles.type}>เลือกประเภทเหตุฉุกเฉิน</Text>
            <View style={styles.typeSection}>
                {INCIDENT_TYPES.map((t) => (
                    <TouchableOpacity key={t.key} style={styles.typeOption} onPress={() => goToReport(t.key)}>
                        <MaterialCommunityIcons name={t.icon} size={35} color={t.color} />
                        <Text style={styles.typeText}>{t.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.history} onPress={() => navigation.navigate("History")}>
                <MaterialIcons name="history" size={28} />
                <Text style={styles.historyText}>ประวัติการแจ้งเหตุ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.call} onPress={() => Linking.openURL("tel:1669")}>
                <MaterialIcons name="phone" color="#fff" size={28} />
                <Text style={styles.callText}>โทร 1669 สายด่วนฉุกเฉิน</Text>
            </TouchableOpacity>


        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: '#eeeeee',
        marginBottom: 20,
    },

    sosSection: {
        height: 240,
        backgroundColor: "#1E213B",
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        justifyContent: "center",
        alignItems: "center"
    },
    sosButton: {
        width: 150,
        height: 150,
        backgroundColor: "#f21212",
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#fff",
    },
    sosText: {
        fontSize: 30,
        color: "#fff",
        fontWeight: "bold",
    },
    sosSub: {
        fontSize: 16,
        color: "#fff"
    },

    activeBanner: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#f21212", marginHorizontal: 20, marginTop: 15,
        padding: 14, borderRadius: 16, elevation: 4,
    },
    activeTitle: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold"
    },
    activeSub: {
        color: "#fff",
        fontSize: 13,
        marginTop: 2
    },

    locationSection: {
        backgroundColor: "#fff",
        padding: 15,
        margin: 15,
        marginHorizontal: 20,
        borderRadius: 20,
        elevation: 4
    },
    locationHeader: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    locationText: {
        fontSize: 16,
        color: '#888',
        alignSelf: "center",
    },
    address: {
        fontWeight: "bold",
        fontSize: 16,
        marginTop: 5
    },
    latlng: {
        fontSize: 14,
        color: "#888",
        marginTop: 5
    },

    aedCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF4C4",
        marginHorizontal: 20,
        padding: 15,
        borderRadius: 20
    },
    aedIcon: {
        padding: 5,
        backgroundColor: "#ffd395",
        borderRadius: 20
    },
    aedTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#865108"
    },
    aedSub: {
        fontSize: 16,
        color: "#865108"
    },

    type: {
        fontSize: 16,
        fontWeight: "bold",
        margin: 15,
        marginHorizontal: 20,
    },
    typeSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        marginHorizontal: 20,
    },
    typeOption: {
        width: "30%",
        height: 70,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#fff",
        borderRadius: 20,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3
    },
    typeText: {
        fontSize: 14,
        marginTop: 5,
    },

    history: {
        flexDirection: "row",
        backgroundColor: "#cccccc",
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },
    historyText: {
        fontSize: 16,
        marginLeft: 10
    },

    call: {
        flexDirection: "row",
        backgroundColor: "#14B884",
        marginHorizontal: 20,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        padding: 10
    },
    callText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 10
    }
});

export default HomeScreen