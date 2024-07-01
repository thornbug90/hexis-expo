import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";
const ArrowBackAndForth = ({
  width = 41,
  height = 41,
  color = "#fff",
  ...props
}: SvgProps) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 41 41"
    width={width}
    height={height}
    fill="none"
    {...props}
  >
    <Path
      d="M33.3074 27.5955C33.483 27.7713 33.5816 28.0096 33.5816 28.258C33.5816 28.5064 33.483 28.7447 33.3074 28.9205L28.3074 33.9205C28.1297 34.0861 27.8946 34.1762 27.6517 34.172C27.4089 34.1677 27.1771 34.0693 27.0054 33.8975C26.8336 33.7258 26.7352 33.494 26.7309 33.2511C26.7266 33.0083 26.8168 32.7732 26.9824 32.5955L30.3808 29.1955H7.6449C7.39626 29.1955 7.1578 29.0967 6.98198 28.9209C6.80617 28.7451 6.7074 28.5066 6.7074 28.258C6.7074 28.0093 6.80617 27.7709 6.98198 27.5951C7.1578 27.4193 7.39626 27.3205 7.6449 27.3205H30.3808L26.9824 23.9205C26.8168 23.7428 26.7266 23.5077 26.7309 23.2648C26.7352 23.022 26.8336 22.7902 27.0054 22.6185C27.1771 22.4467 27.4089 22.3483 27.6517 22.344C27.8946 22.3397 28.1297 22.4299 28.3074 22.5955L33.3074 27.5955ZM11.9824 18.9205C12.1601 19.0861 12.3952 19.1762 12.6381 19.172C12.8809 19.1677 13.1127 19.0693 13.2844 18.8975C13.4562 18.7257 13.5546 18.494 13.5589 18.2511C13.5632 18.0083 13.473 17.7732 13.3074 17.5955L9.90896 14.1955H32.6449C32.8935 14.1955 33.132 14.0967 33.3078 13.9209C33.4836 13.7451 33.5824 13.5066 33.5824 13.258C33.5824 13.0093 33.4836 12.7709 33.3078 12.5951C33.132 12.4193 32.8935 12.3205 32.6449 12.3205H9.90896L13.3074 8.92049C13.473 8.74277 13.5632 8.50771 13.5589 8.26483C13.5546 8.02196 13.4562 7.79023 13.2844 7.61846C13.1127 7.44669 12.8809 7.3483 12.6381 7.34402C12.3952 7.33973 12.1601 7.42989 11.9824 7.59549L6.9824 12.5955C6.80683 12.7713 6.70822 13.0095 6.70822 13.258C6.70822 13.5064 6.80683 13.7447 6.9824 13.9205L11.9824 18.9205Z"
      fill="white"
    />
  </Svg>
);
export default ArrowBackAndForth;