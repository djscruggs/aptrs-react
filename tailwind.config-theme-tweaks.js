/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  daisyui: {
    
    themes: [
      "corporate", 
      "forest",
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=corporate]"],
          primary: "#3E6F93",
          accent: '#FBB03A',

        },
      },
    ],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  
}

