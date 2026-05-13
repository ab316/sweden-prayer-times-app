import { MaterialIcons } from '@expo/vector-icons';
import { Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Polygon } from 'react-native-svg';

import { HexPatternBg } from '@/components/ui/hex-pattern-bg';
import { theme } from '@/constants/theme';
import { useLocation } from '@/features/location';
import { compassLabel } from '@/lib/time/qibla';

import { useQibla } from '../hooks/use-qibla';

const COMPASS_SIZE = 260;
const CENTER = COMPASS_SIZE / 2;
const OUTER_RADIUS = 126;
const INNER_RADIUS = 104;
const DEGREE_TICKS = Array.from({ length: 36 }, (_, i) => i * 10);
const MARKER_RADIUS = 10;

function polarPoint(radius: number, degrees: number) {
  const radians = ((degrees - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function CardinalLabel({ label, style }: { label: string; style: TextStyle }) {
  return (
    <Text
      className={`absolute z-10 font-label text-[12px] leading-4 ${
        label === 'N' ? 'text-accent' : 'text-primary'
      }`}
      style={style}>
      {label}
    </Text>
  );
}

function CompassFace({ heading }: { heading: number }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 30,
        right: 30,
        bottom: 30,
        left: 30,
        transform: [{ rotate: `${-heading}deg` }],
      }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}>
        {DEGREE_TICKS.map((degree) => {
          const major = degree % 90 === 0;
          const outer = polarPoint(OUTER_RADIUS - 30, degree);
          const inner = polarPoint(OUTER_RADIUS - (major ? 38 : 34), degree);

          return (
            <Line
              key={degree}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={theme.primary}
              strokeOpacity={major ? 0.42 : 0.18}
              strokeWidth={1}
            />
          );
        })}
      </Svg>
    </View>
  );
}

function QiblaNeedle({ rotation }: { rotation: number }) {
  return (
    <Svg
      pointerEvents="none"
      style={{ position: 'absolute' }}
      width={COMPASS_SIZE}
      height={COMPASS_SIZE}
      viewBox={`0 0 ${COMPASS_SIZE} ${COMPASS_SIZE}`}>
      <G transform={`rotate(${rotation} ${CENTER} ${CENTER})`}>
        <Line
          x1={CENTER}
          y1={CENTER + 70}
          x2={CENTER}
          y2={CENTER - 88}
          stroke={theme.primary}
          strokeOpacity={0.16}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <Polygon
          points={`${CENTER},${CENTER - 90} ${CENTER + 5},${CENTER} ${CENTER - 5},${CENTER}`}
          fill={theme.primary}
        />
        <Polygon
          points={`${CENTER},${CENTER + 70} ${CENTER + 4},${CENTER} ${CENTER - 4},${CENTER}`}
          fill={theme.primary}
          opacity={0.38}
        />
        <Circle
          cx={CENTER}
          cy={CENTER - 94}
          r={MARKER_RADIUS}
          fill={theme.card}
          stroke={theme.primary}
          strokeWidth={2}
        />
        <Path
          d={`M${CENTER - 4} ${CENTER - 95}L${CENTER} ${CENTER - 99}L${CENTER + 4} ${CENTER - 95}V${CENTER - 90}H${CENTER - 4}Z`}
          fill={theme.primary}
        />
      </G>
    </Svg>
  );
}

export default function QiblaScreen() {
  const { city } = useLocation();
  const { bearing, calibrated, heading, headingSource } = useQibla({ lat: city.lat, lng: city.lng });
  const needleRotation = bearing - heading;
  const statusLabel = calibrated ? 'Calibrated' : 'Needs Calibration';
  const statusText =
    headingSource === 'sensor'
      ? 'Move phone in a figure 8 to recalibrate'
      : 'Preview mode on web; live compass works on device';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-bg">
      <HexPatternBg
        style={{ position: 'absolute', top: 132, left: 0, right: 0, bottom: 94 }}
        opacity={0.12}
      />

      <View className="flex-1 px-screen-pad pb-5 pt-10">
        <View className="items-center">
          <Text className="font-headline-xl text-headline-xl text-primary">Qibla</Text>

          <View className="mt-2 flex-row items-center justify-center gap-1.5">
            <MaterialIcons name="near-me" size={15} color={theme.primary} />
            <Text className="font-body-sm text-body-sm text-text" numberOfLines={1}>
              {city.name}, Sweden
            </Text>
          </View>

          <Text className="mt-0.5 font-caption text-caption text-text-sub">
            {Math.round(bearing)}
            {'\u00b0'} {compassLabel(bearing)}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center py-6">
          <View
            accessible
            accessibilityLabel={`Qibla compass pointing ${Math.round(bearing)} degrees ${compassLabel(
              bearing,
            )}`}
            className="items-center justify-center rounded-full"
            style={{
              width: COMPASS_SIZE,
              height: COMPASS_SIZE,
              backgroundColor: `${theme.card}bd`,
              borderColor: `${theme.primary}33`,
              borderWidth: 1,
              shadowColor: theme.primary,
              shadowOpacity: 0.08,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
              elevation: 3,
            }}>
            <View
              className="absolute rounded-full border border-primary-light"
              style={{
                width: INNER_RADIUS * 2,
                height: INNER_RADIUS * 2,
                opacity: 0.72,
              }}
            />

            <CardinalLabel label="N" style={{ top: 8, left: CENTER - 5 }} />
            <CardinalLabel label="E" style={{ top: CENTER - 8, right: 8 }} />
            <CardinalLabel label="S" style={{ bottom: 8, left: CENTER - 4 }} />
            <CardinalLabel label="W" style={{ top: CENTER - 8, left: 8 }} />

            <CompassFace heading={heading} />
            <QiblaNeedle rotation={needleRotation} />
            <View className="h-3 w-3 rounded-full bg-primary" />
          </View>
        </View>

        <View
          className="flex-row items-center gap-3 rounded-settings-card bg-card px-4 py-3.5"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}>
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
            <MaterialIcons name="explore" size={19} color={theme.primary} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-body-md text-body-md text-text">{statusLabel}</Text>
            <Text className="font-caption text-caption text-text-sub" numberOfLines={2}>
              {statusText}
            </Text>
          </View>
          <View className={`h-2 w-2 rounded-full ${calibrated ? 'bg-primary' : 'bg-accent'}`} />
        </View>

        <View className="mt-3 rounded-settings-card bg-primary-light px-4 py-3">
          <Text className="font-body-md text-body-md text-text">How to use</Text>
          <Text className="mt-1 font-caption text-caption text-text-sub">
            Hold your phone flat and slowly turn until the Kaaba marker aligns with the top of the
            compass.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
