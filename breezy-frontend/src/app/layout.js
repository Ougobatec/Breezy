import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { GoogleOAuthProvider } from '@react-oauth/google';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Breezy",
    description: "Le réseau social léger et rapide",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <GoogleOAuthProvider clientId="127771112819-m2ub4fhe5u7q5n6ikp9e64d6f3u5nggt.apps.googleusercontent.com">
                <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    {children}
                        </AuthProvider>
                        </LanguageProvider>
                </ThemeProvider>
                </GoogleOAuthProvider>
            </body>
        </html>
    );
}
