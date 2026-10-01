import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

export default function TextFormInput({ label, placeholder, value, onChangeText, secureTextEntry = false, keyboardType = "default", autoCapitalize = "sentences", maxLength }) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.cardTitle}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    maxLength={maxLength}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 12,
        gap: 8
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10
    },
    input: {
        fontSize: 16,
        color: '#000'
    },
});