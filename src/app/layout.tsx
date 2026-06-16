import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const spaceGrotesk = localFont({
  src: "../../public/fonts/SpaceGrotesk-VariableFont_wght.ttf",
  variable: "--font-heading",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../../public/fonts/Inter-VariableFont_opsz,wght.ttf", style: "normal" },
    { path: "../../public/fonts/Inter-Italic-VariableFont_opsz,wght.ttf", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    { path: "../../public/fonts/JetBrainsMono-VariableFont_wght.ttf", style: "normal" },
    { path: "../../public/fonts/JetBrainsMono-Italic-VariableFont_wght.ttf", style: "italic" },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nubelab.es"),
  title: {
    default: "NubeLab | Operational Systems Platform",
    template: "%s | NubeLab",
  },
  description:
    "A public systems atlas for infrastructure, automation, industrial operations, AI workflows, and technical integration.",
  openGraph: {
    title: "NubeLab | Operational Systems Platform",
    description:
      "A public systems atlas for infrastructure, automation, industrial operations, AI workflows, and technical integration.",
    url: "https://nubelab.es",
    siteName: "NubeLab",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
