import { View, type ViewStyle } from 'react-native';
import Svg, { Defs, G, Line, Pattern, Polygon, Rect } from 'react-native-svg';

import { theme } from '@/constants/theme';

type Props = {
  style?: ViewStyle;
  opacity?: number;
};

// Tiled hexagon pattern used as a low-opacity background watermark on the
// Qibla screen (Design.md "Islamic Geometric Pattern" section).
export function HexPatternBg({ style, opacity = 0.12 }: Props) {
  const size = 60;
  const r = size / 2;
  const cx = r;
  const cy = r;

  // Outer hexagon points (flat-top)
  const outer = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 3) * i;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    })
    .join(' ');

  const inner = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${cx + r * 0.5 * Math.cos(a)},${cy + r * 0.5 * Math.sin(a)}`;
    })
    .join(' ');

  return (
    <View pointerEvents="none" style={[{ opacity }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="hex" x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
            <G stroke={theme.primary} strokeWidth={0.8} fill="none">
              <Polygon points={outer} />
              <Polygon points={inner} />
              <Line x1={cx} y1={0} x2={cx} y2={size} />
              <Line x1={0} y1={cy} x2={size} y2={cy} />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hex)" />
      </Svg>
    </View>
  );
}
