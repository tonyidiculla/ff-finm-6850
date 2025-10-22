import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "FURFIELD Finance - Multi-Tenant Accounting",
  description: "Secure financial management powered by Furfield",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-transparent" suppressHydrationWarning={true}>
        <AuthProvider>
          <main className="p-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

