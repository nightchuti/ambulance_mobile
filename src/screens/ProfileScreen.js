import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
    const [isEditing, setIsEditing] = useState(false);

    const [firstName, setFirstName] = useState("ชุติมณฑน์");
    const [lastName, setLastName] = useState("อ่วมดีสุด");
    const [phone, setPhone] = useState("0812345678");
    const [gender, setGender] = useState("หญิง");
    const [profileImage, setProfileImage] = useState(null);

    const handleSave = () => {
        // ตรงนี้ภายหลังค่อยเอาไป update Firebase

        setIsEditing(false);
    };

    const handleChangeProfileImage = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            alert("กรุณาอนุญาตให้แอปเข้าถึงรูปภาพ");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>ข้อมูลส่วนตัว</Text>

            <View style={styles.profileSection}>
                <Image
                    source={
                        profileImage
                            ? { uri: profileImage }
                            : require("../../assets/logo.png")
                    }
                    style={styles.profileImage}
                />
                {isEditing && (
                    <TouchableOpacity
                        onPress={handleChangeProfileImage}
                    >
                        <Text style={styles.changeImageText}>
                            เปลี่ยนรูปโปรไฟล์
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>ชื่อ</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                ) : (
                    <Text style={styles.value}>
                        {firstName}
                    </Text>
                )}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>นามสกุล</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                    />
                ) : (
                    <Text style={styles.value}>
                        {lastName}
                    </Text>
                )}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>เพศ</Text>
                {isEditing ? (
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={gender}
                            onValueChange={(value) => setGender(value)}
                            style={styles.picker}
                            dropdownIconColor="#666"
                        >
                            <Picker.Item label="เลือกเพศ" value="" />
                            <Picker.Item label="ชาย" value="ชาย" />
                            <Picker.Item label="หญิง" value="หญิง" />
                            <Picker.Item label="อื่นๆ" value="อื่นๆ" />
                        </Picker>
                    </View>
                ) : (
                    <Text style={styles.value}>
                        {gender}
                    </Text>
                )}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>
                    วัน/เดือน/ปีเกิด
                </Text>
                <Text style={styles.value}>
                    1 มกราคม 2540
                </Text>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>
                    เลขบัตรประชาชน
                </Text>
                <Text style={styles.value}>
                    1-2345-67890-12-3
                </Text>
            </View>        

            <View style={styles.field}>
                <Text style={styles.label}>
                    เบอร์โทรศัพท์
                </Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />
                ) : (
                    <Text style={styles.value}>
                        {phone}
                    </Text>
                )}
            </View>

            {isEditing ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setIsEditing(false)}
                    >
                        <Text style={styles.cancelText}>
                            ยกเลิก
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>
                            บันทึก
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                >
                    <Text style={styles.buttonText}>
                        แก้ไขข้อมูล
                    </Text>
                </TouchableOpacity>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },

    profileSection: {
        alignItems: "center",
        marginBottom: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#ccc",
    },
    changeImageText: {
        color: "#1E90FF",
        fontSize: 14,
        marginBottom: 20,
    },

    field: {
        backgroundColor: "#fff",
        padding: 15,
        marginBottom: 12,
        borderRadius: 10,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    value: {
        fontSize: 16,
        color: "#000",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 16,
    },

    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        overflow: "hidden",
        height: 42,
    },
    picker: {
        height: 42,
        width: "100%",
        color: "#000",
    },

    editButton: {
        backgroundColor: "#f21212",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },

    buttonRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#f21212",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        backgroundColor: "#fff",
    },
    saveButton: {
        flex: 1,
        backgroundColor: "#f21212",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelText: {
        fontSize: 16,
        color: "#f21212",
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
    },
});