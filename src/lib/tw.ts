import { create } from "twrnc";
export const carbCodeGradients = {
  LOW: ["#E73D5B", "#440712"],
  MEDIUM: ["#FF9301", "#533B0C"],
  HIGH: ["#00A499", "#012926"],
};

export const theme = {
  content: ["./components/**/*.{tsx,jsx,ts}"],
  theme: {
    extend: {
      screens: {
        sm: "380px",
        md: "420px",
        lg: "680px",
        xl: "1024px",
      },
      colors: {
        transparent: "rgba(0,0,0,0)",
        white: "#ffffff",
        black: "#000000",
        almostWhite: "#F9F9F9",
        red: "#E73D5B",
        gray: {
          100: "#F4F4F7",
          200: "#D2D2D2",
          300: "#717171",
          400: "#38383A",
          500: "#303030",
        },
        carbcodelow: {
          100: "#E63D5B",
          200: "#C43653",
          300: "#A1304C",
          400: "#7F2944",
          500: "#5D223C",
        },
        carbcodemedium: {
          100: "#FE9201",
          200: "#D87D08",
          300: "#B16810",
          400: "#8B5417",
          500: "#653F1E",
        },
        carbcodehigh: {
          100: "#00A398",
          200: "#048B86",
          300: "#087474",
          400: "#0C5C63",
          500: "#104451",
        },
        activeblue: {
          100: "#359BEE",
          200: "#2B6FAE",
          300: "#27598E",
          400: "#22426E",
          500: "#1D2C4D",
        },
        background: {
          100: "#7476A6",
          200: "#46486F",
          300: "#30314C",
          350: "#253F67",
          370: "#252238",
          400: "#24223C",
          500: "#18152D",
          600: "#4E4B66",
          green: "#00A499",
          red: "#E73D5B",
        },
        pichart: {
          carbs: "#359CEF",
          protein: "#E73D5B",
          fat: "#FDD015",
        },
      },
      fontSize: {
        xxs: "10px",
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        "20": "20px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
      fontFamily: {
        "poppins-thin": "Poppins_100Thin",
        "poppins-thinitalic": "Poppins_100Thin_Italic",
        "poppins-extralight": "Poppins_200ExtraLight",
        "poppins-extralightitalic": "Poppins_200ExtraLight_Italic",
        "poppins-light": "Poppins_300Light",
        "poppins-lightitalic": "Poppins_300Light_Italic",
        "poppins-regular": "Poppins_400Regular",
        "poppins-regularitalic": "Poppins_400Regular_Italic",
        "poppins-medium": "Poppins_500Medium",
        "poppins-mediumitalic": "Poppins_500Medium_Italic",
        "poppins-semibold": "Poppins_600SemiBold",
        "poppins-semibolditalic": "Poppins_600SemiBold_Italic",
        "poppins-bold": "Poppins_700Bold",
        "poppins-bolditalic": "Poppins_700Bold_Italic",
        "poppins-extrabold": "Poppins_800ExtraBold",
        "poppins-extrabolditalic": "Poppins_800ExtraBold_Italic",
        "poppins-black": "Poppins_900Black",
        "poppins-blackitalic": "Poppins_900Black_Italic",
      },
      borderWidth: {
        "5": "7px",
        "16": "16px",
      },
      borderRadius: {
        larger: "10px",
      },
    },
  },
};

const tw = create(theme);
export default tw;
