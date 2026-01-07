import type { Metadata } from "next";
import { Poppins, Mulish } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-mulish",
});

export const metadata: Metadata = {
  title: "Mijn Zorgkompas",
  description: "Uw persoonlijke gids door de Franse ouderenzorg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${poppins.variable} ${mulish.variable} antialiased bg-white`}>
        {children}
      </body>
    </html>
  );
}
