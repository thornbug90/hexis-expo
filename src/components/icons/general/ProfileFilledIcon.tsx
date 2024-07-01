import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgProfileFilledIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M16 3.40039C17.7239 3.40039 19.3772 4.08521 20.5962 5.3042C21.8152 6.52318 22.5 8.17648 22.5 9.90039C22.5 11.6243 21.8152 13.2776 20.5962 14.4966C19.3772 15.7156 17.7239 16.4004 16 16.4004C14.2761 16.4004 12.6228 15.7156 11.4038 14.4966C10.1848 13.2776 9.5 11.6243 9.5 9.90039C9.5 8.17648 10.1848 6.52318 11.4038 5.3042C12.6228 4.08521 14.2761 3.40039 16 3.40039ZM16 19.6504C23.1825 19.6504 29 22.5591 29 26.1504V29.4004H3V26.1504C3 22.5591 8.8175 19.6504 16 19.6504Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={0}
    />
  </Svg>
);

export default SvgProfileFilledIcon;
