import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const SelectFormInput = ({ label, value, onValueChange, placeholder, options = [], }) => {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{label}</Text>

        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={value}
            onValueChange={onValueChange}
            style={[
              styles.picker,
              { color: value === "" ? "#999" : "#000" },
            ]}
          >
            <Picker.Item label={placeholder} value="" />

            {options.map((item, index) => (
              <Picker.Item
                key={index}
                label={item}
                value={item}
                style={{ fontSize: 14 }}
              />
            ))}
          </Picker>
        </View>
      </View>
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    fontSize: 16,
    height: 50,
    width: "100%",
  },
});

export default SelectFormInput;