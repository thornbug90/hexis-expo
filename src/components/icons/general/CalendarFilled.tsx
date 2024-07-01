import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const CalendarFilled = (props: SvgProps) => (
  <Svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M26.3334 4.40039H23.3334V3.40039C23.3334 3.13517 23.228 2.88082 23.0405 2.69328C22.8529 2.50575 22.5986 2.40039 22.3334 2.40039C22.0682 2.40039 21.8138 2.50575 21.6263 2.69328C21.4387 2.88082 21.3334 3.13517 21.3334 3.40039V4.40039H11.3334V3.40039C11.3334 3.13517 11.228 2.88082 11.0405 2.69328C10.8529 2.50575 10.5986 2.40039 10.3334 2.40039C10.0682 2.40039 9.8138 2.50575 9.62627 2.69328C9.43873 2.88082 9.33337 3.13517 9.33337 3.40039V4.40039H6.33337C5.80294 4.40039 5.29423 4.6111 4.91916 4.98618C4.54409 5.36125 4.33337 5.86996 4.33337 6.40039V26.4004C4.33337 26.9308 4.54409 27.4395 4.91916 27.8146C5.29423 28.1897 5.80294 28.4004 6.33337 28.4004H26.3334C26.8638 28.4004 27.3725 28.1897 27.7476 27.8146C28.1227 27.4395 28.3334 26.9308 28.3334 26.4004V6.40039C28.3334 5.86996 28.1227 5.36125 27.7476 4.98618C27.3725 4.6111 26.8638 4.40039 26.3334 4.40039ZM26.3334 10.4004H6.33337V6.40039H9.33337V7.40039C9.33337 7.66561 9.43873 7.91996 9.62627 8.1075C9.8138 8.29503 10.0682 8.40039 10.3334 8.40039C10.5986 8.40039 10.8529 8.29503 11.0405 8.1075C11.228 7.91996 11.3334 7.66561 11.3334 7.40039V6.40039H21.3334V7.40039C21.3334 7.66561 21.4387 7.91996 21.6263 8.1075C21.8138 8.29503 22.0682 8.40039 22.3334 8.40039C22.5986 8.40039 22.8529 8.29503 23.0405 8.1075C23.228 7.91996 23.3334 7.66561 23.3334 7.40039V6.40039H26.3334V10.4004Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={0}
      //   strokeLinecap="round"
      //   strokeLinejoin="round"
    />
  </Svg>
);

export default CalendarFilled;
