import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';

export default function TextFormInput({ label, placeholder, secureTextEntry = false,}) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>{label}</Text>
                <View style={styles.inputWrapper}>
                    <TextInput 
                        style={styles.input} 
                        placeholder={placeholder} 
                        placeholderTextColor="#999"
                        secureTextEntry={secureTextEntry}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginHorizontal: 12, gap: 8 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    inputWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
    input: { fontSize: 16, color: '#000' },
});