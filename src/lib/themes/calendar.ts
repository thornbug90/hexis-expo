import {} from "react-native-calendars";
import { theme } from "../tw";

const calendarTheme = {
  backgroundColor: theme.theme.extend.colors.background[500],
  calendarBackground: theme.theme.extend.colors.background[500],
  textSectionTitleColor: theme.theme.extend.colors.white,
  textSectionTitleDisabledColor: theme.theme.extend.colors.background[100],
  selectedDayBackgroundColor: theme.theme.extend.colors.activeblue[100],
  selectedDayTextColor: theme.theme.extend.colors.white,
  todayTextColor: theme.theme.extend.colors.activeblue[100],
  dayTextColor: theme.theme.extend.colors.white,
  textDisabledColor: theme.theme.extend.colors.background[200],
  dotColor: theme.theme.extend.colors.activeblue[100],
  selectedDotColor: theme.theme.extend.colors.white,
  arrowColor: theme.theme.extend.colors.white,
  disabledArrowColor: theme.theme.extend.colors.background[300],
  monthTextColor: theme.theme.extend.colors.white,
  indicatorColor: theme.theme.extend.colors.white,
  textDayFontFamily: theme.theme.extend.fontFamily["poppins-regular"],
  textMonthFontFamily: theme.theme.extend.fontFamily["poppins-semibold"],
  textDayHeaderFontFamily: theme.theme.extend.fontFamily["poppins-semibold"],
  textDayFontWeight: "400",
  textMonthFontWeight: "bold",
  textDayHeaderFontWeight: "300",
  textDayFontSize: 13,
  textMonthFontSize: 16,
  textDayHeaderFontSize: 13,
  "stylesheet.calendar.header": {
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingLeft: 90,
      paddingRight: 90,
      alignItems: "center",
    },
  },
};

export default calendarTheme;
