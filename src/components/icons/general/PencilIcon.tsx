import * as React from "react";
import Svg, { Path } from "react-native-svg";

const PencilIcon = ({ color = "#fff", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={25}
    viewBox={`0 0 24 25`}
    fill="none"
    {...props}
  >
    <Path
      d="M21.1781 7.51068L16.9884 3.32099C16.8666 3.1991 16.7219 3.10241 16.5626 3.03644C16.4034 2.97048 16.2327 2.93652 16.0603 2.93652C15.8879 2.93652 15.7173 2.97048 15.558 3.03644C15.3988 3.10241 15.2541 3.1991 15.1322 3.32099L3.57188 14.8822C3.44975 15.0039 3.35292 15.1486 3.28695 15.3079C3.22098 15.4672 3.18718 15.638 3.1875 15.8104V20.0001C3.1875 20.3482 3.32578 20.682 3.57192 20.9281C3.81807 21.1743 4.15191 21.3126 4.5 21.3126H8.68969C8.8621 21.3129 9.03287 21.2791 9.19216 21.2131C9.35145 21.1471 9.49611 21.0503 9.61781 20.9282L21.1781 9.36693C21.3 9.24505 21.3967 9.10036 21.4627 8.94111C21.5286 8.78186 21.5626 8.61118 21.5626 8.43881C21.5626 8.26643 21.5286 8.09575 21.4627 7.9365C21.3967 7.77725 21.3 7.63256 21.1781 7.51068ZM4.54594 15.5001L12.75 7.29506L14.5791 9.12506L6.375 17.3291L4.54594 15.5001ZM4.3125 20.0001V16.8576L7.64156 20.1876H4.5C4.45027 20.1876 4.40258 20.1678 4.36742 20.1326C4.33226 20.0975 4.3125 20.0498 4.3125 20.0001ZM9 19.9541L7.17094 18.1251L15.375 9.92006L17.2041 11.7501L9 19.9541ZM20.3822 8.57193L18 10.9541L13.5459 6.50006L15.9281 4.11693C15.9455 4.0995 15.9662 4.08567 15.989 4.07623C16.0117 4.0668 16.0361 4.06194 16.0608 4.06194C16.0854 4.06194 16.1098 4.0668 16.1326 4.07623C16.1553 4.08567 16.176 4.0995 16.1934 4.11693L20.3822 8.30662C20.3996 8.32403 20.4135 8.34471 20.4229 8.36747C20.4323 8.39024 20.4372 8.41463 20.4372 8.43927C20.4372 8.46391 20.4323 8.48831 20.4229 8.51108C20.4135 8.53384 20.3996 8.55452 20.3822 8.57193Z"
      fill="white"
    />
  </Svg>
);

export default PencilIcon;
