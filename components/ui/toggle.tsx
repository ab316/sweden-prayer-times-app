import { Pressable, View } from 'react-native';

type Props = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  accessibilityLabel?: string;
};

export function Toggle({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => onValueChange(!value)}
      className={`h-7 w-12 justify-center rounded-toggle ${value ? 'bg-accent' : 'bg-primary-light'}`}>
      <View
        className="h-5 w-5 rounded-full bg-card"
        style={{
          marginLeft: value ? 24 : 4,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 2,
        }}
      />
    </Pressable>
  );
}
