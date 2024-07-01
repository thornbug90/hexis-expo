import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgSettingsIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12 17.25a5.25 5.25 0 1 0 0-10.5 5.25 5.25 0 0 0 0 10.5Z"
      stroke="currentColor"
      strokeWidth={0.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.087 5.118c.28.248.545.513.794.793l2.988.427c.485.844.858 1.747 1.112 2.687l-1.811 2.414s.023.748 0 1.121l1.811 2.415c-.254.94-.628 1.842-1.113 2.686l-2.987.426s-.513.545-.794.794l-.426 2.988c-.844.485-1.747.858-2.687 1.112L12.56 21.17a9.248 9.248 0 0 1-1.121 0l-2.415 1.811a11.308 11.308 0 0 1-2.686-1.113l-.426-2.987a9.248 9.248 0 0 1-.794-.794l-2.988-.426a11.306 11.306 0 0 1-1.112-2.687L2.83 12.56s-.023-.748 0-1.121L1.018 9.024c.254-.94.628-1.842 1.113-2.686l2.987-.426c.248-.28.513-.545.793-.794l.427-2.988a11.306 11.306 0 0 1 2.687-1.112l2.413 1.81a9.242 9.242 0 0 1 1.122 0l2.415-1.81c.94.254 1.842.628 2.686 1.113l.426 2.987Z"
      stroke="currentColor"
      strokeWidth={0.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgSettingsIcon;
