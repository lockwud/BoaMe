import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CampaignDetailScreen } from "../screens/campaign-detail-screen";
import { CampaignsScreen } from "../screens/campaigns-screen";
import { CheckoutScreen } from "../screens/checkout-screen";
import { CreateCampaignScreen } from "../screens/create-campaign-screen";
import { DonateScreen } from "../screens/donate-screen";
import { DonationSuccessScreen } from "../screens/donation-success-screen";
import { DonationsScreen } from "../screens/donations-screen";
import { HomeScreen } from "../screens/home-screen";
import { LoginScreen } from "../screens/login-screen";
import { NotificationsScreen } from "../screens/notifications-screen";
import { ProfileScreen } from "../screens/profile-screen";
import { RegisterScreen } from "../screens/register-screen";
import { colors } from "../theme/colors";
import type { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.primaryGreen,
        tabBarInactiveTintColor: "#64748B",
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 18,
          height: 62,
          borderRadius: 31,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.12,
          shadowRadius: 22,
          elevation: 8
        },
        tabBarItemStyle: {
          height: 54,
          marginTop: 4,
          borderRadius: 27
        },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Home: "home",
            Campaigns: "compass-outline",
            Donations: "receipt-outline",
            Notifications: "notifications-outline",
            Settings: "person-outline"
          } as const;
          const activeIcon = route.name === "Home" ? "home" : icons[route.name];

          return (
            <Ionicons
              name={focused ? activeIcon : icons[route.name]}
              size={focused ? 22 : 20}
              color={focused ? "#FFFFFF" : color}
              style={{
                width: focused ? 62 : 42,
                height: focused ? 42 : 42,
                borderRadius: 21,
                textAlign: "center",
                textAlignVertical: "center",
                backgroundColor: focused ? "#111827" : "#F4F5F7"
              }}
            />
          );
        }
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Campaigns" component={CampaignsScreen} />
      <Tabs.Screen name="Donations" component={DonationsScreen} />
      <Tabs.Screen name="Notifications" component={NotificationsScreen} />
      <Tabs.Screen name="Settings" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CampaignDetail" component={CampaignDetailScreen} options={{ title: "Campaign" }} />
      <Stack.Screen name="CreateCampaign" component={CreateCampaignScreen} options={{ title: "Request support" }} />
      <Stack.Screen name="Donate" component={DonateScreen} options={{ title: "Donate" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Secure checkout" }} />
      <Stack.Screen name="DonationSuccess" component={DonationSuccessScreen} options={{ title: "Receipt" }} />
    </Stack.Navigator>
  );
}
