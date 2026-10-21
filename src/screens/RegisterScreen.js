import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import TextFormInput from "../components/TextFormInput";
import SelectFormInput from "../components/SelectFormInput";
import DateFormInput from "../components/DateFormInput";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { sendRegisterOtp, verifyOtpAndRegister, otpErrorMessage } from "../services/otpService";

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

    // OTP
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const otpEmailRef = useRef("");

    // นับถอยหลังก่อนขอรหัสใหม่ได้
    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

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

        //ส่ง OTP ไปที่อีเมลก่อน แล้วค่อยให้กรอกรหัสเพื่อสมัคร
        setLoading(true);
        try {
            const res = await sendRegisterOtp(cleanEmail);
            otpEmailRef.current = cleanEmail;
            setOtp("");
            setOtpError("");
            setResendIn(res?.resendAfterSec ?? 60);
            setShowOtp(true);
        } catch (error) {
            const msg = otpErrorMessage(error);
            if (error?.message === "email-already-in-use" || error?.message === "invalid-email") {
                setFormErrors({ email: msg });
            } else {
                Alert.alert("ผิดพลาด", msg);
            }
        } finally {
            setLoading(false);
        }
    };

    //ขอ OTP ใหม่
    const handleResendOtp = async () => {
        if (otpLoading || resendIn > 0) return;
        setOtpLoading(true);
        setOtpError("");
        try {
            const res = await sendRegisterOtp(otpEmailRef.current);
            setOtp("");
            setResendIn(res?.resendAfterSec ?? 60);
        } catch (error) {
            setOtpError(otpErrorMessage(error));
        } finally {
            setOtpLoading(false);
        }
    };

    //ยืนยัน OTP -> สร้างบัญชี -> เข้าสู่ระบบ
    const handleVerifyOtp = async () => {
        if (otpLoading) return;
        if (!/^\d{6}$/.test(otp)) {
            setOtpError("กรุณากรอกรหัส OTP 6 หลัก");
            return;
        }
        setOtpLoading(true);
        setOtpError("");
        try {
            await verifyOtpAndRegister({
                email: otpEmailRef.current,
                otp,
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                gender,
                birthDate: birthDate.toISOString(),
                phone: number,
                idcard,
                password,
            });
        } catch (error) {
            const code = error?.message;
            const msg = otpErrorMessage(error);
            if (code === "email-already-in-use") {
                setShowOtp(false);
                setFormErrors({ email: msg });
            } else if (code === "weak-password") {
                setShowOtp(false);
                setFormErrors({ password: msg });
            } else {
                setOtpError(msg);
            }
            setOtpLoading(false);
            return;
        }

        //สมัครสำเร็จ -> ล็อกอินให้อัตโนมัติ (App จะพาไปหน้า Home เอง)
        try {
            await signInWithEmailAndPassword(auth, otpEmailRef.current, password);
        } catch (e) {
            setShowOtp(false);
            Alert.alert("สมัครสมาชิกสำเร็จ", "กรุณาเข้าสู่ระบบด้วยอีเมลและรหัสผ่านของคุณ");
            navigation.navigate("Login");
        } finally {
            setOtpLoading(false);
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
                    <View style={{ marginHorizontal: 12 }}>
                    <SelectFormInput
                        label="เพศ"
                        value={gender}
                        onValueChange={handleChange(setGender, "gender")}
                        placeholder="เลือกเพศของคุณ"
                        options={["ชาย", "หญิง", "อื่นๆ"]}
                        error={formErrors.gender}
                    />
                    </View>
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

                {/* Modal for OTP */}
                <Modal
                    visible={showOtp}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => { if (!otpLoading) setShowOtp(false); }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>ยืนยันอีเมล</Text>
                            <Text style={styles.modalText}>
                                ระบบส่งรหัส OTP 6 หลักไปที่ {otpEmailRef.current} แล้ว
                                (หมดอายุใน 5 นาที) หากไม่พบ กรุณาตรวจสอบในจดหมายขยะ
                            </Text>
                            <TextInput
                                style={[styles.otpInput, otpError ? styles.otpInputError : null]}
                                value={otp}
                                onChangeText={(v) => { setOtp(v.replace(/\D/g, "")); setOtpError(""); }}
                                keyboardType="number-pad"
                                maxLength={6}
                                placeholder="------"
                                placeholderTextColor="#bbb"
                                autoFocus
                            />
                            {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}

                            <TouchableOpacity
                                style={[styles.otpButton, otpLoading && styles.signUpButtonDisabled]}
                                onPress={handleVerifyOtp}
                                disabled={otpLoading}
                            >
                                {otpLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.otpButtonText}>ยืนยันและสมัครสมาชิก</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleResendOtp}
                                disabled={resendIn > 0 || otpLoading}
                                style={{ alignItems: "center", marginTop: 12 }}
                            >
                                <Text style={[styles.resendText, (resendIn > 0 || otpLoading) && { color: "#999" }]}>
                                    {resendIn > 0 ? `ขอรหัสใหม่ได้ใน ${resendIn} วินาที` : "ขอรหัส OTP ใหม่"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowOtp(false)}
                                disabled={otpLoading}
                            >
                                <Text style={styles.closeButtonText}>ยกเลิก</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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

    signUpButtonDisabled: {
        backgroundColor: "#ccc",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },

    modalText: {
        fontSize: 14,
        lineHeight: 22,
        color: "#333",
        marginBottom: 12,
    },

    closeButton: {
        backgroundColor: "#2196F3",
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 5,
    },

    closeButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "bold",
    },



    otpInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        fontSize: 28,
        letterSpacing: 8,
        textAlign: "center",
        paddingVertical: 10,
        marginBottom: 8,
        color: "#000",
    },
    otpInputError: {
        borderColor: "#f21212",
    },
    otpErrorText: {
        color: "#f21212",
        fontSize: 13,
        marginBottom: 8,
    },
    otpButton: {
        backgroundColor: "#f21212",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 8,
    },
    otpButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    resendText: {
        color: "#2196F3",
        fontSize: 14,
    },
});

export default RegisterScreen;