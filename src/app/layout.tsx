import type { Metadata } from "next";
import {
  inter,
  cormorant,
  oldforge,
  parochus,
  parochus_original,
} from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Macy & Daniel's Wedding",
  description: "Join us for our fairytale wedding in France",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} ${oldforge.variable} ${parochus.variable} ${parochus_original.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
