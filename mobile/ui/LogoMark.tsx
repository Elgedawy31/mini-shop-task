import Svg, { G, Path, Rect } from "react-native-svg";

export function LogoMark({
  size = 44,
  color = "#FFFBEB",
  background = "#BB4D00",
}: {
  size?: number;
  color?: string;
  background?: string;
}) {
  const pad = size * 0.125;
  const inner = size - pad * 2;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill={background} />
      <G
        transform="translate(4 4)"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="m2 7 4.041-1.41a2 2 0 0 1 1.959-.276L12 7l4-1.686a2 2 0 0 1 1.959.276L22 7" />
        <Path d="M4 11v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9" />
        <Path d="m4 11-.88-3.123A2 2 0 0 1 5.12 5h13.76a2 2 0 0 1 1.999 2.877L20 11" />
        <Path d="m12 3 1 4" />
        <Path d="M10 15v4" />
        <Path d="M14 15v4" />
      </G>
    </Svg>
  );
}
