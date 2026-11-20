import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Line, ClipPath, Defs } from 'react-native-svg';
import { C, F, STATE, fillState } from '../theme';

/**
 * A bin drawn at its fill level, with its alert threshold as a dashed line.
 * Same drawing as the web dashboard's "bin wall".
 *
 * size: width in px (height follows the bin's proportions)
 * dark: light-on-ink variant for dark backgrounds
 */
export default function BinGauge({ fill = 0, threshold = 80, size = 84, showPct = true, dark = false, style }) {
  const state = fillState(fill, threshold);
  const w = size;
  const lidH = Math.max(4, Math.round(size * 0.12));
  const bodyH = Math.round(size * 1.85);
  const inset = Math.round(size * 0.06);
  const taper = Math.round(size * 0.07);
  const top = lidH + 3;
  const h = top + bodyH;
  const level = Math.max(0, Math.min(100, fill));
  const fillTop = top + bodyH * (1 - level / 100);
  const limitY = top + bodyH * (1 - Math.min(threshold, 100) / 100);
  const body = `M${inset} ${top} H${w - inset} L${w - inset - taper} ${h} H${inset + taper} Z`;
  const clipId = 'bin' + React.useId().replace(/[^a-zA-Z0-9]/g, '');

  return (
    <View style={[styles.wrap, { width: w }, style]}>
      {showPct && (
        <Text style={[styles.pct, { fontSize: Math.max(14, Math.round(size * 0.31)), color: state === 'full' ? STATE.full.ink : (dark ? C.white : C.ink) }]}>
          {Math.round(fill)}
          <Text style={{ fontSize: Math.max(10, Math.round(size * 0.2)) }}>%</Text>
        </Text>
      )}
      <Svg width={w} height={h} accessible={false}>
        <Defs>
          <ClipPath id={clipId}>
            <Path d={body} />
          </ClipPath>
        </Defs>
        <Rect x={0} y={0} width={w} height={lidH} rx={Math.min(6, lidH / 2)} fill={dark ? C.white : C.ink} />
        <Path d={body} fill={dark ? 'rgba(255,255,255,0.12)' : C.empty} />
        <Rect x={0} y={fillTop} width={w} height={h - fillTop} fill={STATE[state].color} clipPath={`url(#${clipId})`} />
        <Line x1={inset} x2={w - inset} y1={limitY} y2={limitY}
              stroke={dark ? C.white : C.ink} strokeOpacity={0.55} strokeWidth={size >= 60 ? 2 : 1.5} strokeDasharray="5,4" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  pct: { fontFamily: F.display, marginBottom: 6, fontVariant: ['tabular-nums'] },
});
