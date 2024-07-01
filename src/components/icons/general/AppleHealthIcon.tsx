import * as React from "react";
import Svg, {
  SvgProps,
  Defs,
  LinearGradient,
  Stop,
  G,
  Path,
} from "react-native-svg";

const AppleHealth = ({ width = 650, height = 650 }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 650 650"
    width={width}
    height={height}
  >
    <Defs>
      <LinearGradient
        id="a"
        x1={2633.22}
        x2={2633.22}
        y1={75.92}
        y2={86.75}
        gradientTransform="matrix(28 0 0 24.5 -73334.64 -1751.79)"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0} stopColor="#ff61ad" />
        <Stop offset={1} stopColor="#ff2719" />
      </LinearGradient>
    </Defs>
    <G data-name="Layer 2">
      <G data-name="Layer 1">
        <Path
          d="M423.22 0c65 0 97.5 0 132.89 10.83a136.65 136.65 0 0 1 82.33 82.34C650 128.56 650 161.78 650 226.78v196.44c0 65 0 97.5-10.83 132.89a136.65 136.65 0 0 1-82.34 82.33C520.72 650 488.22 650 423.22 650H226.78c-65 0-97.5 0-132.89-10.83a139 139 0 0 1-83.06-83.06C0 521.44 0 488.94 0 423.22V226.78c0-65 0-97.5 10.83-132.89 14.45-38.28 44.06-68.61 83.06-82.33C128.56 0 161.06 0 226.78 0Z"
          style={{
            fill: "#fff",
          }}
        />
        <Path
          d="M546.72 195c0-49.11-37.55-86.67-80.89-86.67-30.33 0-54.89 10.11-70.05 32.5-15.17-22.39-39.72-32.5-65-32.5-49.11 0-86.67 37.56-86.67 86.67 0 72.94 70.06 146.61 151.67 178.39C459.33 352.44 546.72 267.94 546.72 195Z"
          style={{
            fill: "url(#a)",
          }}
        />
      </G>
    </G>
  </Svg>
);
export default AppleHealth;
