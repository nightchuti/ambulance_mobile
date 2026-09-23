import React from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

const MenuModal = ({
    visible,
    onClose,
    onProfile,
    onLogout,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={styles.menu}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={onProfile}
                    >
                        <Text style={styles.menuText}>
                            โปรไฟล์
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={onLogout}
                    >
                        <Text style={styles.logoutText}>
                            ออกจากระบบ
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.2)",
    },

    menu: {
        position: "absolute",
        top: 55,
        right: 10,
        width: 180,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 5,
        paddingVertical: 5,
    },

    menuItem: {
        padding: 15,
    },

    menuText: {
        fontSize: 16,
        color: "#333",
    },

    logoutText: {
        fontSize: 16,
        color: "#f21212",
    },
});

export default MenuModal;