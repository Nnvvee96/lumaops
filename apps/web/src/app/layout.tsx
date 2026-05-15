import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LumaOps — cockpit",
  description:
    "LumaOps operations cockpit. Self-hosted, open-source. Connect your repo, website, payments, funnel and app telemetry — see every product alive.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
