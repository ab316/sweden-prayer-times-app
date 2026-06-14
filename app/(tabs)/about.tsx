import { MaterialIcons } from '@expo/vector-icons';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsCard } from '@/components/ui/settings-card';
import { theme } from '@/constants/theme';

type MissionCardProps = {
  emoji: string;
  title: string;
  body: string;
};

type AboutLinkProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
};

function MissionCard({ emoji, title, body }: MissionCardProps) {
  return (
    <View
      className="rounded-settings-card bg-card p-card-pad"
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 1,
      }}>
      <View className="mb-2 flex-row items-center gap-3">
        <Text className="text-2xl">{emoji}</Text>
        <Text className="font-headline-md text-headline-md text-text">{title}</Text>
      </View>
      <Text className="font-body-sm text-body-sm text-text-sub">{body}</Text>
    </View>
  );
}

function AboutLink({ icon, label }: AboutLinkProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => Alert.alert('Coming soon', `${label} will be available in a later version.`)}
      className="flex-row items-center justify-between px-row-pad-x py-row-pad-y">
      <View className="flex-row items-center gap-3">
        <MaterialIcons name={icon} size={20} color={theme.primary} />
        <Text className="font-body-md text-body-md text-text">{label}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={theme.textSub} />
    </Pressable>
  );
}

export default function AboutScreen() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <ScrollView
        contentContainerClassName="px-screen-pad pt-6 pb-12"
        className="flex-1">
        <View className="gap-section-gap">
          {/* App icon + identity */}
          <View className="items-center pt-4">
            <View
              className="h-[72px] w-[72px] items-center justify-center rounded-about-app-icon bg-primary"
              style={{
                borderRadius: 20,
                shadowColor: theme.primary,
                shadowOpacity: 0.4,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 5,
              }}>
              <MaterialIcons name="mosque" size={36} color={theme.card} />
            </View>
            <Text className="mt-4 font-headline-md text-headline-md text-text">Sakinah Bloom</Text>
            <Text className="mt-1 font-label text-label uppercase text-text-sub">Version 1.0.0</Text>
            <Text className="mt-3 max-w-sm text-center font-body-sm text-body-sm text-text-sub">
              Spiritual precision for the modern Muslim. Built with dedication in Sweden.
            </Text>
          </View>

          <View className="gap-3">
            <MissionCard
              emoji="🌍"
              title="Our Mission"
              body="Accurate prayer timings tailored to Sweden and Northern Europe. We bridge ancient astronomical traditions with modern algorithmic precision."
            />
            <MissionCard
              emoji="🔒"
              title="Privacy First"
              body="Your location data never leaves your device. Spiritual connection without digital surveillance."
            />
            <MissionCard
              emoji="🤝"
              title="Community"
              body="Built by the community, for the community. We partner with local mosques to verify calculation methods."
            />
          </View>

          <SettingsCard>
            <AboutLink icon="star-rate" label="Rate on App Store" />
            <AboutLink icon="bug-report" label="Report an Issue" />
            <AboutLink icon="description" label="Terms & Privacy Policy" />
          </SettingsCard>

          <Text className="pt-4 text-center font-label text-label uppercase text-text-sub">
            © 2026 Sakinah Bloom · Peace & Blessings
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
