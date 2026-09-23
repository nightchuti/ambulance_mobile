import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const DateFormInput = ({
    label,
    placeholder = "เลือกวัน/เดือน/ปีเกิด",
    value,
    onChange,
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleChange = (event, selectedDate) => {
        setShowPicker(false);

        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const displayDate = value
        ? value.toLocaleDateString("th-TH")
        : placeholder;

    return (
        <View style={styles.wrapper}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{label}</Text>

                <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowPicker(true)}
                >
                    <Text
                        style={[
                            styles.input,
                            !value && styles.placeholder
                        ]}
                    >
                        {displayDate}
                    </Text>
                </TouchableOpacity>
            </View>

            {showPicker && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={handleChange}
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

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        elevation: 2,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },

    inputWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
    },

    input: {
        fontSize: 16,
        color: "#000",
    },

    placeholder: {
        color: "#999",
    },
});

export default DateFormInput;