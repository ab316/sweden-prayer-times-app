import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#003527',
  secondary: '#775a19',
  outline: '#707974',
  surfaceTint: '#2b6954',
};

function CompassTick({
  className,
  rotate,
}: {
  className: string;
  rotate?: `${number}deg`;
}) {
  return (
    <View
      className={`absolute h-5 w-px rounded-full bg-outline-variant ${className}`}
      style={rotate ? { transform: [{ rotate }] } : undefined}
    />
  );
}

function CardinalLabel({ label, className }: { label: string; className: string }) {
  return (
    <Text className={`absolute font-label-sm text-label-sm text-on-surface-variant ${className}`}>
      {label}
    </Text>
  );
}

export default function QiblaScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-outline-variant/50 bg-surface px-6 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change location"
          onPress={() => router.push('/select-city')}
          className="-ml-2 rounded-full p-2">
          <MaterialIcons name="location-on" size={24} color={COLORS.primary} />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-primary">Sakinah Bloom</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open about"
          onPress={() => router.push('/about')}
          className="-mr-2 rounded-full p-2">
          <MaterialIcons name="account-circle" size={24} color={COLORS.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="grow px-container-padding pb-28 pt-section-gap"
        className="flex-1">
        <View className="w-full max-w-md flex-1 items-center justify-center self-center">
          <View className="mb-12 items-center">
            <Text className="mb-2 font-headline-xl text-headline-xl text-primary">Qibla</Text>
            <View className="flex-row items-center justify-center gap-1">
              <MaterialIcons name="near-me" size={18} color={COLORS.outline} />
              <Text className="font-body-md text-body-md text-on-surface-variant">
                Gothenburg, Sweden
              </Text>
            </View>
            <Text className="mt-1 font-label-sm text-label-sm text-secondary">142 deg SE</Text>
          </View>

          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Qibla compass pointing southeast toward Mecca"
            className="relative mb-12 h-72 w-72 items-center justify-center rounded-full border-2 border-surface-variant bg-surface/50"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 32,
              shadowOffset: { width: 0, height: 8 },
              elevation: 2,
            }}>
            <CardinalLabel label="N" className="left-1/2 top-4 -translate-x-1/2" />
            <CardinalLabel label="E" className="right-4 top-1/2 -translate-y-1/2" />
            <CardinalLabel label="S" className="bottom-4 left-1/2 -translate-x-1/2" />
            <CardinalLabel label="W" className="left-4 top-1/2 -translate-y-1/2" />

            <CompassTick className="left-1/2 top-5 -translate-x-1/2" />
            <CompassTick className="bottom-5 left-1/2 -translate-x-1/2" />
            <CompassTick className="right-7 top-1/2 -translate-y-1/2" rotate="90deg" />
            <CompassTick className="left-7 top-1/2 -translate-y-1/2" rotate="90deg" />

            <View className="h-56 w-56 rotate-45 items-center justify-center rounded-full border border-surface-container-highest bg-surface-container-low">
              <View
                className="absolute -top-4 left-1/2 z-10 h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-secondary"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.12,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}>
                <MaterialIcons name="location-on" size={16} color="#ffffff" />
              </View>

              <View className="absolute left-1/2 top-7 h-36 w-0.5 -translate-x-1/2 bg-primary/20" />

              <View
                className="h-16 w-16 items-center justify-center overflow-hidden rounded bg-primary"
                style={{
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                }}>
                <View className="absolute top-0 h-3 w-full bg-secondary/40" />
                <MaterialIcons name="mosque" size={30} color="#ffffff" />
              </View>
            </View>
          </View>

          <View
            className="w-full max-w-sm flex-row items-center gap-4 rounded-2xl bg-surface-container-low px-6 py-4"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.02,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-fixed">
              <MaterialIcons name="explore" size={22} color={COLORS.surfaceTint} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="font-body-md text-body-md font-medium text-on-surface">
                Preview compass
              </Text>
              <Text className="font-label-sm text-label-sm normal-case text-on-surface-variant">
                Live calibration will be added when sensors are wired.
              </Text>
            </View>
            <View className="h-2 w-2 rounded-full bg-secondary" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
