import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import TextFormInput from "../components/TextFormInput";

const LoginScreen = ({ navigation }) => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const handleChange = (setValue, fieldName) => (newValue) => {
        setValue(newValue);
        setFormErrors((prevErrors) => ({ ...prevErrors, [fieldName]: "" }));
    };

    const handleLogin = async () => {
        if (loading) return;

        const cleanEmail = email.trim().toLowerCase();
        const errors = {};

        //อีเมล
        if (!cleanEmail) {
            errors.email = "กรุณากรอกอีเมล";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            errors.email = "รูปแบบอีเมลไม่ถูกต้อง";
        }
        //รหัสผ่าน
        if (!password) {
            errors.password = "กรุณากรอกรหัสผ่าน";
        }

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, cleanEmail, password);
        } catch (error) {
            if (error.code === "auth/invalid-credential" ||
                error.code === "auth/user-not-found" ||
                error.code === "auth/wrong-password") {
                setFormErrors({ password: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
            } else if (error.code === "auth/invalid-email") {
                setFormErrors({ email: "รูปแบบอีเมลไม่ถูกต้อง" });
            } else if (error.code === "auth/user-disabled") {
                Alert.alert("ผิดพลาด", "บัญชีนี้ถูกระงับการใช้งาน");
            } else if (error.code === "auth/too-many-requests") {
                Alert.alert("ผิดพลาด", "ลองหลายครั้งเกินไป กรุณารอสักครู่");
            } else if (error.code === "auth/network-request-failed") {
                Alert.alert("ผิดพลาด", "เชื่อมต่ออินเทอร์เน็ตไม่ได้ กรุณาลองใหม่");
            } else {
                Alert.alert("ผิดพลาด", "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (loading) return;

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setFormErrors({ email: "กรุณากรอกอีเมล" });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setFormErrors({ email: "รูปแบบอีเมลไม่ถูกต้อง" });
            return;
        }
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, cleanEmail);
        } catch (error) {
            if (error.code === "auth/network-request-failed") {
                Alert.alert("ผิดพลาด", "เชื่อมต่ออินเทอร์เน็ตไม่ได้ กรุณาลองใหม่");
                setLoading(false);
                return;
            }
            if (error.code === "auth/too-many-requests") {
                Alert.alert("ผิดพลาด", "ลองหลายครั้งเกินไป กรุณารอสักครู่");
                setLoading(false);
                return;
            }
        }
        setLoading(false);
        Alert.alert(
            "ส่งลิงก์แล้ว",
            "หากอีเมลนี้มีบัญชีอยู่ในระบบ เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้แล้ว กรุณาตรวจสอบกล่องจดหมาย (รวมถึงอีเมลขยะ)"
        );
    };
    return (
        <View style={styles.container}>
            <View style={styles.logosection}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} />
            </View>
            <Text style={styles.title}>KPS Ambulance</Text>
            <View style={styles.formSection}>
                <TextFormInput
                    label="อีเมล"
                    placeholder="example@email.com"
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

                <TouchableOpacity
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" style={{ paddingVertical: 10 }} />
                    ) : (
                        <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.forgotPasswordButton}
                    onPress={handleForgotPassword}
                >
                    <Text style={styles.forgotPasswordButtonText}>ลืมรหัสผ่าน ?</Text>
                </TouchableOpacity>

            </View>
            <View style={styles.signUpSection}>
                <Text style={styles.signUpText}>ยังไม่มีบัญชี? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.signUpButtonText}>สมัครสมาชิก</Text>
                </TouchableOpacity>
            </View>
        </View>
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
    loginButton: {
        marginTop: 18,
        marginHorizontal: 20,
        backgroundColor: "#f21212",
        borderRadius: 12,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        paddingVertical: 10
    },
    forgotPasswordButton: {
        marginTop: 10,
        marginBottom: 10,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    forgotPasswordButtonText: {
        fontSize: 14,
        alignSelf: "center",
        color: "#999",
    },
    signUpSection: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: "auto",
        marginBottom: 20,
        marginHorizontal: 20,
    },
    signUpText: {
        textAlign: "center",
        color: "#333",
        marginBottom: 10,
    },
    signUpButtonText: {
        textAlign: "center",
        color: "#f21212",
        fontWeight: "bold",
    }
});

export default LoginScreen;