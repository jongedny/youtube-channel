import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TechChannel - Learn Web Development & Technology",
  description: "Join over 500K subscribers learning web development, design, and technology through high-quality tutorials and courses. Master React, Next.js, TypeScript, and more.",
  keywords: ["web development", "programming", "tutorials", "react", "nextjs", "typescript", "coding", "youtube channel"],
  authors: [{ name: "TechChannel" }],
  openGraph: {
    title: "TechChannel - Learn Web Development & Technology",
    description: "Join over 500K subscribers learning web development through high-quality tutorials",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TechChannel - Learn Web Development & Technology",
    description: "Join over 500K subscribers learning web development through high-quality tutorials",
  },
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
        {children}
      </body>
    </html>
  );
}
