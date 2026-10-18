// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from "react-native";
// import MapView, { Marker } from "react-native-maps";
// import { Ionicons } from "@expo/vector-icons";
// import { useLocation } from "../context/LocationContext";
// import { subscribeAEDs, distanceMeters } from "../services/aedService";

// const FALLBACK = { latitude: 13.8476, longitude: 100.5696 };
// const ROW_HEIGHT = 88; // ความสูงแถว (รวมระยะห่าง) ใช้กับ getItemLayout

// const STATUS_INFO = {
//     active: { label: "พร้อมใช้งาน", color: "#16A34A" },
//     inactive: { label: "ไม่พร้อมใช้งาน", color: "#94A3B8" },
// };

// const AEDMapScreen = () => {
//     const { location } = useLocation();
//     const [aeds, setAeds] = useState(null);      // null = กำลังโหลด
//     const [selectedId, setSelectedId] = useState(null);
//     const mapRef = useRef(null);
//     const listRef = useRef(null);

//     // 1) ดึงข้อมูลจาก Firestore แบบ realtime
//     useEffect(() => {
//         return subscribeAEDs(setAeds, (e) => {
//             console.warn(e);
//             setAeds([]);
//         });
//     }, []);

//     // 2) คำนวณระยะทาง + เรียงจากใกล้ไปไกล
//     const sorted = useMemo(() => {
//         if (!aeds) return [];
//         const withDist = aeds.map((a) => ({
//             ...a,
//             distance: location
//                 ? distanceMeters(location.latitude, location.longitude, a.latitude, a.longitude)
//                 : null,
//         }));
//         if (location) withDist.sort((a, b) => a.distance - b.distance);
//         return withDist;
//     }, [aeds, location]);

//     // ถ้ายังไม่ได้เลือก ให้ถือว่าเลือกอันที่ใกล้ที่สุด
//     const currentId = selectedId ?? sorted[0]?.id;

//     // 3) เลือก AED: เลื่อนแผนที่มาที่หมุด (และเลื่อนลิสต์ถ้าสั่งให้เลื่อน)
//     const selectAED = (item, index, scrollList = false) => {
//         setSelectedId(item.id);
//         mapRef.current?.animateToRegion(
//             { latitude: item.latitude, longitude: item.longitude, latitudeDelta: 0.003, longitudeDelta: 0.003 },
//             500
//         );
//         if (scrollList) {
//             listRef.current?.scrollToIndex({ index, animated: true });
//         }
//     };

//     // 4) เปิด Google Maps นำทาง
//     const openNavigation = (item) =>
//         Linking.openURL(
//             `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}&travelmode=walking`
//         );

//     // แปลงเมตรเป็นข้อความ
//     const formatDistance = (m) => {
//         if (m == null) return "";
//         return m < 1000 ? `${Math.round(m)} ม.` : `${(m / 1000).toFixed(1)} กม.`;
//     };

//     if (!aeds) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

//     const start = location || FALLBACK;

//     return (
//         <View style={styles.container}>
//             {/* ===== แผนที่ ===== */}
//             <View style={styles.mapWrapper}>
//                 <MapView
//                     ref={mapRef}
//                     style={StyleSheet.absoluteFill}
//                     initialRegion={{
//                         latitude: start.latitude,
//                         longitude: start.longitude,
//                         latitudeDelta: 0.01,
//                         longitudeDelta: 0.01,
//                     }}
//                     showsUserLocation
//                     showsMyLocationButton={false}
//                 >
//                     {sorted.map((item, index) => (
//                         <Marker
//                             key={item.id}
//                             coordinate={{ latitude: item.latitude, longitude: item.longitude }}
//                             title={item.name}
//                             description={item.description}
//                             pinColor={item.id === currentId ? "#f21212" : "#3B82F6"}
//                             zIndex={item.id === currentId ? 10 : 1}
//                             onPress={() => selectAED(item, index, true)}
//                         />
//                     ))}
//                 </MapView>
//             </View>

