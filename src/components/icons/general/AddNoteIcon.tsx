import * as React from "react";
import Svg, { Path } from "react-native-svg";

const AddNoteIcon = ({ width = 18, height = 18, color = "#fff", ...props }) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox={`0 0 18 18`}
    fill="none"
  >
    <Path
      fill={color}
      d="M5.58 6a.563.563 0 0 1 .563-.563h6a.563.563 0 1 1 0 1.125h-6A.562.562 0 0 1 5.58 6Zm.563 3.563h6a.563.563 0 1 0 0-1.126h-6a.562.562 0 1 0 0 1.126Zm3 1.874h-3a.562.562 0 0 0 0 1.126h3a.562.562 0 0 0 0-1.126ZM17.955 1.5v10.19a1.309 1.309 0 0 1-.384.928l-4.81 4.81a1.308 1.308 0 0 1-.928.384H1.643A1.313 1.313 0 0 1 .33 16.5v-15A1.312 1.312 0 0 1 1.643.187h15A1.312 1.312 0 0 1 17.955 1.5ZM1.643 16.688h9.937V12a.562.562 0 0 1 .563-.563h4.687V1.5a.187.187 0 0 0-.187-.188h-15a.187.187 0 0 0-.188.188v15a.188.188 0 0 0 .188.188Zm14.392-4.125h-3.33v3.33l3.33-3.33Z"
    />
  </Svg>
);

export default AddNoteIcon;
