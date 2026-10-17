import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { subscribeIncident, subscribeTimeline, cancelIncident } from "../services/incidentService";
import {
    STATUS_FLOW, STATUS_LABEL, STATUS_COLOR,
    getTypeInfo, getSeverityInfo, formatShortTime,
} from "../constants/incident";

const incidentCode = (id) => `KPS-${id.slice(0, 8).toUpperCase()}`;

const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
);

const StatusScreen = ({ route, navigation }) => {
    const { incidentId } = route.params;
    const [incident, setIncident] = useState(undefined); // undefined = กำลังโหลด, null = ไม่พบ
    const [timeline, setTimeline] = useState([]);

    useEffect(() => {
        const u1 = subscribeIncident(incidentId, setIncident, () => Alert.alert("ผิดพลาด", "โหลดสถานะไม่สำเร็จ"));
        const u2 = subscribeTimeline(incidentId, setTimeline);
        return () => { u1(); u2(); };
    }, [incidentId]);

    if (incident === undefined) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
    if (incident === null) return <Text style={styles.notFound}>ไม่พบข้อมูลเหตุนี้</Text>;

    const { status } = incident;
    const cancelled = status === "cancelled";
    const completed = status === "completed";
    const finished = completed || cancelled;
    const currentIdx = STATUS_FLOW.indexOf(status);
    const type = getTypeInfo(incident.type);
    const severity = getSeverityInfo(incident.severity);

    // เวลาของแต่ละสถานะ (timeline เรียง asc อยู่แล้ว ตัวหลังสุดทับตัวก่อน)
    const timeByStatus = {};
    timeline.forEach((t) => { timeByStatus[t.status] = t.at; });

    const cardColor = finished ? STATUS_COLOR[status] : "#f21212";

    const onCancel = () =>
        Alert.alert("ยกเลิกการแจ้งเหตุ?", "เจ้าหน้าที่ยังไม่ได้รับเรื่อง", [
            { text: "ไม่" },
            {
                text: "ยกเลิกเหตุ", style: "destructive",
                onPress: () => cancelIncident(incidentId).catch(() => Alert.alert("ผิดพลาด", "ยกเลิกไม่สำเร็จ")),
            },
        ]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* การ์ดสรุปด้านบน */}
            <View style={[styles.hero, { backgroundColor: cardColor }]}>
                <Text style={styles.heroTitle}>{type.title}</Text>
                <Text style={styles.heroCode}>{incidentCode(incident.id)}</Text>
                <View style={styles.pill}>
                    <Text style={styles.pillText}>{STATUS_LABEL[status]}</Text>
                </View>
            </View>

            {/* เจ้าหน้าที่ที่รับผิดชอบ */}
            {incident.assignedTo && !cancelled && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>เจ้าหน้าที่ที่รับผิดชอบ</Text>
                    <Text style={styles.sub}>
                        {incident.assignedTo.name}{incident.assignedTo.vehicle ? `  (${incident.assignedTo.vehicle})` : ""}
                    </Text>
                    {incident.assignedTo.phone ? (
                        <TouchableOpacity onPress={() => Linking.openURL(`tel:${incident.assignedTo.phone}`)}>
                            <Text style={styles.link}>โทร {incident.assignedTo.phone}</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            )}

            {/* Timeline แนวตั้ง */}
            {!cancelled && (
                <View style={styles.card}>
                    {STATUS_FLOW.map((s, i) => {
                        const reached = i <= currentIdx;               // ผ่านแล้ว หรือกำลังอยู่ขั้นนี้
                        const isCurrent = i === currentIdx && !completed;
                        const isLast = i === STATUS_FLOW.length - 1;
                        return (
                            <View key={s} style={styles.stepRow}>
                                <View style={styles.stepLeft}>
                                    <View style={[styles.circle, { backgroundColor: reached ? "#22C55E" : "#D1D5DB" }]}>
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    </View>
                                    {!isLast && (
                                        <View style={[styles.line, { backgroundColor: i < currentIdx ? "#22C55E" : "#D1D5DB" }]} />
                                    )}
                                </View>
                                <View style={styles.stepBody}>
                                    <Text style={[styles.stepText, reached && styles.stepTextDone, isCurrent && styles.stepTextCurrent]}>
                                        {STATUS_LABEL[s]}
                                    </Text>
                                    {reached && !!timeByStatus[s] && (
                                        <Text style={styles.stepTime}>{formatShortTime(timeByStatus[s])}</Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* รายละเอียดเหตุการณ์ */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>รายละเอียดเหตุการณ์</Text>
                <InfoRow label="ประเภทเหตุการณ์" value={type.title} />
                {severity && <InfoRow label="ความรุนแรง" value={severity.title} />}
                <InfoRow label="ตำแหน่งเกิดเหตุ" value={incident.address} />
                <InfoRow label="รายละเอียดเพิ่มเติม" value={incident.description} />
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
    notFound: { textAlign: "center", marginTop: 40, color: "#94A3B8" },

    hero: { margin: 12, padding: 18, borderRadius: 16, alignItems: "center", elevation: 4 },
    heroTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
    heroCode: { color: "#fff", fontSize: 18, marginTop: 6, letterSpacing: 1 },
    pill: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.25)" },
    pillText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

    card: { backgroundColor: "#fff", marginHorizontal: 12, marginTop: 12, padding: 16, borderRadius: 16, elevation: 3 },
    cardTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
    sub: { fontSize: 14, color: "#475569", marginTop: 2 },
    link: { color: "#1E90FF", fontSize: 15, marginTop: 6 },

    stepRow: { flexDirection: "row" },
    stepLeft: { width: 28, alignItems: "center", marginRight: 12 },
    circle: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    line: { flex: 1, width: 2, minHeight: 22 },
    stepBody: { flex: 1, paddingBottom: 18 },
    stepText: { fontSize: 16, color: "#9CA3AF", marginTop: 3 },
    stepTextDone: { color: "#111827" },
    stepTextCurrent: { color: "#22C55E", fontWeight: "bold" },
    stepTime: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

    infoRow: { flexDirection: "row", paddingVertical: 6 },
    infoLabel: { width: 120, fontSize: 14, color: "#475569" },
    infoValue: { flex: 1, fontSize: 14, color: "#111827" },

    cancelBtn: { margin: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#f21212", alignItems: "center", backgroundColor: "#fff" },
    cancelText: { color: "#f21212", fontWeight: "bold", fontSize: 16 },
    homeBtn: { margin: 12, padding: 14, borderRadius: 10, backgroundColor: "#f21212", alignItems: "center" },
    homeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default StatusScreen;