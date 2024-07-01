import * as React from "react";
import Svg, { SvgProps, Path, Ellipse } from "react-native-svg";
import { Circle } from "victory-native";

const SpikeballIcon = ({
  width,
  height,
  color = "#F9F9F9",
  ...props
}: SvgProps) => (
  <Svg viewBox="0 0 64 43" fill="none" {...props}>
    <Ellipse cx="32" cy="27.4295" rx="31" ry="2.71581" fill={color} />
    <Path
      d="M1.13257 38.4252V28.125C1.13257 27.7592 1.42913 27.4626 1.79496 27.4626H4.51077C4.8766 27.4626 5.17317 27.7592 5.17317 28.125V38.4252C5.17317 38.791 4.8766 39.0876 4.51077 39.0876H1.79496C1.42913 39.0876 1.13257 38.791 1.13257 38.4252Z"
      fill={color}
      stroke={color}
      stroke-width="0.937949"
    />
    <Path
      d="M58.9594 38.4252V28.125C58.9594 27.7592 59.2559 27.4626 59.6217 27.4626H62.3376C62.7034 27.4626 62.9999 27.7592 62.9999 28.125V38.4252C62.9999 38.791 62.7034 39.0876 62.3376 39.0876H59.6217C59.2559 39.0876 58.9594 38.791 58.9594 38.4252Z"
      fill={color}
      stroke={color}
      stroke-width="0.937949"
    />
    <Path
      d="M30.0128 41.8034V30.1453C30.0128 29.7795 30.3094 29.4829 30.6752 29.4829H33.391C33.7569 29.4829 34.0534 29.7795 34.0534 30.1453V41.8034C34.0534 42.1692 33.7569 42.4658 33.391 42.4658H30.6752C30.3094 42.4658 30.0128 42.1692 30.0128 41.8034Z"
      fill={color}
      stroke={color}
      stroke-width="0.937949"
    />
    <Path
      d="M2.45728 28.2906C6.86673 33.9344 52.7378 35.4944 61.8739 28.2906"
      stroke={color}
      stroke-width="1.60034"
    />
    <Circle cx="34.3184" cy="13.7179" r="4.30556" fill={color} />
    <Path
      d="M38.1438 6.10538L44.5192 1.59613"
      stroke={color}
      stroke-width="1.98718"
      stroke-linecap="round"
    />
    <Path
      d="M42.0022 12.6631L51.4744 6.10042"
      stroke="#F9F9F9"
      stroke-width="1.98718"
      stroke-linecap="round"
    />
    <Path
      d="M40.8098 8.88744L52.1367 0.999987"
      stroke="#F9F9F9"
      stroke-width="1.98718"
      stroke-linecap="round"
    />
  </Svg>
);

export default SpikeballIcon;
