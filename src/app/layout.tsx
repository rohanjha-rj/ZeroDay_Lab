import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ZeroDay Lab — Advanced Cybersecurity Simulator",
  description: "A virtual cybersecurity lab for simulating real-world attacks in a safe, sandboxed environment.",
  keywords: ["cybersecurity", "ethical hacking", "XSS", "SQL injection", "CTF", "penetration testing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto grid-bg">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
