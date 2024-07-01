import { Theme } from "@react-navigation/native";
import { theme } from "../tw";

const navigationTheme: Theme = {
  dark: true,
  colors: {
    card: theme.theme.extend.colors.background[500],
    background: theme.theme.extend.colors.background[500],
    text: theme.theme.extend.colors.white,
    notification: theme.theme.extend.colors.background[200],
    primary: theme.theme.extend.colors.white,
    border: theme.theme.extend.colors.transparent,
  },
};

export default navigationTheme;
