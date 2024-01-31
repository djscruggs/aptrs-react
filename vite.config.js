import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    // depending on your application, base can also be "/"
    base: '',
    plugins: [react(), viteTsconfigPaths()],
    server: {    
        // this ensures that the browser opens upon server start
        open: true,
        // this sets a default port to 3000  
        port: 3000, 
    },
    
})

// import browserslistToEsbuild from 'browserslist-to-esbuild'

// export default defineConfig({
//     // depending on your application, base can also be "/"
//     base: '',
//     plugins: [react(), viteTsconfigPaths()],
//     server: {    
//         // this ensures that the browser opens upon server start
//         open: true,
//         // this sets a default port to 3000  
//         port: 3000, 
//     },
//     build: {
//       // --> ["chrome79", "edge92", "firefox91", "safari13.1"]
//       target: browserslistToEsbuild(),
//     },
// })