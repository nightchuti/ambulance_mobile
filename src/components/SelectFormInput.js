import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

const SelectFormDropdown = ({ label, value, onValueChange, placeholder, options = [], }) => {
  const data = options.map((item) => ({value: item}));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.cardTitle}>{label}</Text>

      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
        containerStyle={styles.listContainer}
        data={data}
        labelField="value"
        valueField="value"
        placeholder={placeholder}
        value={value || null}
        onChange={(item) => onValueChange(item.value)}
        dropdownPosition="bottom"
        maxHeight={220}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    gap: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10
  },
  dropdown: {
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  placeholder: {
    fontSize: 16,
    color: "#999"
  },
  selectedText: {
    fontSize: 16,
    color: "#000"
  },
  itemText: {
    fontSize: 16
  },
  listContainer: {
    borderRadius: 8,
  },
});

export default SelectFormDropdown;