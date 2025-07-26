import { Tabs } from 'expo-router';
import { Calendar, RupeeSign, Bell, Home, DollarSign } from 'lucide-react-native';

const TabIcon = ({ IconComponent, color }) => {
  if (!IconComponent) {
    return null;
  }
  return <IconComponent size={24} color={color} />;
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabIcon IconComponent={Home} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ color }) => <TabIcon IconComponent={DollarSign} color={color} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color }) => <TabIcon IconComponent={Calendar} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: 'Notices',
          tabBarIcon: ({ color }) => <TabIcon IconComponent={Bell} color={color} />,
        }}
      />
    </Tabs>
  );
}