//             {/* ===== ลิสต์ AED เลื่อนขึ้นลงได้ ===== */}
//             <View style={styles.panel}>
//                 <Text style={styles.panelTitle}>จุดติดตั้ง AED ใกล้เคียง ({sorted.length})</Text>

//                 <FlatList
//                     ref={listRef}
//                     data={sorted}
//                     keyExtractor={(i) => i.id}
//                     showsVerticalScrollIndicator={false}
//                     getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
//                     ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีข้อมูลจุดติดตั้ง AED</Text>}
//                     renderItem={({ item, index }) => {
//                         const selected = item.id === currentId;
//                         const st = STATUS_INFO[item.status] || STATUS_INFO.inactive;
//                         return (
//                             <TouchableOpacity
//                                 style={[styles.row, selected && styles.rowSelected]}
//                                 onPress={() => selectAED(item, index)}
//                                 activeOpacity={0.8}
//                             >
//                                 <View style={[styles.badge, selected && { backgroundColor: "#f21212" }]}>
//                                     <Text style={styles.badgeText}>{index + 1}</Text>
//                                 </View>

//                                 <View style={styles.info}>
//                                     <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
//                                     <Text style={styles.desc} numberOfLines={1}>{item.description || "-"}</Text>
//                                     <View style={styles.statusRow}>
//                                         <View style={[styles.dot, { backgroundColor: st.color }]} />
//                                         <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
//                                     </View>
//                                 </View>

//                                 <TouchableOpacity style={styles.navBtn} onPress={() => openNavigation(item)}
//                                     hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
//                                     <Ionicons name="navigate" size={22} color={selected ? "#f21212" : "#000"} />
//                                     <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
//                                 </TouchableOpacity>
//                             </TouchableOpacity>
//                         );
//                     }}
//                 />
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, backgroundColor: "#eeeeee" },
//     mapWrapper: { flex: 1 },

//     panel: {
//         height: 330,
//         backgroundColor: "#f5f5f5",
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//         marginTop: -20,            // ให้ทับขอบล่างแผนที่นิดหน่อยเหมือนในรูป
//         paddingHorizontal: 14,
//         paddingTop: 14,
//         elevation: 8,
//     },
//     panelTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
//     empty: { textAlign: "center", marginTop: 30, color: "#94A3B8" },

//     row: {
//         height: ROW_HEIGHT - 10,   // เว้น 10 เป็นช่องว่างระหว่างแถว (ROW_HEIGHT รวมช่องว่างแล้ว)
//         marginBottom: 10,
//         flexDirection: "row",
//         alignItems: "center",
//         backgroundColor: "#fff",
//         borderRadius: 14,
//         padding: 12,
//         elevation: 2,
//         borderWidth: 1,
//         borderColor: "#fff",
//     },
//     rowSelected: { backgroundColor: "#FFF1F1", borderColor: "#f21212" },

//     badge: {
//         width: 34, height: 34, borderRadius: 17,
//         backgroundColor: "#6B7280", alignItems: "center", justifyContent: "center",
//     },
//     badgeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

//     info: { flex: 1, marginLeft: 12 },
//     name: { fontSize: 15, fontWeight: "bold", color: "#111827" },
//     desc: { fontSize: 13, color: "#64748B", marginTop: 1 },
//     statusRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
//     dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
//     statusText: { fontSize: 12, fontWeight: "bold" },

//     navBtn: { alignItems: "center", marginLeft: 8, minWidth: 56 },
//     distance: { fontSize: 12, fontWeight: "bold", color: "#f21212", marginTop: 2 },
// });

// export default AEDMapScreen;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Animated, PanResponder } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "../context/LocationContext";
import { subscribeAEDs, distanceMeters } from "../services/aedService";

const FALLBACK = { latitude: 13.8476, longitude: 100.5696 };
const ROW_HEIGHT = 88;      // ความสูงแถวรวมระยะห่าง
const HEADER_H = 64;        // ความสูงแถบหัว panel (ขีด + ชื่อ)
const PANEL_FRAC = 0.8;     // panel สูงสุด 80% ของหน้าจอ
const MID_FRAC = 0.4;       // ตอนอยู่ระดับกลาง เห็น panel 40% ของหน้าจอ

