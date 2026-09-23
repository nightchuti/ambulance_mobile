import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons, } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ReportScreen = ({ navigation, route }) => {

    const { location, address, type: selectType } = route.params || {};

    const [selectedType, setSelectedType] = useState(selectType);
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);

    const emergencyType = [
        { title: "อุบัติเหตุรถ", icon: <MaterialCommunityIcons name="car" size={35} color="#F59E0B" />, },
        { title: "หัวใจ/หมดสติ", icon: <FontAwesome5 name="heart" size={32} color="#EF4444" />, },
        { title: "บาดเจ็บ", icon: <MaterialCommunityIcons name="bandage" size={33} color="#8B5CF6" />, },
        { title: "ไฟไหม้", icon: <MaterialIcons name="local-fire-department" size={35} color="#F97316" />, },
        { title: "จมน้ำ", icon: <Ionicons name="water" size={35} color="#0EA5E9" />, },
        { title: "เหตุอื่น ๆ", icon: <MaterialIcons name="error" size={33} color="#64748B" />, },
    ];

    // const pickImage = async () => {
    //     const result = await ImagePicker.launchImageLibraryAsync({
    //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //         allowsMultipleSelection: true,
    //         quality: 0.7,
    //     });
    //     if (!result.canceled) {
    //         setImages([...images, ...result.assets]);
    //     }
    // };

    // const takePhoto = async () => {
    //     const { status } = await ImagePicker.requestCameraPermissionsAsync();
    //     if (status !== "granted") {
    //         Alert.alert("ไม่ได้รับอนุญาต", "กรุณาเปิดสิทธิ์กล้องก่อนถ่ายรูป");
    //         return;
    //     }
    //     const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    //     if (!result.canceled) {
    //         setImages([...images, ...result.assets]);
    //     }
    // };

    // const removeImage = (indexToRemove) => {
    //     setImages(images.filter((_, index) => index !== indexToRemove));
    // };

    return (
        <View style={styles.container}>
            <Text style={styles.typeHeader}>เลือกประเภทเหตุฉุกเฉิน</Text>
            <View style={styles.typeSection}>
                {emergencyType.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.typeOption,
                            selectedType === item.title && styles.typeOptionSelected
                        ]}
                        onPress={() => setSelectedType(item.title)}
                    >
                        {item.icon}
                        <Text style={[
                            styles.typeText,
                            selectedType === item.title && styles.typeTextSelected
                        ]}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>ตำแหน่งเกิดเหตุ</Text>
                </View>
                <Text style={styles.locText} numberOfLines={2}>{address}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>รายละเอียดเพิ่มเติม</Text>
                </View>
                <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={2}
                    placeholder="อธิบายอาการ, จำนวนคนเจ็บ หรือจุดสังเกต..."
                    placeholderTextColor="#94A3B8"
                    value={description}
                    onChangeText={setDescription}
                />
            </View>

            {/* <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>รูปภาพประกอบ ({images.length})</Text>
                </View>
                <View style={styles.imgRow}>
                    <TouchableOpacity style={styles.addImgBtn} onPress={takePhoto}>
                        <Ionicons name="camera-outline" size={24} color="#64748B" />
                        <Text style={styles.addImgTxt}>ถ่ายรูป</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
                        <Ionicons name="images-outline" size={24} color="#64748B" />
                        <Text style={styles.addImgTxt}>เลือกรูป</Text>
                    </TouchableOpacity>
                    {images.map((img, i) => (
                        <View key={i} style={styles.thumbWrapper}>
                            <Image source={{ uri: img.uri }} style={styles.thumb} />
                            <TouchableOpacity style={styles.deleteBadge} onPress={() => removeImage(i)}>
                                <Ionicons name="close" size={12} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View> */}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eeeeee',
    },
    typeHeader: {
        fontSize: 16,
        fontWeight: "bold",
        margin: 15,
        marginHorizontal: 20,
    },
    typeSection: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-evenly",
        marginHorizontal: 20,
    },
    typeOption: {
        width: "30%",
        height: 70,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#fff",
        borderRadius: 20,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3
    },
    typeText: {
        fontSize: 14,
        marginTop: 8,
    },
    typeOptionSelected: {
        backgroundColor: "#ffecdf",
        borderWidth: 1,
        borderColor: "#f98639"
    },
    typeTextSelected: {
        color: "#f98639",
        fontWeight: "bold",
    },

    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        padding: 12,
        marginHorizontal: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#334155",
        marginLeft: 6,
    },
    locText: {
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        fontSize: 16,
        color: "#1E293B",
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        fontSize: 16,
        color: "#1E293B",
        minHeight: 65,
        textAlignVertical: "top",
    },

    // imgRow: {
    //     flexDirection: "row",
    //     flexWrap: "wrap",
    //     gap: 8,
    // },
    // addImgBtn: {
    //     width: 60, // ลดขนาดกล่องรูปภาพ
    //     height: 60,
    //     borderRadius: 10,
    //     backgroundColor: "#F8FAFC",
    //     borderWidth: 1,
    //     borderColor: "#CBD5E1",
    //     borderStyle: "dashed",
    //     alignItems: "center",
    //     justifyContent: "center",
    // },
    // addImgTxt: {
    //     fontSize: 10,
    //     color: "#64748B",
    //     marginTop: 2,
    //     fontWeight: "600",
    // },
    // thumbWrapper: {
    //     position: "relative",
    // },
    // thumb: {
    //     width: 60,
    //     height: 60,
    //     borderRadius: 10,
    //     backgroundColor: "#E2E8F0",
    // },
    // deleteBadge: {
    //     position: "absolute",
    //     top: -6,
    //     right: -6,
    //     backgroundColor: "#EF4444",
    //     width: 20,
    //     height: 20,
    //     borderRadius: 10,
    //     alignItems: "center",
    //     justifyContent: "center",
    //     borderWidth: 1.5,
    //     borderColor: "#FFF",
    // },
});

export default ReportScreen