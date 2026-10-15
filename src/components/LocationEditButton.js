import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocation } from "../context/LocationContext";

const LocationEditButton = ({ onPress }) => {
    const { loading } = useLocation();

    if (loading) return <ActivityIndicator size="small" color="#64748B" />;

    return (
        <TouchableOpacity style={styles.btn} onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="edit-location-alt" size={18} color="#000000" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: { flexDirection: "row", alignItems: "center", gap: 4 },
});

export default LocationEditButton;