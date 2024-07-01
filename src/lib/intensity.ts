import {
  HardIntensityIcon,
  LightIntensityIcon,
  ModerateIntensityIcon,
} from "../components/icons/general";

export const intensityMapping = {
  100: "Maximal",
  93: "Extremely Hard",
  77: "Very Hard",
  60: "Hard",
  46: "Somewhat Hard",
  33: "Moderate",
  20: "Easy",
  10: "Very Easy",
  0: "Minimal",
};
export const intensityBarIcons = [
  { max: 33, Icon: LightIntensityIcon },
  { max: 60, Icon: ModerateIntensityIcon },
  { max: 100, Icon: HardIntensityIcon },
];

export const IdsNeedPowerAvgs = [
  "ckysvfaax0031y9s7xa3uasmh",
  "ckysvfaaz0076y9s7vs4tybwf",
  "ST7wsTOS1T0e7N4wJuh",
  "zeNnL84Vj1VYWoP31EE",
];
