import { Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <Text className="font-headline-md text-headline-md text-on-surface">Settings</Text>
      <Text className="mt-2 font-label-sm text-label-sm uppercase tracking-widest text-outline">
        Coming soon
      </Text>
    </View>
  );
}
