import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type CityOptionProps = {
  name: string;
  subtitle: string;
  active?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
};

const ICON_COLORS = {
  active: '#785a1a',
  inactive: '#707974',
  check: '#003527',
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
      className={`w-full flex-row items-center justify-between overflow-hidden rounded-xl border p-4 ${
        active
          ? 'border-surface-variant bg-surface-container-lowest'
          : 'border-transparent bg-surface'
      }`}
      style={{
        shadowColor: '#000',
        shadowOpacity: active ? 0.03 : 0,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: active ? 1 : 0,
      }}>
      {active ? <View className="absolute bottom-0 left-0 top-0 w-1 bg-secondary" /> : null}
      <View className="flex-row items-center gap-4 pl-2">
        <View
          className={`h-10 w-10 items-center justify-center rounded-full ${
            active ? 'bg-secondary-container/30' : 'bg-surface-container'
          }`}>
          <MaterialIcons
            name={active ? 'location-on' : icon}
            size={22}
            color={active ? ICON_COLORS.active : ICON_COLORS.inactive}
          />
        </View>
        <View className="flex-col">
          <Text className="font-body-lg text-body-lg font-medium text-on-surface">{name}</Text>
          <Text className="font-label-sm text-label-sm text-outline">{subtitle}</Text>
        </View>
      </View>
      {active ? <MaterialIcons name="check" size={22} color={ICON_COLORS.check} /> : null}
    </Pressable>
  );
}
