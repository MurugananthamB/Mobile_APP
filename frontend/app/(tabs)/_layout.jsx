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
          height: 85,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Home} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={DollarSign} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Calendar} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notices"
        options={{
          title: 'Circular',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon IconComponent={Bell} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
