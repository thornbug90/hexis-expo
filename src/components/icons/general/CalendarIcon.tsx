import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const SvgCalendarIcon = (props: SvgProps) => (
  <Svg
    viewBox="0 0 45 43"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M35.87 5.546h5.348c.472.001.924.188 1.258.52.334.332.522.782.524 1.252v31.909c-.002.47-.19.92-.524 1.252-.334.332-.786.52-1.258.521H3.782a1.793 1.793 0 0 1-1.258-.521A1.774 1.774 0 0 1 2 39.227V7.318c.002-.47.19-.92.524-1.252.334-.332.786-.519 1.258-.52h5.349M12.696 2v7.091M32.305 2v7.091m-11.44 7.09h3.27m5.643 0h3.27m-12.183 8.864h3.27m-12.184 0h3.271m14.556 0h3.27m-16.787-19.5H28.74M20.865 33.91h3.27m-12.184 0h3.271"
      stroke="currentColor"
      strokeWidth={2.058}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default SvgCalendarIcon;
