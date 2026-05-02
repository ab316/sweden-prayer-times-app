import { Children, Fragment } from 'react';
import { View } from 'react-native';

type Props = {
  children: React.ReactNode;
};

export function SettingsCard({ children }: Props) {
  const items = Children.toArray(children);
  return (
    <View
      className="overflow-hidden rounded-settings-card bg-card"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 ? <View className="h-px bg-bg" /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}
