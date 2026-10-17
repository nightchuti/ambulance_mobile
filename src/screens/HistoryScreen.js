import React, { useEffect, useState, useLayoutEffect } from "react";
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { subscribeMyIncidents, hideIncident } from "../services/incidentService";
import {
    INCIDENT_TYPES, getTypeInfo, isActiveStatus,
    STATUS_LABEL, STATUS_COLOR, formatDateTime,
} from "../constants/incident";

const MAIN_FILTERS = [
    { key: "all", title: "ทั้งหมด" },
    { key: "quick", title: "เหตุด่วน" },
    { key: "detailed", title: "เหตุธรรมดา" },
];

const HistoryScreen = ({ navigation }) => {
    const { authUser } = useUser();
    const [items, setItems] = useState(null);
    const [filter, setFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState([]);    // id ที่ติ๊กไว้

    useEffect(() => {
        return subscribeMyIncidents(authUser.uid, setItems, (e) => {
            console.error(e);
            setItems([]);
            Alert.alert("ผิดพลาด", "โหลดประวัติไม่สำเร็จ");
        });
    }, [authUser.uid]);

    const exitSelect = () => {
        setSelecting(false);
        setSelected([]);
    };

    // ปุ่มขวาบน: ถังขยะ / เสร็จ
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () =>
                selecting ? (
                    <TouchableOpacity onPress={exitSelect}>
                        <Text style={styles.headerText}>เสร็จ</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={() => setSelecting(true)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                ),
        });
    }, [navigation, selecting]);

    const selectFilter = (key) => {
        setFilter(key);
        setSelected([]);   // เปลี่ยนตัวกรองแล้วล้างรายการที่ติ๊กไว้
    };

    // กดประเภทย่อยซ้ำ = กลับไปที่ "เหตุธรรมดา" ทั้งหมด
    const selectSubType = (key) => selectFilter(filter === key ? "detailed" : key);

    const toggleSelect = (id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const handleDelete = () =>
        Alert.alert("ลบประวัติ?", `ลบ ${selected.length} รายการออกจากประวัติของคุณ`, [
            { text: "ยกเลิก", style: "cancel" },
            {
                text: "ลบ", style: "destructive",
                onPress: async () => {
                    try {
                        await Promise.all(selected.map(hideIncident));
                        exitSelect();
                    } catch {
                        Alert.alert("ผิดพลาด", "ลบไม่สำเร็จ");
                    }
                },
            },
        ]);

    if (!items) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    const typeKeys = INCIDENT_TYPES.map((t) => t.key);
    const isDetailedGroup = filter === "detailed" || typeKeys.includes(filter);

    const visible = items.filter((i) => {
        if (i.hiddenByUser) return false;
        if (filter === "all") return true;
        if (filter === "quick") return i.mode === "quick";
        if (filter === "detailed") return i.mode === "detailed";
        return i.mode === "detailed" && i.type === filter;   // ประเภทย่อย
    });

    return (
        <View style={styles.container}>
            {/* แถบตัวกรองแถวเดียว */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={styles.filterBar} contentContainerStyle={{ paddingHorizontal: 12 }}>
                {MAIN_FILTERS.map((f) => {
                    const on = f.key === "detailed" ? isDetailedGroup : filter === f.key;
                    return (
                        <TouchableOpacity key={f.key}
                            style={[styles.chip, on && styles.chipSelected]}
                            onPress={() => selectFilter(f.key)}>
                            <Text style={[styles.chipText, on && { color: "#fff" }]}>{f.title}</Text>
                        </TouchableOpacity>
                    );
                })}

                {/* ประเภทย่อย แทรกต่อท้ายเมื่ออยู่ในหมวดเหตุธรรมดา */}
                {isDetailedGroup && INCIDENT_TYPES.map((t) => {
                    const on = filter === t.key;
                    return (
                        <TouchableOpacity key={t.key}
                            style={[styles.chip, on && { backgroundColor: "#888", borderColor: "#888" }]}
                            onPress={() => selectSubType(t.key)}>
                            <Text style={[styles.chipText, on && { color: "#fff" }]}>{t.title}</Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <FlatList
                data={visible}
                keyExtractor={(i) => i.id}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={<Text style={styles.empty}>ไม่มีประวัติการแจ้งเหตุ</Text>}
                renderItem={({ item }) => {
                    const t = getTypeInfo(item.type);
                    const deletable = !isActiveStatus(item.status);
                    const checked = selected.includes(item.id);
                    const active = isActiveStatus(item.status);

                    // โหมดเลือกลบ: เหตุที่ยังไม่จบจะกดเลือกไม่ได้
                    const onPress = selecting
                        ? () => deletable && toggleSelect(item.id)
                        : () => navigation.navigate("Status", { incidentId: item.id });

                    return (
                        <TouchableOpacity
                            style={[
                                styles.row,
                                active && styles.rowActive,
                                selecting && !deletable && { opacity: 0.4 },
                            ]}
                            onPress={onPress}
                        >
                            {selecting && (
                                <MaterialCommunityIcons
                                    name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24}
                                    color={checked ? "#f21212" : "#94A3B8"}
                                    style={{ marginRight: 10 }}
                                />
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={styles.title}>{t.title}</Text>
                                <Text style={styles.sub} numberOfLines={1}>{item.address}</Text>
                                <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
                            </View>
                            <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>
                                {STATUS_LABEL[item.status]}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* แถบลบด้านล่าง แสดงเมื่ออยู่โหมดเลือก */}
            {selecting && (
                <TouchableOpacity
                    style={[styles.deleteBar, selected.length === 0 && { opacity: 0.4 }]}
                    onPress={handleDelete}
                    disabled={selected.length === 0}
                >
                    <Text style={styles.deleteBarText}>ลบที่เลือก ({selected.length})</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    headerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

    tabRow: { flexDirection: "row", margin: 12, marginBottom: 0, backgroundColor: "#E2E8F0", borderRadius: 12, padding: 3 },
    tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
    tabSelected: { backgroundColor: "#f21212" },
    tabText: { fontSize: 15, fontWeight: "bold", color: "#334155" },

    filterBar: { flexGrow: 0, paddingVertical: 10 },
    chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#fff", marginRight: 8, borderWidth: 1, borderColor: "#E2E8F0" },
    chipSelected: { backgroundColor: "#f21212", borderColor: "#f21212" },
    chipText: { fontSize: 14, color: "#334155" },

    row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 10 },
    title: { fontSize: 16, fontWeight: "bold" },
    sub: { fontSize: 13, color: "#64748B", marginTop: 2 },
    time: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
    status: { fontSize: 12, fontWeight: "bold", maxWidth: 90, textAlign: "right" },
    empty: { textAlign: "center", marginTop: 40, color: "#94A3B8" },
    rowActive: { borderWidth: 1, borderColor: "#f21212", backgroundColor: "#FFF5F5" },

    deleteBar: { margin: 12, padding: 14, borderRadius: 10, backgroundColor: "#f21212", alignItems: "center" },
    deleteBarText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default HistoryScreen;