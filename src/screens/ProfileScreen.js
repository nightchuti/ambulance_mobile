// import React, { useState } from "react";
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import * as ImagePicker from "expo-image-picker";
// import { useEffect, useState } from "react";
// import { ActivityIndicator } from "react-native";
// import { auth } from "../firebase/config";
// import { subscribeUserProfile, updateUserProfile, getUserPrivate } from "../services/userService";
// import { uploadImage } from "../services/cloudinaryService";

// const ProfileScreen = () => {

//     const [isEditing, setIsEditing] = useState(false);

//     const uid = auth.currentUser.uid;
//     const [profile, setProfile] = useState(null);
//     const [idcard, setIdcard] = useState("");
//     const [saving, setSaving] = useState(false);

//     const [firstName, setFirstName] = useState(null);
//     const [lastName, setLastName] = useState(null);
//     const [phone, setPhone] = useState(null);
//     const [gender, setGender] = useState(null);
//     const [profileImage, setProfileImage] = useState(null);

//     useEffect(() => {
//         const unsub = subscribeUserProfile(uid, (p) => {
//             setProfile(p);
//             if (p && !isEditing) {
//                 setFirstName(p.firstname); setLastName(p.lastname);
//                 setPhone(p.phone); setGender(p.gender);
//             }
//         }, (e) => Alert.alert("ผิดพลาด", "โหลดข้อมูลไม่สำเร็จ"));
//         getUserPrivate(uid).then((d) => d && setIdcard(d.idcard));
//         return unsub;
//     }, [uid]);

//     const handleSave = async () => {
//         setSaving(true);
//         try {
//             await updateUserProfile(uid, { firstname: firstName.trim(), lastname: lastName.trim(), gender, phone });
//             setIsEditing(false);
//         } catch { Alert.alert("ผิดพลาด", "บันทึกไม่สำเร็จ"); }
//         finally { setSaving(false); }
//     };

//     const handleChangeProfileImage = async () => {
//         const permission =
//             await ImagePicker.requestMediaLibraryPermissionsAsync();

//         if (!permission.granted) {
//             alert("กรุณาอนุญาตให้แอปเข้าถึงรูปภาพ");
//             return;
//         }

//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ["images"],
//             allowsEditing: true,
//             aspect: [1, 1],
//             quality: 0.8,
//         });

//         if (!result.canceled) {
//             setSaving(true);
//             try {
//                 const { url, publicId } = await uploadImage(result.assets[0].uri, `profiles/${uid}`);
//                 await updateUserProfile(uid, { photoURL: url, photoPublicId: publicId });
//             } catch { Alert.alert("ผิดพลาด", "อัปโหลดรูปไม่สำเร็จ"); }
//             finally { setSaving(false); }
//         }
//     };

//     return (
//         <ScrollView style={styles.container}>
//             {/* <Text style={styles.title}>ข้อมูลส่วนตัว</Text> */}

//             <View style={styles.profileSection}>
//                 <Image
//                     source={
//                         profileImage
//                             ? { uri: profileImage }
//                             : require("../../assets/logo.png")
//                     }
//                     style={styles.profileImage}
//                 />
//                 {isEditing && (
//                     <TouchableOpacity
//                         onPress={handleChangeProfileImage}
//                     >
//                         <Text style={styles.changeImageText}>
//                             เปลี่ยนรูปโปรไฟล์
//                         </Text>
//                     </TouchableOpacity>
//                 )}
//             </View>

//             <View style={styles.field}>
//                 <Text style={styles.label}>ชื่อ</Text>
//                 {isEditing ? (
//                     <TextInput
//                         style={styles.input}
//                         value={firstName}
//                         onChangeText={setFirstName}
//                     />
//                 ) : (
//                     <Text style={styles.value}>
//                         {firstName}
//                     </Text>
//                 )}
//             </View>

//             <View style={styles.field}>
//                 <Text style={styles.label}>นามสกุล</Text>
//                 {isEditing ? (
//                     <TextInput
//                         style={styles.input}
//                         value={lastName}
//                         onChangeText={setLastName}
//                     />
//                 ) : (
//                     <Text style={styles.value}>
//                         {lastName}
//                     </Text>
//                 )}
//             </View>

//             <View style={styles.field}>
//                 <Text style={styles.label}>เพศ</Text>
//                 {isEditing ? (
//                     <View style={styles.pickerWrapper}>
//                         <Picker
//                             selectedValue={gender}
//                             onValueChange={(value) => setGender(value)}
//                             style={styles.picker}
//                             dropdownIconColor="#666"
//                         >
//                             <Picker.Item label="เลือกเพศ" value="" />
//                             <Picker.Item label="ชาย" value="ชาย" />
//                             <Picker.Item label="หญิง" value="หญิง" />
//                             <Picker.Item label="อื่นๆ" value="อื่นๆ" />
//                         </Picker>
//                     </View>
//                 ) : (
//                     <Text style={styles.value}>
//                         {gender}
//                     </Text>
//                 )}
//             </View>

//             <View style={styles.field}>
//                 <Text style={styles.label}>
//                     วัน/เดือน/ปีเกิด
//                 </Text>
//                 <Text style={styles.value}>
//                     1 มกราคม 2540
//                 </Text>
//             </View>

//             <View style={styles.field}>
//                 <Text style={styles.label}>
//                     เลขบัตรประชาชน
//                 </Text>
//                 <Text style={styles.value}>
//                     1-2345-67890-12-3
//                 </Text>
//             </View>

