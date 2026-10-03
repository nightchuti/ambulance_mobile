import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import TextFormInput from "../components/TextFormInput";
import SelectFormInput from "../components/SelectFormInput";
import DateFormInput from "../components/DateFormInput";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const RegisterScreen = ({ navigation }) => {

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [gender, setGender] = useState("");
    const [birthDate, setBirthDate] = useState(null);
    const [idcard, setIDcard] = useState("");
    const [number, setNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [consent, setConsent] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (setValue, fieldName) => (value) => {
        setValue(value);
        setFormErrors((prevErrors) => ({ ...prevErrors, [fieldName]: "" }));
    };

    const handleRegister = async () => {
        if (loading) return;

        const cleanFirstname = firstname.trim();
        const cleanLastname = lastname.trim();
        const cleanEmail = email.trim().toLowerCase();
        const errors = {};

        //ชื่อ
        if (!cleanFirstname) {
            errors.firstname = "กรุณากรอกชื่อ";
        } else if (!/^[ก-๙a-zA-Z\s]{2,30}$/.test(cleanFirstname)) {
            errors.firstname = "ชื่อต้องเป็นตัวอักษรไทยหรืออังกฤษ 2-30 ตัว";
        }
        //นามสกุล
        if (!cleanLastname) {
            errors.lastname = "กรุณากรอกนามสกุล";
        } else if (!/^[ก-๙a-zA-Z\s]{2,30}$/.test(cleanLastname)) {
            errors.lastname = "นามสกุลต้องเป็นตัวอักษรไทยหรืออังกฤษ 2-30 ตัว";
        }
        //เพศ
        if (!gender) {
            errors.gender = "กรุณาเลือกเพศ";
        }
        //วันเกิด
        if (!birthDate) {
            errors.birthDate = "กรุณากรอกวันเกิดให้ถูกต้อง (วว/ดด/ปปปป)";
        } else {
            const today = new Date();
            if (birthDate > today) {
                errors.birthDate = "กรุณาตรวจสอบวันที่และปีที่กรอกอีกครั้ง";
            }
        }
        //เลขบัตรประชาชน
        if (!idcard) {
            errors.idcard = "กรุณากรอกเลขบัตรประชาชน";
        } else if (!/^[1-9]\d{12}$/.test(idcard)) {
            errors.idcard = "เลขบัตรประชาชนต้องมี 13 หลัก";
        } else {
            let sum = 0;
            for (let i = 0; i < 12; i++) {
                sum += idcard[i] * (13 - i);
            }
            const checkDigit = (11 - sum % 11) % 10;
            if (checkDigit != idcard[12]) {
                errors.idcard = "เลขบัตรประชาชนไม่ถูกต้อง";
            }
        }
        //เบอร์โทร
        if (!number) {
            errors.number = "กรุณากรอกเบอร์โทรศัพท์";
        } else if (!/^0[689]\d{8}$/.test(number)) {
            errors.number = "ต้องเป็นเบอร์มือถือ 10 หลัก เช่น 08xxxxxxxx";
        }
        //อีเมล
        if (!cleanEmail) {
            errors.email = "กรุณากรอกอีเมล";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        //รหัสผ่าน
        if (!password) {
            errors.password = "กรุณากรอกรหัสผ่าน";
        } else if (password.length < 8) {
            errors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
        } else if (/\s/.test(password)) {
            errors.password = "รหัสผ่านห้ามมีช่องว่าง";
        } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
            errors.password = "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข";
        } else if (password === idcard || password === number || password === cleanEmail) {
            errors.password = "รหัสผ่านต้องไม่เหมือนข้อมูลส่วนตัว";
        }
        //ยืนยันรหัสผ่าน
        if (!confirmPassword) {
            errors.confirmPassword = "กรุณายืนยันรหัสผ่าน";
        } else if (password !== confirmPassword) {
            errors.confirmPassword = "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน";
        }

        setFormErrors(errors);

        //มีerrorให้หยุด
        if (Object.keys(errors).length > 0) return;

        if (!consent) {
            Alert.alert(
                "กรุณายืนยันการยินยอม",
                "กรุณายินยอมให้เก็บและใช้ข้อมูลเลขบัตรประชาชนก่อนสมัครสมาชิก"
            );
            return;
        }

        //เริ่มสมัคร
        setLoading(true);
        let newUser = null;
        try {
            const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
            newUser = result.user;

            await setDoc(doc(db, "users", newUser.uid), {
                firstname: cleanFirstname,
                lastname: cleanLastname,
                gender: gender,
                birthDate: birthDate.toISOString(),
                idcard: idcard,
                phone: number,
                email: cleanEmail,
                consent: true,
                consentAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
            navigation.replace("Home")
        } catch (error) {
            if (newUser) {
                try { await deleteUser(newUser); } catch (e) { }
            }
            if (error.code === "auth/email-already-in-use") {
                setFormErrors({ email: "อีเมลนี้ถูกใช้งานแล้ว" });
            } else if (error.code === "auth/invalid-email") {
                setFormErrors({ email: "รูปแบบอีเมลไม่ถูกต้อง" });
            } else if (error.code === "auth/weak-password") {
                setFormErrors({ password: "รหัสผ่านง่ายเกินไป" });
            } else if (error.code === "auth/network-request-failed") {
                Alert.alert("ผิดพลาด", "เชื่อมต่ออินเทอร์เน็ตไม่ได้ กรุณาลองใหม่");
            } else if (error.code === "auth/too-many-requests") {
                Alert.alert("ผิดพลาด", "ลองหลายครั้งเกินไป กรุณารอสักครู่");
            } else if (error.code === "permission-denied") {
                Alert.alert("ผิดพลาด", "ไม่มีสิทธิ์บันทึกข้อมูล กรุณาติดต่อผู้ดูแลระบบ");
            } else {
                Alert.alert("ผิดพลาด", "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="height"
        >
            <ScrollView style={styles.container}>

                <View style={styles.logosection}>
                    <Image source={require('../../assets/logo.png')} style={styles.logo} />
                </View>
                <Text style={styles.title}>KPS Ambulance</Text>

                <View style={styles.formSection}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <View style={{ flex: 1 }}>
                            <TextFormInput
                                label="ชื่อ"
                                placeholder="กรอกชื่อของคุณ"
                                value={firstname}
                                onChangeText={handleChange(setFirstname, "firstname")}
                                error={formErrors.firstname}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <TextFormInput
                                label="นามสกุล"
                                placeholder="กรอกนามสกุลของคุณ"
                                value={lastname}
                                onChangeText={handleChange(setLastname, "lastname")}
                                error={formErrors.lastname}
                            />
                        </View>
                    </View>
                    <SelectFormInput
                        label="เพศ"
                        value={gender}
                        onValueChange={handleChange(setGender, "gender")}
                        placeholder="เลือกเพศของคุณ"
                        options={["ชาย", "หญิง", "อื่นๆ"]}
                        error={formErrors.gender}
                    />
                    <DateFormInput
                        label="วันเกิด"
                        placeholder="กรอกวัน/เดือน/ปี (ค.ศ.)"
                        value={birthDate}
                        onChange={handleChange(setBirthDate, "birthDate")}
                        error={formErrors.birthDate}
                    />
                    <TextFormInput
                        label="เลขบัตรประชาชน"
                        placeholder="กรอกเลขบัตรประชาชนของคุณ"
                        value={idcard}
                        onChangeText={handleChange(setIDcard, "idcard")}
                        keyboardType="number-pad"
                        maxLength={13}
                        error={formErrors.idcard}
                    />
                    <TextFormInput
                        label="เบอร์โทรศัพท์"
                        placeholder="0xxxxxxxxx"
                        value={number}
                        onChangeText={handleChange(setNumber, "number")}
                        keyboardType="phone-pad"
                        maxLength={10}
                        error={formErrors.number}
                    />
                    <TextFormInput
                        label="อีเมล"
                        placeholder="กรอกอีเมลของคุณ"
                        value={email}
                        onChangeText={handleChange(setEmail, "email")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={formErrors.email}
                    />
                    <TextFormInput
                        label="รหัสผ่าน"
                        placeholder="กรอกรหัสผ่านของคุณ"
                        value={password}
                        onChangeText={handleChange(setPassword, "password")}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        error={formErrors.password}
                    />
                    <TextFormInput
                        label="ยืนยันรหัสผ่าน"
                        placeholder="กรอกยืนยันรหัสผ่านของคุณ"
                        value={confirmPassword}
                        onChangeText={handleChange(setConfirmPassword, "confirmPassword")}
                        secureTextEntry={true}
                        autoCapitalize="none"
                        error={formErrors.confirmPassword}
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

                    <TouchableOpacity
                        style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" style={{ paddingVertical: 10 }} />
                        ) : (
                            <Text style={styles.signUpButtonText}>สมัครสมาชิก</Text>
                        )}
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
        </KeyboardAvoidingView>
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
        marginBottom: 20,
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
        marginTop: 20,
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