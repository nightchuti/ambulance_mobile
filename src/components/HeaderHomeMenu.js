import React, { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Menu, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useUser } from "../context/UserContext";

const HeaderHomeMenu = () => {
  const navigation = useNavigation();
  const { profile } = useUser();
  const [visible, setVisible] = useState(false);

  const closeMenu = () => setVisible(false);

  const goProfile = () => {
    closeMenu();
    navigation.navigate("Profile");
  };

  const handleLogout = async () => {
    closeMenu();
    await signOut(auth);
  };

  return (
    <Menu
      visible={visible}
      onDismiss={closeMenu}
      anchorPosition="bottom"
      contentStyle={styles.menu}
      anchor={
        <TouchableOpacity
          onPress={() => setVisible(true)}
          style={styles.button}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {profile?.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholder]}>
              <Ionicons name="person" size={20} color="#ddd"/>
            </View>
          )}
        </TouchableOpacity>
      }
    >
      <Menu.Item
        leadingIcon="account"
        onPress={goProfile}
        title="โปรไฟล์"
        style={styles.item}
        titleStyle={styles.itemTitle}
      />
      <Divider />
      <Menu.Item
        leadingIcon="logout"
        onPress={handleLogout}
        title="ออกจากระบบ"
        style={styles.item}
        titleStyle={{ color: "#f21212" }}
      />
    </Menu>
  );
};

const styles = StyleSheet.create({
  button: {
    marginRight: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  menu: {
    width: 150,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 5,
  },
  item: {
    height: 45,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
  },
});

export default HeaderHomeMenu;