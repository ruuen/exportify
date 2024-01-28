import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base URL to deploy URL injected by Netlify
  // In dev env, this will return Netlify dev server URL & port
  // In deploy previews, this will return associated HTTPS URL
  // In prod env. this will return main HTTPS URL
  base: process.env.URL,
});
