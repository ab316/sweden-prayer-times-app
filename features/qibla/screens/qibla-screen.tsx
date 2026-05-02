import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HexPatternBg } from '@/components/ui/hex-pattern-bg';
import { theme } from '@/constants/theme';
import { useLocation } from '@/features/location';
import { compassLabel } from '@/lib/time/qibla';

import { useQibla } from '../hooks/use-qibla';

const COMPASS_SIZE = 260;

function CardinalLabel({ label, top, bottom, left, right }: {
  label: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}) {
  return (
    <Text
      className="absolute font-label text-label uppercase text-text-sub"
      style={{ top, bottom, left, right }}>
      {label}
    </Text>
  );
}

export default function QiblaScreen() {
  const { city } = useLocation();
  const { bearing, heading } = useQibla({ lat: city.lat, lng: city.lng });

  // The needle is fixed in body-frame; the ring rotates by -heading so North
  // ends up where the device thinks North is. The needle then points at
  // bearing - heading (relative to the ring rotation, which is what the user
  // perceives).
  const needleRotation = bearing - heading;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <HexPatternBg
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        opacity={0.12}
      />

      <View className="flex-1 items-center px-screen-pad pt-8">
        <Text className="font-headline-xl text-headline-xl text-text">Qibla</Text>
        <Text className="mt-1 font-body-sm text-body-sm text-text-sub">{city.name}, Sweden</Text>
        <Text className="mt-0.5 font-label text-label uppercase text-accent">
          {Math.round(bearing)}° {compassLabel(bearing)}
        </Text>

        {/* Compass */}
        <View
          accessible
          accessibilityLabel={`Qibla compass pointing ${Math.round(bearing)} degrees`}
          className="my-12 items-center justify-center rounded-full bg-card"
          style={{
            width: COMPASS_SIZE,
            height: COMPASS_SIZE,
            shadowColor: theme.primary,
            shadowOpacity: 0.08,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 6 },
            elevation: 3,
          }}>
          {/* Rotating ring */}
          <View
            className="absolute rounded-full border border-primary-light"
            style={{
              width: COMPASS_SIZE - 16,
              height: COMPASS_SIZE - 16,
              transform: [{ rotate: `${-heading}deg` }],
            }}>
            {/* Tick marks every 30 degrees */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30;
              return (
                <View
                  key={i}
                  className="absolute bg-text-sub"
                  style={{
                    width: 1,
                    height: i % 3 === 0 ? 12 : 6,
                    left: '50%',
                    top: 0,
                    transformOrigin: 'top center' as never,
                    transform: [
                      { translateX: -0.5 },
                      { rotate: `${angle}deg` },
                      { translateY: (COMPASS_SIZE - 16) / 2 - (i % 3 === 0 ? 12 : 6) / 2 - 6 },
                    ],
                    opacity: 0.5,
                  }}
                />
              );
            })}
            <CardinalLabel label="N" top={6} left={(COMPASS_SIZE - 16) / 2 - 6} />
            <CardinalLabel label="E" top={(COMPASS_SIZE - 16) / 2 - 8} right={6} />
            <CardinalLabel label="S" bottom={6} left={(COMPASS_SIZE - 16) / 2 - 6} />
            <CardinalLabel label="W" top={(COMPASS_SIZE - 16) / 2 - 8} left={6} />
          </View>

          {/* Needle */}
          <View
            className="absolute items-center justify-start"
            style={{
              width: 4,
              height: COMPASS_SIZE * 0.6,
              transform: [{ rotate: `${needleRotation}deg` }],
            }}>
            <View
              className="rounded-full bg-accent"
              style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
              <MaterialIcons name="place" size={20} color={theme.card} />
            </View>
            <View
              className="bg-accent"
              style={{ width: 3, flex: 1, marginTop: -4, opacity: 0.8 }}
            />
          </View>

          {/* Center dot */}
          <View className="h-3 w-3 rounded-full bg-primary" />
        </View>

        {/* Calibration card */}
        <View
          className="w-full max-w-md flex-row items-center gap-4 rounded-settings-card bg-card px-card-pad py-4"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
          }}>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-light">
            <MaterialIcons name="explore" size={22} color={theme.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-body-md text-body-md text-text">Preview compass</Text>
            <Text className="font-caption text-caption text-text-sub">
              Live calibration ships when sensors are wired.
            </Text>
          </View>
          <View className="h-2 w-2 rounded-full bg-accent" />
        </View>
      </View>
    </SafeAreaView>
  );
}
