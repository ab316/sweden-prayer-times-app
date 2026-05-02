import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/constants/theme';

type CityOptionProps = {
  name: string;
  subtitle: string;
  active?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
};

export function CityOption({
  name,
  subtitle,
  active,
  icon = 'history',
  onPress,
}: CityOptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${subtitle}${active ? ', current location' : ''}`}
      onPress={onPress}
      className={`relative flex-row items-center justify-between overflow-hidden rounded-prayer-row bg-card px-row-pad-x py-row-pad-y ${active ? 'border-l-[3px] border-current-border' : ''}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}>
      <View className="flex-row items-center gap-3">
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-primary' : 'bg-primary-light'}`}>
          <MaterialIcons
            name={active ? 'location-on' : icon}
            size={20}
            color={active ? theme.card : theme.primary}
          />
        </View>
        <View>
          <Text className="font-body-md text-body-md text-text">{name}</Text>
          <Text className="font-caption text-caption text-text-sub">{subtitle}</Text>
        </View>
      </View>
      {active ? <MaterialIcons name="check" size={20} color={theme.accent} /> : null}
    </Pressable>
  );
}
