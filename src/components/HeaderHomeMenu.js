import React, { useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { Menu, Divider } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

const HeaderHomeMenu = () => {
  const navigation = useNavigation();
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
      anchor={
        <TouchableOpacity onPress={() => setVisible(true)} style={{ marginRight: 15 }}>
          <Text style={{ color: "#fff", fontSize: 28 }}>☰</Text>
        </TouchableOpacity>
      }
    >
      <Menu.Item leadingIcon="account" onPress={goProfile} title="โปรไฟล์" />
      <Divider />
      <Menu.Item
        leadingIcon="logout"
        onPress={handleLogout}
        title="ออกจากระบบ"
        titleStyle={{ color: "#f21212" }}
      />
    </Menu>
  );
};

export default HeaderHomeMenu;