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
    <html lang="en" className="h-full overflow-hidden">
      <body className="h-full m-0 p-0 overflow-hidden" style={{ background: 'transparent' }} suppressHydrationWarning={true}>
        <AuthProvider>
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

