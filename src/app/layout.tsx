import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
