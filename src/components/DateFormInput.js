import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from '@expo/vector-icons/Ionicons';

const DateFormInput = ({ label, placeholder = "วว/ดด/ปปปป", value, onChange }) => {
    const [text, setText] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    //แปลงวันที่เป็นข้อความในรูปแบบ วว/ดด/ปปปป
    const formatDate = (date) => {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        return `${d}/${m}/${date.getFullYear()}`;
    };

    //กรณีพิมพ์วันที่เอง
    const handleTextChange = (input) => {
        const digits = input.replace(/\D/g, "").slice(0, 8);

        let formatted = digits;
        if (digits.length > 4) {
            formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
        } else if (digits.length > 2) {
            formatted = digits.slice(0, 2) + "/" + digits.slice(2);
        }
        setText(formatted);

        if (digits.length === 8) {
            const day = Number(digits.slice(0, 2));
            const month = Number(digits.slice(2, 4));
            const year = Number(digits.slice(4, 8));
            const date = new Date(year, month - 1, day);

            const isValid = date.getDate() === day && date.getMonth() === month - 1;
            onChange(isValid ? date : null);
        } else {
            onChange(null);
        }
    };

    //เลือกวันจากปฏิทิน
    const handlePickerChange = (event, date) => {
        setShowPicker(false);
        if (date) {
            setText(formatDate(date));
            onChange(date);
        }
    };

    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={handleTextChange}
                    placeholder={placeholder}
                    keyboardType="number-pad"
                    maxLength={10}
                />
                <TouchableOpacity onPress={() => setShowPicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="black" />
                </TouchableOpacity>
            </View>

            {showPicker && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    maximumDate={new Date()}
                    onChange={handlePickerChange}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 12,
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 8,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 10,
    },
});

export default DateFormInput;