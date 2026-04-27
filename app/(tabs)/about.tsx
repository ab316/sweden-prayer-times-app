import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MissionCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  body: string;
};

type AboutLinkProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  last?: boolean;
};

const ICON_COLORS = {
  primary: '#003527',
  secondary: '#775a19',
  muted: '#404944',
};

function MissionCard({ icon, title, body }: MissionCardProps) {
  return (
    <View
      className="rounded-xl bg-surface-container-lowest p-container-padding"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}>
      <View className="mb-4 flex-row items-center gap-4">
        <MaterialIcons name={icon} size={24} color={ICON_COLORS.secondary} />
        <Text className="flex-1 font-headline-md text-headline-md text-on-surface">{title}</Text>
      </View>
      <Text className="font-body-md text-body-md text-on-surface-variant">{body}</Text>
    </View>
  );
}

function AboutLink({ icon, label, last }: AboutLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint="This action is not available yet"
      onPress={() => Alert.alert('Coming soon', `${label} will be available in a later version.`)}
      className={`flex-row items-center justify-between p-container-padding ${last ? '' : 'border-b border-surface-variant/50'
        }`}>
      <View className="flex-1 flex-row items-center gap-4">
        <MaterialIcons name={icon} size={22} color={ICON_COLORS.muted} />
        <Text className="flex-1 font-body-md text-body-md text-on-surface">{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={ICON_COLORS.muted} />
    </Pressable>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between border-b border-outline-variant/50 bg-surface px-6 py-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Change location"
          onPress={() => router.push('/select-city')}
          className="rounded-full p-2">
          <MaterialIcons name="location-on" size={24} color={ICON_COLORS.primary} />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-primary">Sakinah Bloom</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => router.push('/settings')}
          className="rounded-full p-2">
          <MaterialIcons name="account-circle" size={24} color={ICON_COLORS.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-container-padding pt-section-gap pb-28"
        className="flex-1">
        <View className="w-full max-w-3xl self-center">
          <View className="mb-section-gap items-center">
            <View
              className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-surface-container-high"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 2 },
                elevation: 1,
              }}>
              <MaterialIcons name="mosque" size={48} color={ICON_COLORS.primary} />
            </View>
            <Text className="mb-2 font-headline-xl text-headline-xl text-on-surface">
              Sakinah Bloom
            </Text>
            <Text className="mb-6 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
              Version 1.0.0
            </Text>
            <Text className="max-w-lg text-center font-body-lg text-body-lg text-on-surface-variant">
              Spiritual precision for the modern Muslim. Built with dedication in Sweden.
            </Text>
          </View>

          <View className="mb-section-gap gap-element-gap">
            <MissionCard
              icon="public"
              title="Our Mission"
              body="To provide impeccably accurate prayer timings tailored specifically for the unique geographical challenges of Sweden and Northern Europe. We bridge the gap between ancient astronomical traditions and modern algorithmic precision."
            />
            <MissionCard
              icon="shield"
              title="Privacy First"
              body="Your location data never leaves your device. We believe in spiritual connection without digital surveillance."
            />
            <MissionCard
              icon="favorite"
              title="Community"
              body="Built by the community, for the community. We actively partner with local mosques to verify our calculation methods."
            />
          </View>

          <View
            className="mb-section-gap overflow-hidden rounded-xl bg-surface-container-lowest"
            style={{
              shadowColor: '#000',
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 1,
            }}>
            <AboutLink icon="rate-review" label="Rate on App Store" />
            <AboutLink icon="bug-report" label="Report an Issue" />
            <AboutLink icon="description" label="Terms & Privacy Policy" last />
          </View>

          <Text className="pb-section-gap text-center font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
            (c) 2024 Sakinah Bloom{'\n'}Peace & Blessings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
