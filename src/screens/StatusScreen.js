import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from "react-native";
import { subscribeIncident, subscribeTimeline, cancelIncident } from "../services/incidentService";
import { STATUS_FLOW, STATUS_LABEL, STATUS_COLOR, getTypeInfo, getSeverityInfo, formatDateTime } from "../constants/incident";

const StatusScreen = ({ route, navigation }) => {
    const { incidentId } = route.params;
    const [incident, setIncident] = useState(null);
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        const u1 = subscribeIncident(incidentId, setIncident, () => Alert.alert("ผิดพลาด", "โหลดสถานะไม่สำเร็จ"));
        const u2 = subscribeTimeline(incidentId, setTimeline);
        return () => { u1(); u2(); };
    }, [incidentId]);

    if (!incident) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    const { status } = incident;
    const cancelled = status === "cancelled";
    const currentIdx = STATUS_FLOW.indexOf(status);
    const type = getTypeInfo(incident.type);
    const severity = getSeverityInfo(incident.severity);
    const finished = status === "completed" || cancelled;

    const onCancel = () =>
        Alert.alert("ยกเลิกการแจ้งเหตุ?", "เจ้าหน้าที่ยังไม่ได้รับเรื่อง", [
            { text: "ไม่" },
            { text: "ยกเลิกเหตุ", style: "destructive", onPress: () => cancelIncident(incidentId).catch(() => Alert.alert("ผิดพลาด", "ยกเลิกไม่สำเร็จ")) },
        ]);

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.banner, { backgroundColor: STATUS_COLOR[status] }]}>
                <Text style={styles.bannerText}>{STATUS_LABEL[status]}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>{type.title}{severity ? `  •  ${severity.title}` : ""}</Text>
                <Text style={styles.sub}>{incident.address}</Text>
                <Text style={styles.sub}>แจ้งเมื่อ {formatDateTime(incident.createdAt)}</Text>
            </View>

            {incident.assignedTo && !cancelled && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>เจ้าหน้าที่ที่รับผิดชอบ</Text>
                    <Text style={styles.sub}>{incident.assignedTo.name}{incident.assignedTo.vehicle ? `  (${incident.assignedTo.vehicle})` : ""}</Text>
                    {incident.assignedTo.phone ? (
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${incident.assignedTo.phone}`)}>
                            <Text style={styles.link}>โทร {incident.assignedTo.phone}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            )}

            {!cancelled && (
                <View style={styles.card}>
                    {STATUS_FLOW.map((s, i) => {
                        const done = i <= currentIdx;
                        return (
                            <View key={s} style={styles.step}>
                                <View style={[styles.dot, done && { backgroundColor: STATUS_COLOR[s] }]} />
                                <Text style={done ? styles.stepActive : styles.stepText}>{STATUS_LABEL[s]}</Text>
                            </View>
                        );
                    })}
                </View>
            )}

            <View style={styles.card}>
                <Text style={styles.cardTitle}>ความคืบหน้า</Text>
                {timeline.map((t) => (
                    <View key={t.id} style={styles.tlRow}>
                        <Text style={styles.tlTime}>{formatDateTime(t.at)}</Text>
                        <Text style={styles.tlNote}>{STATUS_LABEL[t.status]}{t.note ? ` — ${t.note}` : ""}</Text>
                    </View>
                ))}
            </View>

            {status === "pending" && (
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                    <Text style={styles.cancelText}>ยกเลิกการแจ้งเหตุ</Text>
                </TouchableOpacity>
            )}
            {finished && (
                <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.popToTop()}>
                    <Text style={styles.homeText}>กลับหน้าหลัก</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },
    banner: { padding: 20, alignItems: "center" },
    bannerText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
    card: { backgroundColor: "#fff", margin: 12, marginBottom: 0, padding: 14, borderRadius: 12 },
    cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 6 },
    sub: { fontSize: 14, color: "#475569", marginTop: 2 },
    link: { color: "#1E90FF", fontSize: 15, marginTop: 6 },
    step: { flexDirection: "row", alignItems: "center", paddingVertical: 6 },
    dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#CBD5E1", marginRight: 10 },
    stepText: { color: "#94A3B8", fontSize: 15 },
    stepActive: { color: "#0F172A", fontSize: 15, fontWeight: "bold" },
    tlRow: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    tlTime: { fontSize: 12, color: "#94A3B8" },
    tlNote: { fontSize: 14, color: "#1E293B" },
    cancelBtn: { margin: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#f21212", alignItems: "center", backgroundColor: "#fff" },
    cancelText: { color: "#f21212", fontWeight: "bold", fontSize: 16 },
    homeBtn: { margin: 12, padding: 14, borderRadius: 10, backgroundColor: "#f21212", alignItems: "center" },
    homeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default StatusScreen;