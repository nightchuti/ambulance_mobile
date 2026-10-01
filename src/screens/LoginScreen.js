import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import TextFormInput from "../components/TextFormInput";

const LoginScreen = ({ navigation }) => {

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
                />
                <TextFormInput 
                    label="รหัสผ่าน" 
                    placeholder="กรอกรหัสผ่านของคุณ" 
                    secureTextEntry={true} 
                />
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.loginButtonText}>เข้าสู่ระบบ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.forgotPasswordButton} onPress={() => navigation.navigate('Home')}>
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