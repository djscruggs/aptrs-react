const withMT = require("@material-tailwind/react/utils/withMT");
 
module.exports = withMT({
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  /* These text colors are generated dynamically in vulnerabilities
     Tailwindcss can't create them at compile time so we explicitly add them here. */
  safelist: [
    'text-[#3399FF]',
    'text-[#FF491C]',
    'text-[#F66E09]',
    'text-[#FBBC02]',
    'text-[#20B803]'
  ],
  
  theme: {
    extend: {},
    colors: {
      primary: '#0c5fd6',
      secondary: '#D60C5F',
      // ...
    }
  },
  plugins: [],
});