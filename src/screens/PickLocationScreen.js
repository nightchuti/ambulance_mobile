import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocation } from "../context/LocationContext";

const FALLBACK = { latitude: 14.0239, longitude: 99.9752 };
const DELTA = 0.003;

const PickLocationScreen = ({ navigation }) => {
    const { location, address, placeName, setManualLocation } = useLocation();
    const mapRef = useRef(null);
    const start = location || FALLBACK;
    const poiRef = useRef(placeName && location ? { latitude: location.latitude, longitude: location.longitude } : null);
    const [pin, setPin] = useState({ latitude: start.latitude, longitude: start.longitude, name: poiRef.current ? placeName : null });
    const [text, setText] = useState(poiRef.current ? address : " ");
    const [locating, setLocating] = useState(false);
    const [busy, setBusy] = useState(false);

    const updatePin = async ({ latitude, longitude }, name = null) => {
        setPin({ latitude, longitude, name });
        setText(name || "กำลังระบุที่อยู่...");

        try {
            const [a] = await Location.reverseGeocodeAsync({ latitude, longitude });
            const parts = a ? [name || a.name, a.street, a.district, a.subregion, a.city, a.region] : [name];
            setText(parts.filter(Boolean).join(" ") || "ไม่พบที่อยู่");
        } catch {
            setText(name || "ไม่สามารถแปลงเป็นที่อยู่ได้");
        }
    };

    //กดเลือกสถานที่
    const handlePoiClick = (e) => {
        const { coordinate, name } = e.nativeEvent;
        poiRef.current = coordinate;
        updatePin(coordinate, name);
        mapRef.current?.animateCamera({ center: coordinate }, { duration: 500 });
    };

    //กลับไปใช้ตำแหน่งตรงกลางจอ
    const handlePanDrag = () => { poiRef.current = null; };

    const handleRegionChange = (region) => {
        if (poiRef.current) return;
        updatePin({ latitude: region.latitude, longitude: region.longitude });
    };

    const goToMyLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                return Alert.alert("ไม่ได้รับอนุญาต", "กรุณาอนุญาตการเข้าถึง GPS");
            }
            const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            poiRef.current = null;
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
                    provider={PROVIDER_GOOGLE}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{ latitude: pin.latitude, longitude: pin.longitude, latitudeDelta: DELTA, longitudeDelta: DELTA }}
                    onRegionChangeComplete={handleRegionChange}
                    onPoiClick={handlePoiClick}
                    onPanDrag={handlePanDrag}
                    showsUserLocation
                    showsMyLocationButton={false}
                />

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