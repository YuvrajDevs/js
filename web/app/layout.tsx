import "./globals.css"; import type { Metadata } from "next"; import Nav from "@/components/Nav";
export const metadata: Metadata = { title: "Jobseek hub", description: "Find, tailor and apply to AI-native builder roles." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet" />
  </head><body><div className="shell"><Nav /><main>{children}</main></div></body></html>);
}
