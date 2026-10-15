import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useUser } from "../context/UserContext";
import { subscribeMyIncidents } from "../services/incidentService";
import { getTypeInfo, STATUS_LABEL, STATUS_COLOR, formatDateTime } from "../constants/incident";

const HistoryScreen = ({ navigation }) => {
    const { authUser } = useUser();
    const [items, setItems] = useState(null);

    useEffect(() => {
        return subscribeMyIncidents(authUser.uid, setItems, (e) => {
            console.error(e);
            setItems([]);
            Alert.alert("ผิดพลาด", "โหลดประวัติไม่สำเร็จ");
        });
    }, [authUser.uid]);

    if (!items) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    return (
        <FlatList
            style={{ backgroundColor: "#f5f5f5" }}
            data={items}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ padding: 12 }}
            ListEmptyComponent={<Text style={styles.empty}>ยังไม่มีประวัติการแจ้งเหตุ</Text>}
            renderItem={({ item }) => {
                const t = getTypeInfo(item.type);
                return (
                    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate("Status", { incidentId: item.id })}>
                        <MaterialCommunityIcons name={t.icon} size={30} color={t.color} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.title}>{t.title}</Text>
                            <Text style={styles.sub} numberOfLines={1}>{item.address}</Text>
                            <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
                        </View>
                        <Text style={[styles.status, { color: STATUS_COLOR[item.status] }]}>{STATUS_LABEL[item.status]}</Text>
                    </TouchableOpacity>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 10 },
    title: { fontSize: 16, fontWeight: "bold" },
    sub: { fontSize: 13, color: "#64748B", marginTop: 2 },
    time: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
    status: { fontSize: 12, fontWeight: "bold", maxWidth: 90, textAlign: "right" },
    empty: { textAlign: "center", marginTop: 40, color: "#94A3B8" },
});

export default HistoryScreen;