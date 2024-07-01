import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgRecurringIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M1 10.998c0-2.29.769-4.51 2.178-6.29a9.747 9.747 0 0 1 5.561-3.49 9.585 9.585 0 0 1 6.47.867 9.908 9.908 0 0 1 4.497 4.835m0-4.183v4.348m-4.252 0h4.252M1.85 15.077a9.908 9.908 0 0 0 4.497 4.836 9.585 9.585 0 0 0 6.47.866 9.748 9.748 0 0 0 5.561-3.489c1.409-1.78 2.178-4 2.178-6.29M1.85 19.259V14.91h4.252"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgRecurringIcon;
