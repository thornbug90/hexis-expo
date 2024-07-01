import * as React from "react";
import Svg, { SvgProps, Circle, Path } from "react-native-svg";

const WearableWithCircleIcon = (props: SvgProps) => (
  <Svg
    width={28}
    height={28}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle cx={14} cy={14} r={13.565} stroke="#359CEF" strokeWidth={0.871} />
    <Path
      fill="#EBECF0"
      stroke="#359CEF"
      strokeWidth={0.294}
      d="M12.37 20.953a.895.895 0 0 0 .166.442.478.478 0 0 0 .373.209h2.604a.477.477 0 0 0 .37-.206.841.841 0 0 0 .144-.305h.01l.014-.13c.138-1.203.535-2.475.967-3.198l.133-.222H11.272l.139.224c.44.711.827 1.955.959 3.186Zm0 0 .146-.016-.146.016Zm5.042-10.208.022.024.03.013c.258.11.478.292.632.523.154.231.236.501.237.778v4.045c0 .276-.083.547-.238.778a1.43 1.43 0 0 1-.634.522l-.032.013-.023.027-.043.051c-.23.263-.478.753-.69 1.354a9.899 9.899 0 0 0-.48 2.104c-.055.47-.36.763-.68.763H12.91c-.322 0-.63-.296-.68-.773a9.389 9.389 0 0 0-.48-2.133c-.212-.593-.463-1.063-.697-1.314l-.056-.06-.02-.023-.03-.012a1.431 1.431 0 0 1-.628-.522c-.153-.23-.235-.5-.235-.775v-4.045c0-.276.082-.545.235-.776.154-.23.372-.412.629-.521l.028-.013.021-.022.056-.06v-.001c.235-.25.485-.72.697-1.314a9.388 9.388 0 0 0 .48-2.133c.05-.477.358-.772.68-.772h2.604c.32 0 .625.292.68.762.087.763.268 1.498.48 2.104.212.602.46 1.092.69 1.353h.001l.048.055Zm-.52-.077h.26l-.134-.223c-.432-.723-.829-1.995-.967-3.199a.883.883 0 0 0-.168-.434.477.477 0 0 0-.37-.205H12.91a.478.478 0 0 0-.373.208.892.892 0 0 0-.166.44c-.132 1.233-.518 2.477-.96 3.188l-.139.225H16.892Zm1.3 5.46v-4.046c0-.34-.137-.665-.38-.904a1.302 1.302 0 0 0-.913-.375h-5.38c-.343 0-.672.135-.915.374-.242.24-.38.565-.38.905v4.046c0 .34.137.665.38.905s.572.374.915.374h5.38c.342 0 .67-.135.913-.375.242-.24.38-.564.38-.904Zm-1.403-1.56v.002c0 .032-.01.064-.03.091a.16.16 0 0 1-.18.058.16.16 0 0 1-.08-.058l-.045-.06h-.853a.047.047 0 0 1-.03-.01.042.042 0 0 1-.015-.025l-.001-.004-.297-1.392-.286-.01-.669 2.345a.046.046 0 0 1-.016.023.05.05 0 0 1-.03.009h-.014a.035.035 0 0 1-.021-.006.03.03 0 0 1-.013-.016l-.004-.013-.663-1.64-.144-.356-.13.362-.257.71-.002.007a.038.038 0 0 1-.014.02.042.042 0 0 1-.025.008h-1.368a.05.05 0 0 1-.034-.015.045.045 0 0 1 0-.064.05.05 0 0 1 .034-.014h1.335l.035-.097.388-1.07.002-.008a.038.038 0 0 1 .014-.02.042.042 0 0 1 .025-.007h.008c.007-.001.015.001.02.005.006.004.01.01.012.016l.002.006.002.007.644 1.594.16.397.118-.411.73-2.556a.044.044 0 0 1 .018-.023.048.048 0 0 1 .03-.009h.008c.008 0 .016.003.022.008a.027.027 0 0 1 .01.018h-.001l.003.013.432 2.01.025.116h.825l.043-.049a.149.149 0 0 1 .115-.05h.002a.164.164 0 0 1 .114.047.158.158 0 0 1 .046.111Z"
    />
  </Svg>
);

export default WearableWithCircleIcon;