const STATUS_INFO = {
    active: { label: "พร้อมใช้งาน", color: "#16A34A" },
    inactive: { label: "ไม่พร้อมใช้งาน", color: "#94A3B8" },
};

const AEDMapScreen = () => {
    const { location } = useLocation();
    const [aeds, setAeds] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [containerH, setContainerH] = useState(0);
    const [atTop, setAtTop] = useState(false);   // panel ขึ้นสุดหรือยัง (เปิดให้เลื่อนลิสต์ได้)

    const mapRef = useRef(null);
    const listRef = useRef(null);

    // ---------- ส่วน panel ลากได้ ----------
    const translateY = useRef(new Animated.Value(0)).current;
    const currentY = useRef(0);     // ตำแหน่งปัจจุบันของ panel
    const startY = useRef(0);       // ตำแหน่งตอนเริ่มลาก
    const initialized = useRef(false);
    const snaps = useRef({ top: 0, mid: 0, bottom: 0 });

    const panelH = containerH * PANEL_FRAC;
    snaps.current = {
        top: 0,                                  // ขึ้นสุด
        mid: panelH - containerH * MID_FRAC,     // ระดับกลาง
        bottom: panelH - HEADER_H,               // ซ่อน เหลือแค่แถบหัว
    };

    const snapTo = (y) => {
        currentY.current = y;
        setAtTop(y === snaps.current.top);
        Animated.spring(translateY, { toValue: y, useNativeDriver: true, bounciness: 4 }).start();
    };

    // ตั้งตำแหน่งเริ่มต้นเป็นระดับกลาง เมื่อรู้ขนาดหน้าจอแล้ว
    useEffect(() => {
        if (containerH > 0 && !initialized.current) {
            initialized.current = true;
            currentY.current = snaps.current.mid;
            translateY.setValue(snaps.current.mid);
        }
    }, [containerH]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => { startY.current = currentY.current; },
            onPanResponderMove: (_, g) => {
                const { top, bottom } = snaps.current;
                const y = Math.min(Math.max(startY.current + g.dy, top), bottom);
                currentY.current = y;
                translateY.setValue(y);
            },
            onPanResponderRelease: (_, g) => {
                const { top, mid, bottom } = snaps.current;
                // คาดการณ์ตำแหน่งปลายทางจากความเร็วที่ปล่อยนิ้ว แล้วเลือกระดับที่ใกล้ที่สุด
                const target = currentY.current + g.vy * 150;
                const nearest = [top, mid, bottom].reduce((a, b) =>
                    Math.abs(b - target) < Math.abs(a - target) ? b : a
                );
                snapTo(nearest);
            },
        })
    ).current;

    // ---------- ข้อมูล AED ----------
    useEffect(() => {
        return subscribeAEDs(setAeds, (e) => {
            console.warn(e);
            setAeds([]);
        });
    }, []);

    const sorted = useMemo(() => {
        if (!aeds) return [];
        const withDist = aeds.map((a) => ({
            ...a,
            distance: location
                ? distanceMeters(location.latitude, location.longitude, a.latitude, a.longitude)
                : null,
        }));
        if (location) withDist.sort((a, b) => a.distance - b.distance);
        return withDist;
    }, [aeds, location]);

    const currentId = selectedId ?? sorted[0]?.id;

    // เลือก AED: ลด panel ลงระดับกลาง + เลื่อนแผนที่ให้หมุดอยู่กลางพื้นที่ที่มองเห็น
    const selectAED = (item, index, scrollList = false) => {
        setSelectedId(item.id);
        snapTo(snaps.current.mid);

        const delta = 0.003;
        mapRef.current?.animateToRegion(
            {
                // ขยับกล้องลงใต้หมุดเล็กน้อย หมุดจะลอยขึ้นมาอยู่กลางส่วนที่ไม่โดน panel บัง
                latitude: item.latitude - delta * (MID_FRAC / 2),
                longitude: item.longitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
            },
            500
        );
        if (scrollList) {
            listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
        }
    };

    const openNavigation = (item) =>
        Linking.openURL(
            `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}&travelmode=walking`
        );

    const formatDistance = (m) => {
        if (m == null) return "";
        return m < 1000 ? `${Math.round(m)} ม.` : `${(m / 1000).toFixed(1)} กม.`;
    };

    if (!aeds) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    const start = location || FALLBACK;

    return (
        <View style={styles.container} onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}>
            {/* ===== แผนที่เต็มจอ อยู่หลัง panel ===== */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={{
                    latitude: start.latitude,
                    longitude: start.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation
                showsMyLocationButton={false}
            >
                {sorted.map((item, index) => (
                    <Marker
                        key={item.id}
                        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
                        title={item.name}
                        description={item.description}
                        pinColor={item.id === currentId ? "#f21212" : "#3B82F6"}
                        zIndex={item.id === currentId ? 10 : 1}
                        onPress={() => selectAED(item, index, true)}
                    />
                ))}
            </MapView>

            {/* ===== panel ลากขึ้นลงได้ ===== */}
            {containerH > 0 && (
                <Animated.View style={[styles.panel, { height: panelH, transform: [{ translateY }] }]}>
                    {/* แถบหัว: ลากตรงนี้เพื่อเลื่อน panel */}
                    <View style={styles.header} {...panResponder.panHandlers}>
                        <View style={styles.handle} />
                        <Text style={styles.panelTitle}>จุดติดตั้ง AED ใกล้เคียง ({sorted.length})</Text>
                    </View>

                    <FlatList
                        ref={listRef}
                        data={sorted}
                        keyExtractor={(i) => i.id}
                        scrollEnabled={atTop}   // เลื่อนลิสต์ได้เฉพาะตอน panel ขึ้นสุด
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}
                        getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
                        ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีข้อมูลจุดติดตั้ง AED</Text>}
                        renderItem={({ item, index }) => {
                            const selected = item.id === currentId;
                            const st = STATUS_INFO[item.status] || STATUS_INFO.inactive;
                            return (
                                <TouchableOpacity
                                    style={[styles.row, selected && styles.rowSelected]}
                                    onPress={() => selectAED(item, index)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.badge, selected && { backgroundColor: "#f21212" }]}>
                                        <Text style={styles.badgeText}>{index + 1}</Text>
                                    </View>

                                    <View style={styles.info}>
                                        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.desc} numberOfLines={1}>{item.description || "-"}</Text>
                                        <View style={styles.statusRow}>
                                            <View style={[styles.dot, { backgroundColor: st.color }]} />
                                            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity style={styles.navBtn} onPress={() => openNavigation(item)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                        <Ionicons name="navigate" size={22} color={selected ? "#f21212" : "#000"} />
                                        <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#eeeeee" },

    panel: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#f5f5f5",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 12,
    },
    header: { height: HEADER_H, paddingHorizontal: 14, justifyContent: "center" },
    handle: {
        width: 40, height: 5, borderRadius: 3,
        backgroundColor: "#CBD5E1", alignSelf: "center", marginBottom: 8,
    },
    panelTitle: { fontSize: 16, fontWeight: "bold" },
    empty: { textAlign: "center", marginTop: 30, color: "#94A3B8" },

    row: {
        height: ROW_HEIGHT - 10,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 12,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#fff",
    },
    rowSelected: { backgroundColor: "#FFF1F1", borderColor: "#f21212" },

    badge: {
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: "#6B7280", alignItems: "center", justifyContent: "center",
    },
    badgeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

    info: { flex: 1, marginLeft: 12 },
    name: { fontSize: 15, fontWeight: "bold", color: "#111827" },
    desc: { fontSize: 13, color: "#64748B", marginTop: 1 },
    statusRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
    statusText: { fontSize: 12, fontWeight: "bold" },

    navBtn: { alignItems: "center", marginLeft: 8, minWidth: 56 },
    distance: { fontSize: 12, fontWeight: "bold", color: "#f21212", marginTop: 2 },
});

export default AEDMapScreen;