/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: "#16262B",
          100: "#1F2F35",
          500: "#16262B",
          700: "#0F1A1F",
          900: "#0A1217",
        },
        dark_sec: {
          DEFAULT: "#1F363D",
          100: "#27424A",
          500: "#1F363D",
          700: "#16262B",
        },
        primary: {
          DEFAULT: "#40798C",
          100: "#5C8F9D",
          500: "#40798C",
          700: "#2C5D6D",
        },
        blue_green: {
          DEFAULT: "#70A9A1",
          100: "#8BBDB5",
          500: "#70A9A1",
          700: "#558B84",
        },
        green: {
          DEFAULT: "#9EC1A3",
          100: "#B6D1B8",
          500: "#9EC1A3",
          700: "#7DA68A",
        },
        light_green: {
          DEFAULT: "#CFE0C3",
          100: "#E4EDDC",
          500: "#CFE0C3",
          700: "#B8CBAA",
        },
        secondary: {
          DEFAULT: "#EBEBEB",
          100: "#F5F5F5",
          500: "#EBEBEB",
          700: "#D6D6D6",
        },
        action: {
          DEFAULT: "#EF654D",
          100: "#F58C77",
          500: "#EF654D",
          700: "#D94E38",
        },
      },
    },
  },
  plugins: [],
};
