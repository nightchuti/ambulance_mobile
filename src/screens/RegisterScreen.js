import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import TextFormInput from "../components/TextFormInput";
import SelectFormInput from "../components/SelectFormInput";
import DateFormInput from "../components/DateFormInput";

const RegisterScreen = ({ navigation }) => {

    const [gender, setGender] = useState("");
    const [consent, setConsent] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const [birthDate, setBirthDate] = useState(null);

    return (
        <ScrollView style={styles.container}>

            <View style={styles.logosection}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} />
            </View>
            <Text style={styles.title}>KPS Ambulance</Text>

            <View style={styles.formSection}>
                <TextFormInput
                    label="ชื่อ"
                    placeholder="กรอกชื่อของคุณ"
                />
                <TextFormInput
                    label="นามสกุล"
                    placeholder="กรอกนามสกุลของคุณ"
                />
                <SelectFormInput
                    label="เพศ"
                    value={gender}
                    onValueChange={setGender}
                    placeholder="เลือกเพศของคุณ"
                    options={["ชาย", "หญิง", "อื่นๆ"]}
                />
                {/* <TextFormInput
                    label="วัน/เดือน/ปีเกิด"
                    placeholder="กรอกวัน/เดือน/ปีเกิดของคุณ"
                /> */}
                {/* //ยังไม่เทสปุ่มวันที่ */}
                <DateFormInput
                    label="วัน/เดือน/ปีเกิด"
                    placeholder="กรอกวัน/เดือน/ปีเกิดของคุณ"
                    value={birthDate}
                    onChange={setBirthDate}
                />
                <TextFormInput
                    label="เลขบัตรประชาชน"
                    placeholder="กรอกเลขบัตรประชาชนของคุณ"
                />
                <TextFormInput
                    label="เบอร์โทรศัพท์"
                    placeholder="0xx-xxx-xxxx"
                />
                <TextFormInput
                    label="อีเมล"
                    placeholder="กรอกอีเมลของคุณ"
                />
                <TextFormInput
                    label="รหัสผ่าน"
                    placeholder="กรอกรหัสผ่านของคุณ"
                    secureTextEntry={true}
                />
                <TextFormInput
                    label="ยืนยันรหัสผ่าน"
                    placeholder="กรอกยืนยันรหัสผ่านของคุณ"
                    secureTextEntry={true}
                />
                <View style={styles.consentContainer}>
                    <TouchableOpacity
                        style={styles.consentRow}
                        onPress={() => setConsent(!consent)}
                    >
                        <View style={[
                            styles.checkbox,
                            consent && styles.checkboxChecked
                        ]}>
                            {consent && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.consentContent}>
                        <Text style={styles.consentText}>
                            ยินยอมให้เก็บและใช้ข้อมูลเลขบัตรประชาชน
                        </Text>
                        <TouchableOpacity onPress={() => setShowConsent(true)}>
                            <Text style={styles.detailText}>
                                ดูรายละเอียดการใช้ข้อมูล
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.signUpButton}
                    onPress={() => {
                        if (!consent) {
                            return;
                        }
                        navigation.navigate('Home');
                    }}
                >
                    <Text style={styles.signUpButtonText}>สมัครสมาชิก</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.loginSection}>
                <Text style={styles.loginText}>มีบัญชีอยู่แล้ว? </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>
            </View>

            {/* Modal for consent details */}
            <Modal
                visible={showConsent}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowConsent(false)}
            >
                <View style={styles.modalOverlay}>

                    <View style={styles.modalContainer}>

                        <Text style={styles.modalTitle}>
                            การเก็บข้อมูลเลขบัตรประชาชน
                        </Text>

                        <Text style={styles.modalText}>
                            ระบบจะเก็บรวบรวมเลขบัตรประชาชนของคุณ
                            เพื่อใช้ในการยืนยันตัวตนและดำเนินการตาม
                            วัตถุประสงค์ของระบบ
                        </Text>

                        <Text style={styles.modalText}>
                            ข้อมูลจะถูกจัดเก็บในฐานข้อมูลของระบบ
                            และนำไปใช้ตามวัตถุประสงค์ที่แจ้งไว้
                        </Text>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowConsent(false)}
                        >
                            <Text style={styles.closeButtonText}>
                                ปิด
                            </Text>
                        </TouchableOpacity>

                    </View>

                </View>
            </Modal>


        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: "100%",
        backgroundColor: '#eeeeee',
    },
    logosection: {
        width: 150,
        height: 150,
        marginTop: 100,
        borderRadius: 30,
        alignSelf: "center",
        backgroundColor: "#f21212",
    },
    logo: {
        width: 100,
        height: 100,
        alignSelf: "center",
        marginTop: 25,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
        textAlign: "center",
        marginBottom: 20,
    },
    formSection: {
        marginTop: 10,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 5,
    },
    signUpButton: {
        marginTop: 10,
        marginHorizontal: 20,
        marginBottom: 10,
        backgroundColor: "#f21212",
        borderRadius: 12,
    },
    signUpButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        paddingVertical: 10
    },
    loginSection: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: "auto",
        marginBottom: 20,
        marginHorizontal: 20,
    },
    loginText: {
        textAlign: "center",
        color: "#333",
        marginBottom: 10,
    },
    loginButtonText: {
        textAlign: "center",
        color: "#f21212",
        fontWeight: "bold",
    },
    /////////////////////////////////////////

    consentContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
    },
    consentRow: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
    },
    consentContent: {
        flexDirection: "column",
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
    },
    checkboxChecked: {
        backgroundColor: "#2196F3",
        borderColor: "#2196F3",
    },
    checkmark: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    consentText: {
        fontSize: 14,
        color: "#333",
        flex: 1,
    },
    detailText: {
        fontSize: 13,
        color: "#2196F3",
    },

    // loginButtonDisabled: {
    //     backgroundColor: "#ccc",
    // },

    // modalOverlay: {
    //     flex: 1,
    //     backgroundColor: "rgba(0,0,0,0.5)",
    //     justifyContent: "center",
    //     paddingHorizontal: 20,
    // },

    // modalContainer: {
    //     backgroundColor: "#fff",
    //     borderRadius: 15,
    //     padding: 20,
    // },

    // modalTitle: {
    //     fontSize: 18,
    //     fontWeight: "bold",
    //     marginBottom: 15,
    // },

    // modalText: {
    //     fontSize: 14,
    //     lineHeight: 22,
    //     color: "#333",
    //     marginBottom: 12,
    // },

    // closeButton: {
    //     backgroundColor: "#2196F3",
    //     borderRadius: 10,
    //     paddingVertical: 10,
    //     alignItems: "center",
    //     marginTop: 5,
    // },

    // closeButtonText: {
    //     color: "#fff",
    //     fontSize: 15,
    //     fontWeight: "bold",
    // },


});

export default RegisterScreen;