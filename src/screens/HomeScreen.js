import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons, } from "@expo/vector-icons";
import * as Location from "expo-location";

const HomeScreen = ({ navigation }) => {

    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState("กำลังระบุตำแหน่ง...");

    const emergencyType = [
        { title: "อุบัติเหตุรถ", icon: <MaterialCommunityIcons name="car" size={35} color="#F59E0B" />, },
        { title: "หัวใจ/หมดสติ", icon: <FontAwesome5 name="heart" size={32} color="#EF4444" />, },
        { title: "บาดเจ็บ", icon: <MaterialCommunityIcons name="bandage" size={33} color="#8B5CF6" />, },
        { title: "ไฟไหม้", icon: <MaterialIcons name="local-fire-department" size={35} color="#F97316" />, },
        { title: "จมน้ำ", icon: <Ionicons name="water" size={35} color="#0EA5E9" />, },
        { title: "เหตุอื่น ๆ", icon: <MaterialIcons name="error" size={33} color="#64748B" />, },
    ];

    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async () => {
        let permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
            alert("ไม่ได้รับอนุญาต GPS");
            return;
        }
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);

        const addressData = await Location.reverseGeocodeAsync(currentLocation.coords);

        if (addressData.length > 0) {
            const addressName = addressData[0];
            setAddress(`${addressName.name || ""} ${addressName.street || ""} ${addressName.district || ""} ${addressName.subregion || ""} ${addressName.city || ""} ${addressName.region || ""}`);
        }
    }

    const goToReport = (type) => {
        if (!location || !location.latitude || !location.longitude) {
            Alert.alert(
                "ยังไม่พบตำแหน่ง",
                "กรุณารอสักครู่ให้ระบบระบุตำแหน่ง GPS ก่อนแจ้งเหตุ",
            );
            return;
        }
        navigation.navigate("Report", { location, address, type });
    };

    return (
        <ScrollView style={styles.container}>

            <View style={styles.sosSection}>
                <TouchableOpacity style={styles.sosButton}>
                    <MaterialIcons
                        name="warning"
                        size={55}
                        color="#fff"
                    />
                    <Text style={styles.sosText}>SOS</Text>
                    <Text style={styles.sosSub}>แจ้งเหตุด่วน</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.locationSection}>
                <View style={{ flexDirection: 'row' }}>
                    <MaterialIcons
                        name="location-on"
                        color="red"
                        size={21}
                    />
                    <View style={{ marginLeft: 8 }}>
                        <Text style={styles.locationText}>ตำแหน่งปัจจุบันของคุณ</Text>
                    </View>

                </View>
                <Text style={styles.address}>{address}</Text>
                <Text style={styles.latlng}>{location && `${location.latitude.toFixed(5)} , ${location.longitude.toFixed(5)}`}</Text>
            </View>

            <TouchableOpacity style={styles.aedCard}>
                <View style={styles.aedIcon}>
                    <MaterialIcons
                        name="favorite"
                        size={25}
                        color="#F59E0B"
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                    <Text style={styles.aedTitle}>AED ที่ใกล้ที่สุด</Text>
                    <Text style={styles.aedSub}>กองบริหารกิจการนิสิต</Text>
                </View>
                <MaterialIcons
                    name="chevron-right"
                    size={30}
                    color="#C97B00"
                />
            </TouchableOpacity>

            <Text style={styles.type}>เลือกประเภทเหตุฉุกเฉิน</Text>
            <View style={styles.typeSection}>
                {emergencyType.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.typeOption}
                        onPress={() => goToReport(item.title)}
                    >
                        {item.icon}
                        <Text style={styles.typeText}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.history}>
                <MaterialIcons
                    name="history"
                    size={28}
                />
                <Text style={styles.historyText}>ประวัติการแจ้งเหตุ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.call}>
                <MaterialIcons
                    name="phone"
                    color="#fff"
                    size={28}
                />
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
    },
    sosSection: {
        height: "35%",
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

    locationSection: {
        backgroundColor: "#fff",
        padding: 15,
        margin: 15,
        marginHorizontal: 20,
        borderRadius: 20,
        elevation: 4
    },
    locationText: {
        fontSize: 16,
        color: '#888',
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
    aedTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#865108"
    },
    aedSub: {
        fontSize: 16,
        color: "#865108"
    },
    aedIcon: {
        padding: 5,
        backgroundColor: "#ffd395",
        borderRadius: 20
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
        marginTop: 8,
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