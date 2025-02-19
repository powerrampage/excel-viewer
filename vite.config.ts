import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import federation from "@originjs/vite-plugin-federation";
import path from "path";

export default defineConfig({
  plugins: [
    svgr({ svgrOptions: { icon: true } }),
    react(),
    federation({
      name: "app",
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/Button",
      },
      shared: ["react", "react-dom"],
      remotes: {
        app2: 'http://localhost:5001/assets/remoteEntry.js',
      },
    }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // This is where you would configure the output similar to webpack's output settings
        format: 'esm',  // Module format
        dir: 'dist',    // Output directory
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: path.resolve(__dirname, "src") }]
  }
});
