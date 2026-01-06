import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./providers";

export const metadata: Metadata = {
  title: "User Authentication System",
  description: "Secure login and registration system",
  keywords: ["authentication", "login", "user management"],
  authors: [{ name: "Your App" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
