import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator, } from "react-native";
import * as ImagePicker from "expo-image-picker";
import SelectFormInput from "../components/SelectFormInput";
import { useUser } from "../context/UserContext";
import { updateUserProfile, getUserPrivate } from "../services/userService";
import { uploadImage } from "../services/cloudinaryService";

const NAME_REGEX = /^[ก-๙a-zA-Z\s]{2,30}$/;
const PHONE_REGEX = /^0[689]\d{8}$/;
const GENDER_OPTIONS = ["ชาย", "หญิง", "อื่นๆ"];

const maskIdCard = (id) =>
    id?.length === 13 ? `${id[0]}-xxxx-xxxxx-${id.slice(10, 12)}-${id[12]}` : "-";

const Field = ({ label, children }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        {children}
    </View>
);

const TextField = ({ label, editing, display, ...inputProps }) => (
    <Field label={label}>
        {editing
            ? <TextInput style={styles.input} {...inputProps} />
            : <Text style={styles.value}>{display}</Text>}
    </Field>
);

const ProfileScreen = () => {
    const { authUser, profile } = useUser();
    const uid = authUser.uid;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [idcard, setIdcard] = useState("");
    const [form, setForm] = useState({ firstname: "", lastname: "", gender: "", phone: "" });

    const setField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

    //ดึงเลขบัตรเก็บใน state
    useEffect(() => {
        getUserPrivate(uid).then((d) => d && setIdcard(d.idcard)).catch(() => { });
    }, [uid]);

    if (!profile) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    const startEdit = () => {
        setForm({
            firstname: profile.firstname || "",
            lastname: profile.lastname || "",
            gender: profile.gender || "",
            phone: profile.phone || "",
        });
        setIsEditing(true);
    };

    const handleSave = async () => {
        const firstname = form.firstname.trim();
        const lastname = form.lastname.trim();
        const { gender, phone } = form;

        if (!NAME_REGEX.test(firstname) || !NAME_REGEX.test(lastname)) {
            return Alert.alert("ข้อมูลไม่ถูกต้อง", "ชื่อและนามสกุลต้องเป็นตัวอักษรไทยหรืออังกฤษ 2-30 ตัว");
        }
        if (!gender) return Alert.alert("ข้อมูลไม่ถูกต้อง", "กรุณาเลือกเพศ");
        if (!PHONE_REGEX.test(phone)) {
            return Alert.alert("ข้อมูลไม่ถูกต้อง", "เบอร์โทรต้องเป็นเบอร์มือถือ 10 หลัก");
        }

        setSaving(true);
        try {
            await updateUserProfile(uid, { firstname, lastname, gender, phone });
            setIsEditing(false);
        } catch {
            Alert.alert("ผิดพลาด", "บันทึกไม่สำเร็จ กรุณาลองใหม่");
        } finally {
            setSaving(false);
        }
    };

    const handleChangeProfileImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            return Alert.alert("ไม่ได้รับอนุญาต", "กรุณาอนุญาตให้แอปเข้าถึงรูปภาพ");
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (result.canceled) return;

        setSaving(true);
        try {
            const { url, publicId } = await uploadImage(result.assets[0].uri, `profiles/${uid}`);
            await updateUserProfile(uid, { photoURL: url, photoPublicId: publicId });
        } catch (error) {
            Alert.alert("ผิดพลาด", error?.message || "อัปโหลดรูปไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    const birthText = profile.birthDate
        ? new Date(profile.birthDate).toLocaleDateString("th-TH", { dateStyle: "long" })
        : "-";

    return (
        <ScrollView style={styles.container}>

            <View style={styles.profileSection}>
                <Image
                    source={profile.photoURL ? { uri: profile.photoURL } : require("../../assets/logo.png")}
                    style={styles.profileImage}
                />
                {isEditing && (
                    <TouchableOpacity onPress={handleChangeProfileImage} disabled={saving}>
                        <Text style={styles.changeImageText}>เปลี่ยนรูปโปรไฟล์</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TextField label="ชื่อ" editing={isEditing} display={profile.firstname}
                value={form.firstname} onChangeText={setField("firstname")} />
            <TextField label="นามสกุล" editing={isEditing} display={profile.lastname}
                value={form.lastname} onChangeText={setField("lastname")} />

            <Field label="เพศ">
                {isEditing ? (
                    <SelectFormInput
                        value={form.gender}
                        onValueChange={setField("gender")}
                        placeholder="เลือกเพศของคุณ"
                        options={GENDER_OPTIONS}
                    />
                ) : (
                    <Text style={styles.value}>{profile.gender}</Text>
                )}
            </Field>

            <Field label="วัน/เดือน/ปีเกิด">
                <Text style={styles.value}>{birthText}</Text>
            </Field>
            <Field label="เลขบัตรประชาชน">
                <Text style={styles.value}>{maskIdCard(idcard)}</Text>
            </Field>

            <TextField label="เบอร์โทรศัพท์" editing={isEditing} display={profile.phone}
                value={form.phone} onChangeText={setField("phone")}
                keyboardType="phone-pad" maxLength={10} />

            {isEditing ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)} disabled={saving}>
                        <Text style={styles.cancelText}>ยกเลิก</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                        {saving
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.buttonText}>บันทึก</Text>}
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.editButton} onPress={startEdit}>
                    <Text style={styles.buttonText}>แก้ไขข้อมูล</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f5f5f5",
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

export default ProfileScreen