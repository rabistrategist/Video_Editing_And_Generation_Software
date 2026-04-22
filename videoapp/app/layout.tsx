import React from "react";
import "./globals.css";

export const metadata = {
  title: "SH Lumen",
  description: "Next.js video editor frontend mockup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
