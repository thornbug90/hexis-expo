import * as React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  width: number;
  height: number;
}

const LinkIcon = ({ width = 24, height = 24 }: Props) => (
  <Svg
    width={width}
    height={height}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Path
      d="m11.466 6.694 1.856-1.856a4.134 4.134 0 0 1 5.84 5.84l-2.652 2.644a4.116 4.116 0 0 1-5.832 0"
      stroke="#F9F9F9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m12.534 17.306-1.856 1.857a4.135 4.135 0 0 1-5.84-5.841l2.653-2.644a4.116 4.116 0 0 1 5.83 0"
      stroke="#F9F9F9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default LinkIcon;
