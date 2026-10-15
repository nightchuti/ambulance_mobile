import { ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";
import { UserProvider, useUser } from "./src/context/UserContext";
import { LocationProvider } from "./src/context/LocationContext";
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReportScreen from './src/screens/ReportScreen';
import AEDMapScreen from './src/screens/AEDMapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import StatusScreen from './src/screens/StatusScreen';
import HeaderHomeMenu from './src/components/HeaderHomeMenu';
import HistoryScreen from './src/screens/HistoryScreen';
import PickLocationScreen from './src/screens/PickLocationScreen';

const Stack = createNativeStackNavigator();

function Root() {
  const { authUser, initializing } = useUser();

  if (initializing) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerStyle: { backgroundColor: "#f21212" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
      }}>
        {authUser ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen}
              options={{ title: "KPS Ambulance", headerRight: () => <HeaderHomeMenu /> }} />
            <Stack.Screen name="Report" component={ReportScreen} options={{ title: "แจ้งเหตุฉุกเฉิน" }} />
            <Stack.Screen name="Status" component={StatusScreen} options={{ title: "สถานะการช่วยเหลือ" }} />
            <Stack.Screen name="AEDMap" component={AEDMapScreen} options={{ title: "แผนที่ AED" }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "ข้อมูลส่วนตัว" }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: "ประวัติการใช้งาน" }} />
            <Stack.Screen name="PickLocation" component={PickLocationScreen} options={{ title: "เลือกตำแหน่ง" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: "" }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <UserProvider>
        <LocationProvider>
          <Root />
        </LocationProvider>
      </UserProvider>
    </PaperProvider>
  );
}

// export default function App() {
//   const [user, setUser] = useState(null);
//   const [initializing, setInitializing] = useState(true);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//       setInitializing(false);
//     });
//     return unsub;
//   }, []);

//   if (initializing) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator size="large" /></View>;

//   return (
//     <PaperProvider>
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{
//         headerStyle: { backgroundColor: '#f21212' },
//         headerTintColor: '#fff', 
//         headerTitleStyle: { fontWeight: 'bold' }
//       }}>

//         {user ? (
//           <>
//             <Stack.Screen
//               name='Home'
//               component={HomeScreen}
//               options={({ navigation }) => ({
//                 title: 'KPS Ambulance',
//                 headerRight: () => <HeaderHomeMenu/>,
//               })}
//             />
//             <Stack.Screen name="Report" component={ReportScreen} options={{ title: "แจ้งเหตุฉุกเฉิน" }} />
//             <Stack.Screen name="Status" component={StatusScreen} options={{ title: "สถานะการช่วยเหลือ" }} />
//             <Stack.Screen name="AEDMap" component={AEDMapScreen} options={{ title: "แผนที่ AED" }} />
//             <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "ข้อมูลส่วนตัว" }} />
//           </>
//         ) : (
//           <>
//             <Stack.Screen name="Login" component={LoginScreen} options={{ title: "" }} />
//             <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "" }} />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//     </PaperProvider>
//   );
// }