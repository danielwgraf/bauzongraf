import { Inter, Cormorant_Garamond } from "next/font/google";
import localFont from "next/font/local";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-cormorant",
});

export const oldforge = localFont({
  src: "../assets/fonts/oldforge/oldforge-webfont.woff2",
  variable: "--font-oldforge",
});

export const parochus = localFont({
  src: [
    {
      path: "../assets/fonts/medieval/parochus-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/medieval/parochus-webfont.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-parochus",
});

export const parochus_original = localFont({
  src: [
    {
      path: "../assets/fonts/medieval/parochus-original-webfont.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/medieval/parochus-original-webfont.woff",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-parochus-original",
}); 