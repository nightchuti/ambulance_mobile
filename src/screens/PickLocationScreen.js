import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocation } from "../context/LocationContext";

const FALLBACK = { latitude: 14.0239, longitude: 99.9752 };
const DELTA = 0.003;

const PickLocationScreen = ({ navigation }) => {
    const { location, setManualLocation } = useLocation();
    const mapRef = useRef(null);
    const start = location || FALLBACK;

    const [pin, setPin] = useState({ latitude: start.latitude, longitude: start.longitude });
    const [text, setText] = useState(" ");
    const [locating, setLocating] = useState(false);
    const [busy, setBusy] = useState(false);

    const handleRegionChange = async (region) => {
        const coords = { latitude: region.latitude, longitude: region.longitude };
        setPin(coords);
        setText("กำลังระบุที่อยู่...");
        try {
            const [a] = await Location.reverseGeocodeAsync(coords);
            setText(a ? [a.name, a.street, a.district, a.subregion, a.city, a.region].filter(Boolean).join(" ") || "ไม่พบที่อยู่" : "ไม่พบที่อยู่");
        } catch {
            setText("ไม่สามารถแปลงเป็นที่อยู่ได้");
        }
    };

    const goToMyLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                return Alert.alert("ไม่ได้รับอนุญาต", "กรุณาอนุญาตการเข้าถึง GPS");
            }
            const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            mapRef.current?.animateToRegion(
                { latitude: p.coords.latitude, longitude: p.coords.longitude, latitudeDelta: DELTA, longitudeDelta: DELTA },
                500
            );
        } catch {
            Alert.alert("ดึงตำแหน่งไม่สำเร็จ", "กรุณาเปิด GPS แล้วลองใหม่");
        } finally {
            setLocating(false);
        }
    };

    const handleConfirm = async () => {
        setBusy(true);
        await setManualLocation(pin);
        setBusy(false);
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <View style={styles.mapWrapper}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{ ...pin, latitudeDelta: DELTA, longitudeDelta: DELTA }}
                    onRegionChangeComplete={handleRegionChange}
                    showsUserLocation
                    showsMyLocationButton={false}
                />

                {/*หมุดอยู่ที่กลางแผนที่*/}
                <View pointerEvents="none" style={styles.pinWrapper}>
                    <MaterialIcons name="location-pin" size={48} color="#f21212" />
                </View>

                <TouchableOpacity style={styles.locateBtn} onPress={goToMyLocation} disabled={locating}>
                    {locating
                        ? <ActivityIndicator size="small" color="#f21212" />
                        : <Ionicons name="locate" size={24} color="#f21212" />}
                </TouchableOpacity>
            </View>

            <View style={styles.bottom}>
                <Text style={styles.hint}>เลื่อนแผนที่ให้หมุดอยู่ตรงจุดเกิดเหตุ</Text>
                <Text style={styles.address} numberOfLines={2}>{text}</Text>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={busy}>
                    {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>ยืนยันตำแหน่งนี้</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    mapWrapper: {
        flex: 1
    },
    pinWrapper: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -24,
        marginTop: -48,
    },
    locateBtn: {
        position: "absolute",
        right: 16,
        bottom: 16,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
    },
    bottom: {
        padding: 16,
        backgroundColor: "#fff",
        gap: 10
    },
    hint: {
        textAlign: "center",
        color: "#64748B",
        fontSize: 13
    },
    address: {
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        fontSize: 15,
    },
    confirmBtn: {
        backgroundColor: "#f21212",
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: "center"
    },
    confirmText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold"
    },
});

export default PickLocationScreen;