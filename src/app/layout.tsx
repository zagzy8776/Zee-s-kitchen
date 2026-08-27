import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";

export const metadata: Metadata = {
  title: "Zee's Comfort Kitchen",
  description: "Comfort food made with love. Order from Zee's Kitchen.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
