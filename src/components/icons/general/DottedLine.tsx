import * as React from "react";
import Svg, { SvgProps, Defs, G, Path } from "react-native-svg";

type Props = SvgProps & {
  width?: number;
  height?: number;
};

const Line = ({ width = 343.16, height = 12, ...rest }: Props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 343.16 12"
    width={width}
    height={height}
    {...rest}
  >
    <Defs></Defs>
    <G id="Layer_2" data-name="Layer 2">
      <G id="Layer_1-2" data-name="Layer 1">
        <Path d="M6 6h20" className="cls-1" />
        <Path
          d="M67.59 6h228.77"
          style={{
            strokeDasharray: "41.59 41.59",
            fill: "none",
            stroke: "#fff",
            strokeLinecap: "round",
            strokeMiterlimit: 10,
            strokeWidth: 12,
          }}
        />
        <Path d="M317.16 6h20" className="cls-1" />
      </G>
    </G>
  </Svg>
);

export default Line;
