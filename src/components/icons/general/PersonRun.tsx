import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const PersonRun = (props: SvgProps) => (
  <Svg
    width={28}
    height={28}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M16.625 8.75a2.625 2.625 0 1 0 0-5.25 2.625 2.625 0 0 0 0 5.25ZM6.125 11.113s3.5-3.238 8.75.875c5.523 4.309 8.75 2.625 8.75 2.625"
      stroke="#F9F9F9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.777 11.9c-.482 2.231-3.664 10.74-11.277 9.975"
      stroke="#F9F9F9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12.097 17.631c1.958.416 7.153 2.056 7.153 7.744"
      stroke="#F9F9F9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PersonRun;
