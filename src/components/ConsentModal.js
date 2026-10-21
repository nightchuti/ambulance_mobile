import React, { useState } from "react";
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SECTIONS = [
    {
        title: "ข้อมูลที่เก็บ",
        body: "เลขบัตรประชาชน 13 หลัก",
    },
    {
        title: "วัตถุประสงค์",
        body: "ใช้ยืนยันตัวตนผู้แจ้งเหตุเฉพาะกรณีที่สงสัยหรือพบการแจ้งเหตุเท็จ จะไม่นำไปใช้เพื่อการตลาดหรือวัตถุประสงค์อื่น",
    },
    {
        title: "วิธีเก็บรักษา",
        body: "เลขบัตรประจำตัวประชาชนจะถูกเข้ารหัสและบันทึกเก็บไว้ การถอดรหัสสามารถทำได้เฉพาะผู้ดูแลระบบที่ได้รับมอบหมาย เมื่อมีเหตุตามวัตถุประสงค์ข้างต้นเท่านั้น",
    },
    {
        title: "การเปิดเผยข้อมูล",
        body: "ไม่เปิดเผยแก่บุคคลภายนอก ยกเว้นเมื่อมีความจำเป็น ",
    },
];

const ConsentModal = ({ checked, onToggle }) => {
    const [visible, setVisible] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.row} onPress={onToggle} activeOpacity={0.7}>
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <View style={styles.content}>
                    <Text style={styles.text}>
                        ยินยอมให้เก็บเลขบัตรประชาชน เพื่อใช้ตรวจสอบกรณีมีการแจ้งเหตุเท็จ
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisible(true)} style={styles.detailButton}>
                <Text style={styles.detailText}>ดูรายละเอียดการใช้ข้อมูล</Text>
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <Text style={styles.title}>การเก็บและใช้เลขบัตรประชาชน</Text>

                        <ScrollView style={{ flexGrow: 0 }}>
                            {SECTIONS.map((s, i) => (
                                <View key={s.title} style={styles.section}>
                                    <Text style={styles.sectionTitle}>{i + 1}. {s.title}</Text>
                                    <Text style={styles.sectionBody}>{s.body}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity style={styles.closeButton} onPress={() => setVisible(false)}>
                            <Text style={styles.closeText}>รับทราบ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 4,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
    },
    content: {
        flex: 1,
    },
    text: {
        fontSize: 14,
        color: "#333",
    },
    detailButton: {
        marginTop: 4,
        marginLeft: 32,
    },
    detailText: {
        fontSize: 13,
        color: "#2196F3",
    },

    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    sheet: {
        maxHeight: "85%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
    section: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "bold",
        marginBottom: 4,
    },
    sectionBody: {
        fontSize: 14,
        lineHeight: 22,
        color: "#475569",
    },
    closeButton: {
        marginTop: 8,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#2196F3",
        alignItems: "center",
    },
    closeText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
    },
});

export default ConsentModal;