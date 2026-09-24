import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReportScreen from './src/screens/ReportScreen';
import AEDMapScreen from './src/screens/AEDMapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StatusScreen from './src/screens/StatusScreen';

const Stack = createNativeStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: '#f21212' },
        headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' }
      }}>

        {/* <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: '' }} /> */}
        <Stack.Screen name='Login' component={LoginScreen} options={{ title: '' }} />
        <Stack.Screen name='Register' component={RegisterScreen} options={{ title: '' }} />
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{
            title: 'KPS Ambulance',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => { }}
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: "#fff", fontSize: 28 }}>
                  ☰
                </Text>
              </TouchableOpacity>
            ),
          }} />
        <Stack.Screen name='Report' component={ReportScreen} options={{ title: 'แจ้งเหตุฉุกเฉิน' }} />
        <Stack.Screen name='Status' component={StatusScreen} options={{ title: 'สถานะการช่วยเหลือ' }} />
        <Stack.Screen name='AEDMap' component={AEDMapScreen} options={{ title: 'แผนที่ AED' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

