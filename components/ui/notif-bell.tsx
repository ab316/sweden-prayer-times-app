import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { theme } from '@/constants/theme';

type Props = {
  active: boolean;
  onPress: () => void;
  size?: number;
  accessibilityLabel?: string;
};

export function NotifBell({ active, onPress, size = 18, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (active ? 'Notifications on' : 'Notifications off')}
      onPress={onPress}
      hitSlop={8}
      className="rounded-full p-2">
      <MaterialIcons
        name={active ? 'notifications-active' : 'notifications-off'}
        size={size}
        color={active ? theme.accent : theme.textSub}
      />
    </Pressable>
  );
}
