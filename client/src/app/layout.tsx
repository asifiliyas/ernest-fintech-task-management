import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google"; // High-end SaaS font
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Taskcore. | Professional Task Management",
  description: "Secure, high-performance task management ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.className} bg-background text-foreground antialiased selection:bg-primary/20`}>
        <AuthProvider>
          {children}
          <Toaster
            richColors
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                fontWeight: '700'
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
