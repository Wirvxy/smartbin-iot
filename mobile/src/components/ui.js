import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { C, F, R, STATE, fillState } from '../theme';

/** Primary (ink) or secondary (outlined) button. */
export function Button({ title, onPress, variant = 'primary', disabled, style, small }) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        small && styles.btnSmall,
        primary ? styles.btnPrimary : styles.btnGhost,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.btnText, small && { fontSize: 14 }, { color: primary ? C.white : C.ink }]}>{title}</Text>
    </Pressable>
  );
}

/** Fill-state pill: "De la place", "Bientôt plein", "Plein". */
export function StatePill({ fill, threshold }) {
  const s = STATE[fillState(fill, threshold)];
  return (
    <View style={[styles.pill, { backgroundColor: s.soft }]}>
      <Text style={[styles.pillText, { color: s.ink }]}>{s.label}</Text>
    </View>
  );
}

/** White panel with a hairline border, like the web dashboard. */
export function Panel({ children, style, flush }) {
  return <View style={[styles.panel, flush && { padding: 0 }, style]}>{children}</View>;
}

/** Small horizontal fill meter with the threshold tick. */
export function Meter({ fill, threshold = 80, width = 96 }) {
  const s = STATE[fillState(fill, threshold)];
  return (
    <View style={[styles.meterTrack, { width }]}>
      <View style={[styles.meterFill, { width: `${Math.min(100, fill)}%`, backgroundColor: s.color }]} />
      <View style={[styles.meterLimit, { left: `${Math.min(100, threshold)}%` }]} />
    </View>
  );
}

/** The SmartBin mark: lid + tapered body, partly filled. */
export function Logo({ size = 22, color = C.white, fillColor }) {
  return (
    <Svg width={size} height={size * 1.18} viewBox="0 0 22 26">
      <Rect x={0} y={0} width={22} height={4} rx={2} fill={color} />
      <Path d="M2 6h18l-1.6 20H3.6z" fill="none" stroke={color} strokeWidth={2} />
      <Path d="M3.2 16h15.6l-.8 10H4z" fill={fillColor || color} />
    </Svg>
  );
}

/** Tab bar icons, drawn to match the line weight of the logo. */
export function TabIcon({ name, color, size = 24 }) {
  const p = { stroke: color, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'bins' && (<>
        <Rect x={4} y={3} width={16} height={3} rx={1.5} fill={color} />
        <Path d="M5.5 8h13l-1.2 13H6.7z" {...p} />
        <Path d="M6.3 15h11.4l-.6 6H6.9z" fill={color} />
      </>)}
      {name === 'map' && (<>
        <Path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" {...p} />
        <Circle cx={12} cy={10} r={2.4} fill={color} />
      </>)}
      {name === 'stats' && (<>
        <Path d="M4 20h16" {...p} />
        <Rect x={5.5} y={11} width={3.5} height={7} rx={1} fill={color} />
        <Rect x={10.25} y={6} width={3.5} height={12} rx={1} fill={color} />
        <Rect x={15} y={13.5} width={3.5} height={4.5} rx={1} fill={color} />
      </>)}
      {name === 'profile' && (<>
        <Circle cx={12} cy={8.5} r={3.8} {...p} />
        <Path d="M4.5 20.5c1.3-3.6 4.2-5.4 7.5-5.4s6.2 1.8 7.5 5.4" {...p} />
      </>)}
    </Svg>
  );
}

export const styles = StyleSheet.create({
  btn: { height: 46, paddingHorizontal: 18, borderRadius: R.control, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  btnSmall: { height: 36, paddingHorizontal: 14 },
  btnPrimary: { backgroundColor: C.ink, borderColor: C.ink },
  btnGhost: { backgroundColor: C.surface, borderColor: C.lineStrong },
  btnText: { fontFamily: F.medium, fontSize: 16 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, height: 24, borderRadius: 12, justifyContent: 'center' },
  pillText: { fontFamily: F.medium, fontSize: 13 },
  panel: { backgroundColor: C.surface, borderRadius: R.panel, borderWidth: 1, borderColor: C.line, padding: 20 },
  meterTrack: { height: 8, borderRadius: 4, backgroundColor: C.empty, position: 'relative' },
  meterFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4 },
  meterLimit: { position: 'absolute', top: -4, bottom: -4, width: 2, marginLeft: -1, backgroundColor: C.ink, opacity: 0.6 },
});