//             <View style={styles.field}>
//                 <Text style={styles.label}>
//                     เบอร์โทรศัพท์
//                 </Text>
//                 {isEditing ? (
//                     <TextInput
//                         style={styles.input}
//                         value={phone}
//                         onChangeText={setPhone}
//                         keyboardType="phone-pad"
//                     />
//                 ) : (
//                     <Text style={styles.value}>
//                         {phone}
//                     </Text>
//                 )}
//             </View>

//             {isEditing ? (
//                 <View style={styles.buttonRow}>
//                     <TouchableOpacity
//                         style={styles.cancelButton}
//                         onPress={() => setIsEditing(false)}
//                     >
//                         <Text style={styles.cancelText}>
//                             ยกเลิก
//                         </Text>
//                     </TouchableOpacity>

//                     <TouchableOpacity
//                         style={styles.saveButton}
//                         onPress={handleSave}
//                     >
//                         <Text style={styles.buttonText}>
//                             บันทึก
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//             ) : (
//                 <TouchableOpacity
//                     style={styles.editButton}
//                     onPress={() => setIsEditing(true)}
//                 >
//                     <Text style={styles.buttonText}>
//                         แก้ไขข้อมูล
//                     </Text>
//                 </TouchableOpacity>
//             )}

//         </ScrollView>
//     );
// }

import React, { useEffect, useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
    ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useUser } from "../context/UserContext";
import { updateUserProfile, getUserPrivate } from "../services/userService";
import { uploadImage } from "../services/cloudinaryService";

const maskIdCard = (id) =>
    id && id.length === 13 ? `${id[0]}-xxxx-xxxxx-${id.slice(10, 12)}-${id[12]}` : "-";

const ProfileScreen = () => {
    const { authUser, profile } = useUser();
    const uid = authUser.uid;

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [idcard, setIdcard] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");

    const fillForm = (p) => {
        setFirstName(p.firstname || "");
        setLastName(p.lastname || "");
        setPhone(p.phone || "");
        setGender(p.gender || "");
    };

    // ซิงก์ฟอร์มกับข้อมูลจริง (เฉพาะตอนไม่ได้กำลังแก้ไข)
    useEffect(() => {
        if (profile && !isEditing) fillForm(profile);
    }, [profile, isEditing]);

    // เลขบัตรดึงเฉพาะหน้านี้ ไม่เก็บใน context
    useEffect(() => {
        getUserPrivate(uid).then((d) => d && setIdcard(d.idcard)).catch(() => { });
    }, [uid]);

    if (!profile) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    const handleSave = async () => {
        const fn = firstName.trim();
        const ln = lastName.trim();
        if (!/^[ก-๙a-zA-Z\s]{2,30}$/.test(fn) || !/^[ก-๙a-zA-Z\s]{2,30}$/.test(ln)) {
            return Alert.alert("ข้อมูลไม่ถูกต้อง", "ชื่อและนามสกุลต้องเป็นตัวอักษรไทยหรืออังกฤษ 2-30 ตัว");
        }
        if (!gender) return Alert.alert("ข้อมูลไม่ถูกต้อง", "กรุณาเลือกเพศ");
        if (!/^0[689]\d{8}$/.test(phone)) {
            return Alert.alert("ข้อมูลไม่ถูกต้อง", "เบอร์โทรต้องเป็นเบอร์มือถือ 10 หลัก");
        }

        setSaving(true);
        try {
            await updateUserProfile(uid, { firstname: fn, lastname: ln, gender, phone });
            setIsEditing(false);
        } catch {
            Alert.alert("ผิดพลาด", "บันทึกไม่สำเร็จ กรุณาลองใหม่");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        fillForm(profile);
        setIsEditing(false);
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

        const uri = result.assets?.[0]?.uri;
        if (!uri) return Alert.alert("ผิดพลาด", "ไม่พบไฟล์รูปภาพ");

        setSaving(true);
        try {
            const { url, publicId } = await uploadImage(uri, `profiles/${uid}`);
            await updateUserProfile(uid, { photoURL: url, photoPublicId: publicId });
        } catch (error) {
            console.error("Upload profile image error:", error);
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
            <Text style={styles.title}>ข้อมูลส่วนตัว</Text>

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

            <View style={styles.field}>
                <Text style={styles.label}>ชื่อ</Text>
                {isEditing
                    ? <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                    : <Text style={styles.value}>{profile.firstname}</Text>}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>นามสกุล</Text>
                {isEditing
                    ? <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                    : <Text style={styles.value}>{profile.lastname}</Text>}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>เพศ</Text>
                {isEditing ? (
                    <View style={styles.pickerWrapper}>
                        <Picker selectedValue={gender} onValueChange={setGender}
                            style={styles.picker} dropdownIconColor="#666">
                            <Picker.Item label="เลือกเพศ" value="" />
                            <Picker.Item label="ชาย" value="ชาย" />
                            <Picker.Item label="หญิง" value="หญิง" />
                            <Picker.Item label="อื่นๆ" value="อื่นๆ" />
                        </Picker>
                    </View>
                ) : <Text style={styles.value}>{profile.gender}</Text>}
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>วัน/เดือน/ปีเกิด</Text>
                <Text style={styles.value}>{birthText}</Text>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>เลขบัตรประชาชน</Text>
                <Text style={styles.value}>{maskIdCard(idcard)}</Text>
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                {isEditing
                    ? <TextInput style={styles.input} value={phone} onChangeText={setPhone}
                        keyboardType="phone-pad" maxLength={10} />
                    : <Text style={styles.value}>{profile.phone}</Text>}
            </View>

            {isEditing ? (
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={saving}>
                        <Text style={styles.cancelText}>ยกเลิก</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                        {saving
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.buttonText}>บันทึก</Text>}
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
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
        height: 47,
    },
    picker: {
        height: 50,
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

export default ProfileScreen