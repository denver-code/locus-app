import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Locus - App",
    description: "An application for task management",
    keywords: ["kanban", "task management", "project management", "agile"],
    icons: {
        icon: "/favicon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <Script async src="https://umami.ihorsavenko.com/script.js" data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}></Script>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
            </body>
        </html>
    );
}
