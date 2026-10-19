import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, PanResponder } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "../context/LocationContext";
import { subscribeAEDs, sortByDistance, formatDistance } from "../services/aedService";

const FALLBACK = { latitude: 14.0239, longitude: 99.9752 };
const ROW_HEIGHT = 88;
const HEADER_H = 64;
const PANEL_FRAC = 0.8; //ความสูงสูงสุดของpanel 80% ของจอ
const MID_FRAC = 0.4; //ระดับกลาง 40% ของหน้าจอ
const ZOOM = 0.004;

const STATUS_INFO = {
    active: { label: "พร้อมใช้งาน", color: "#16A34A" },
    inactive: { label: "ไม่พร้อมใช้งาน", color: "#94A3B8" },
};

const AEDMapScreen = () => {
    const { location } = useLocation();
    const [aeds, setAeds] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [containerH, setContainerH] = useState(0);
    const [atTop, setAtTop] = useState(false);

    const mapRef = useRef(null);
    const listRef = useRef(null);

    //แสดง AED
    useEffect(() => {
        return subscribeAEDs(setAeds, (e) => {
            console.warn(e);
            setAeds([]);
        });
    }, []);

    const sorted = useMemo(
        () => sortByDistance(aeds || [], location),
        [aeds, location]
    );

    //เลือก AED
    const nearest = sorted[0];
    const currentId = selectedId ?? nearest?.id;

    //panel ที่เลื่อนๆ
    const panelH = containerH * PANEL_FRAC;
    const snaps = {
        top: 0,
        mid: panelH - containerH * MID_FRAC,
        bottom: panelH - HEADER_H,
    };
    const snapsRef = useRef(snaps);
    snapsRef.current = snaps;

    const translateY = useRef(new Animated.Value(0)).current;
    const currentY = useRef(0);
    const startY = useRef(0);

    const snapTo = (y) => {
        currentY.current = y;
        setAtTop(y === snapsRef.current.top);
        Animated.spring(translateY, { toValue: y, useNativeDriver: true, bounciness: 4 }).start();
    };

    useEffect(() => {
        if (containerH > 0) {
            currentY.current = snapsRef.current.mid;
            translateY.setValue(snapsRef.current.mid);
        }
    }, [containerH]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => { startY.current = currentY.current; },
            onPanResponderMove: (_, g) => {
                const { top, bottom } = snapsRef.current;
                const y = Math.min(Math.max(startY.current + g.dy, top), bottom);
                currentY.current = y;
                translateY.setValue(y);
            },
            onPanResponderRelease: (_, g) => {
                const { top, mid, bottom } = snapsRef.current;
                const target = currentY.current + g.vy * 150;
                const nearestSnap = [top, mid, bottom].reduce((a, b) =>
                    Math.abs(b - target) < Math.abs(a - target) ? b : a
                );
                snapTo(nearestSnap);
            },
        })
    ).current;

    //เลื่อนแผนที่หา AED ที่เลือก
    const focusMap = (item) => {
        mapRef.current?.animateToRegion(
            {
                latitude: item.latitude - ZOOM * (MID_FRAC / 2),
                longitude: item.longitude,
                latitudeDelta: ZOOM,
                longitudeDelta: ZOOM,
            },
            500
        );
    };

    const selectAED = (item, index, scrollList = false) => {
        setSelectedId(item.id);
        snapTo(snapsRef.current.mid);
        focusMap(item);
        if (scrollList)
            listRef.current?.scrollToIndex({
                index,
                animated: true,
                viewPosition: 0
            });
    };

    useEffect(() => {
        if (nearest && selectedId === null) focusMap(nearest);
    }, [nearest?.id]);

    if (!aeds) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    const start = nearest || location || FALLBACK;

    return (
        <View style={styles.container} onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}>
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

            {containerH > 0 && (
                <Animated.View style={[styles.panel, { height: panelH, transform: [{ translateY }] }]}>
                    <View style={styles.header} {...panResponder.panHandlers}>
                        <View style={styles.handle} />
                        <Text style={styles.panelTitle}>จุดติดตั้ง AED ใกล้เคียง ({sorted.length})</Text>
                    </View>

                    <FlatList
                        ref={listRef}
                        data={sorted}
                        keyExtractor={(i) => i.id}
                        scrollEnabled={atTop}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 20 }}
                        getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
                        ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีข้อมูลจุดติดตั้ง AED</Text>}
                        renderItem={({ item, index }) => {
                            const selected = item.id === currentId;
                            const status = STATUS_INFO[item.status] || STATUS_INFO.inactive;
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
                                            <View style={[styles.dot, { backgroundColor: status.color }]} />
                                            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.distanceBox}>
                                        <Ionicons name="navigate" size={22} color={selected ? "#f21212" : "#000"} />
                                        <Text style={[styles.distance, selected && { color: "#f21212" }]}>{formatDistance(item.distance)}</Text>
                                    </View>
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
    container: { 
        flex: 1, 
        backgroundColor: "#eeeeee" 
    },

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
    header: { 
        height: HEADER_H, 
        paddingHorizontal: 14, 
        justifyContent: "center" 
    },
    handle: {
        width: 40, 
        height: 5, 
        borderRadius: 3,
        backgroundColor: "#CBD5E1", 
        alignSelf: "center", 
        marginBottom: 8,
    },
    panelTitle: { 
        fontSize: 16, 
        fontWeight: "bold" 
    },
    empty: { 
        textAlign: "center", 
        marginTop: 30, 
        color: "#94A3B8" 
    },

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
    rowSelected: { 
        backgroundColor: "#FFF1F1", 
        borderColor: "#f21212" 
    },

    badge: {
        width: 34, 
        height: 34, 
        borderRadius: 17,
        backgroundColor: "#6B7280", 
        alignItems: "center", 
        justifyContent: "center",
    },
    badgeText: { 
        color: "#fff", 
        fontWeight: "bold", 
        fontSize: 16 
    },

    info: { 
        flex: 1, 
        marginLeft: 12 
    },
    name: { 
        fontSize: 15, 
        fontWeight: "bold", 
        color: "#111827" 
    },
    desc: { 
        fontSize: 13, 
        color: "#64748B", 
        marginTop: 1 
    },
    statusRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        marginTop: 3 
    },
    dot: { 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        marginRight: 5 
    },
    statusText: { 
        fontSize: 12, 
        fontWeight: "bold" 
    },

    distanceBox: { 
        alignItems: "center", 
        marginLeft: 8, 
        minWidth: 56 
    },
    distance: { 
        fontSize: 12, 
        fontWeight: "bold", 
        color: "#000", 
        marginTop: 2 
    },
});

export default AEDMapScreen;