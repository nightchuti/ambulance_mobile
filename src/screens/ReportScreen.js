import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput, Image, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocation } from "../context/LocationContext";
import { useUser } from "../context/UserContext";
import { uploadImages } from "../services/cloudinaryService";
import { createIncident, newIncidentId } from "../services/incidentService";
import { INCIDENT_TYPES, SEVERITY, INCIDENT_MODE } from "../constants/incident";
import LocationEditButton from "../components/LocationEditButton";

const ReportScreen = ({ navigation, route }) => {
    const { location, address, addressDetail, source } = useLocation();
    const { authUser, profile } = useUser();

    const [selectedType, setSelectedType] = useState(route.params?.type || null);
    const [severity, setSeverity] = useState(null);
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [sending, setSending] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            quality: 0.7,
        });
        if (!result.canceled) setImages([...images, ...result.assets]);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("ไม่ได้รับอนุญาต", "กรุณาเปิดสิทธิ์กล้องก่อนถ่ายรูป");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
        if (!result.canceled) setImages([...images, ...result.assets]);
    };

    const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

    const handleSend = async () => {
        if (sending) return;
        if (!selectedType) return Alert.alert("กรุณาเลือกประเภทเหตุ");
        if (!severity) return Alert.alert("กรุณาเลือกระดับความรุนแรง");
        if (!location) return Alert.alert("ยังไม่พบตำแหน่ง", "กรุณารอสักครู่หรือกดแก้ไขตำแหน่ง");
        if (!profile) return Alert.alert("กรุณารอสักครู่", "กำลังโหลดข้อมูลผู้ใช้");

        setSending(true);
        try {
            const incidentId = newIncidentId();
            let uploaded = [];
            if (images.length > 0) {
                try {
                    uploaded = await uploadImages(images.map((i) => i.uri), `incidents/${incidentId}`);
                } catch (e) {
                    console.warn("upload images failed", e);
                }
            }

            const id = await createIncident({
                id: incidentId,
                uid: authUser.uid, profile,
                mode: INCIDENT_MODE.DETAILED,
                type: selectedType, severity, description,
                location, address, addressDetail, source,
                images: uploaded,
            });
            navigation.replace("Status", { incidentId: id });
        } catch (e) {
            console.error(e);
            Alert.alert("ส่งไม่สำเร็จ", "กรุณาลองใหม่ หรือโทร 1669 หากเร่งด่วน");
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.typeHeader}>เลือกประเภทเหตุฉุกเฉิน</Text>
                <View style={styles.typeSection}>
                    {INCIDENT_TYPES.map((item) => {
                        const selected = selectedType === item.key;
                        return (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.typeOption, selected && { backgroundColor: item.color }]}
                                onPress={() => setSelectedType(item.key)}
                            >
                                <MaterialCommunityIcons name={item.icon} size={35} color={selected ? "#fff" : item.color} />
                                <Text style={[styles.typeText, selected && { color: "#fff" }]}>{item.title}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>ระดับความรุนแรง</Text>
                    </View>
                    <View style={styles.severityRow}>
                        {SEVERITY.map((s) => {
                            const selected = severity === s.key;
                            return (
                                <TouchableOpacity
                                    key={s.key}
                                    style={[styles.severityChip, { borderColor: s.color }, selected && { backgroundColor: s.color }]}
                                    onPress={() => setSeverity(s.key)}
                                >
                                    <Text style={[styles.severityText, { color: selected ? "#fff" : "black" }]}>{s.title}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>ตำแหน่งเกิดเหตุ</Text>
                        <LocationEditButton onPress={() => navigation.navigate("PickLocation")} />
                    </View>
                    <Text style={styles.locText} numberOfLines={2}>{address}</Text>
                    {location && (
                        <Text style={styles.latlng}>
                            {location.latitude.toFixed(5)} , {location.longitude.toFixed(5)}
                        </Text>
                    )}
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>รายละเอียดเพิ่มเติม</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        multiline
                        maxLength={500}
                        placeholder="อธิบายอาการ, จำนวนคนเจ็บ หรือจุดสังเกต..."
                        placeholderTextColor="#94A3B8"
                        value={description}
                        onChangeText={setDescription}
                    />
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>รูปภาพประกอบ ({images.length})</Text>
                    </View>
                    <View style={styles.imgRow}>
                        {images.map((img, i) => (
                            <View key={i} style={styles.thumbWrapper}>
                                <Image source={{ uri: img.uri }} style={styles.thumb} />
                                <TouchableOpacity style={styles.deleteBadge} onPress={() => removeImage(i)}>
                                    <Ionicons name="close" size={12} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addImgBtn} onPress={takePhoto}>
                            <Ionicons name="camera-outline" size={24} color="#64748B" />
                            <Text style={styles.addImgTxt}>ถ่ายรูป</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
                            <Ionicons name="images-outline" size={24} color="#64748B" />
                            <Text style={styles.addImgTxt}>เลือกรูป</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.sendButton, sending && { opacity: 0.6 }]}
                onPress={handleSend}
                disabled={sending}
            >
                {sending
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.sendButtonText}>ส่งแจ้งเหตุฉุกเฉิน</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeeeee',
    },
    typeHeader: {
        fontSize: 16,
        fontWeight: "bold",
        margin: 15,
        marginHorizontal: 25,
    },
    typeSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        marginHorizontal: 15,
        marginBottom: 10,
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

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 12,
        marginHorizontal: 20,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
    },

    severityRow: { 
        flexDirection: "row", 
        gap: 8 
    },
    severityChip: {
        flex: 1, 
        borderWidth: 0.5, 
        borderRadius: 10,
        paddingVertical: 10, 
        alignItems: "center", 
        backgroundColor: "#fff",
    },
    severityText: { 
        fontSize: 14,  
    },

    locText: {
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        fontSize: 16,
    },
    latlng: {
        fontSize: 14,
        color: "#888",
        marginTop: 5,
        marginLeft: 4,
    },

    input: {
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        fontSize: 16,
        color: "#1E293B",
        minHeight: 65,
        textAlignVertical: "top",
    },

    imgRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    thumbWrapper: {
        position: "relative",
    },
    thumb: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: "#E2E8F0",
    },
    deleteBadge: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#EF4444",
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#FFF",
    },
    addImgBtn: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
    },
    addImgTxt: {
        fontSize: 10,
        color: "#64748B",
        marginTop: 2,
        fontWeight: "600",
    },

    sendButton: {
        justifyContent: "center",
        marginTop: "auto",
        width: "auto",
        height: 50,
        marginBottom: 20,
        marginHorizontal: 20,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#f21212",
    },
    sendButtonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});

export default ReportScreen