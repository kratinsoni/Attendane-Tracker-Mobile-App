/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#135bec",
        "background-light": "#f6f6f8",
        "background-dark": "#101622",
        // Dark mode specific specific background for the circle
        "dark-card": "#1a2230",
      },
      fontFamily: {
        display: ["Lexend", "sans-serif"], // Ensure you link the font in react-native
      },
    },
  },
  plugins: [],
};
