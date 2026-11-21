import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import CoursePlayerScreen from '../screens/CoursePlayerScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AccountInfoScreen from '../screens/AccountInfoScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import SendFeedbackScreen from '../screens/SendFeedbackScreen';
import AboutRehablitoScreen from '../screens/AboutRehablitoScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CoursePlayer" component={CoursePlayerScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="SendFeedback" component={SendFeedbackScreen} />
      <Stack.Screen name="AboutRehablito" component={AboutRehablitoScreen} />
    </Stack.Navigator>
  );
}

