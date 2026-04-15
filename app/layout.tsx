import type { Metadata, Viewport } from "next";
import "./globals.css";
import Shell from "@/components/Shell";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "TigerFix",
  description:
    "Gestión de reparaciones técnicas — from intake to delivery in 3 clicks.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f97316",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        {session ? (
          <Shell
            user={{
              name: session.name,
              email: session.email,
              role: session.role,
            }}
          >
            {children}
          </Shell>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
