import { Text } from 'react-native';

type Props = {
  children: React.ReactNode;
};

export function SectionHeader({ children }: Props) {
  return (
    <Text className="px-2 font-label text-label uppercase text-text-sub">{children}</Text>
  );
}
