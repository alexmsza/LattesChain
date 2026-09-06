import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LattesChain — Passaporte Acadêmico Global na Solana",
  description:
    "Certificação soberana de documentos educacionais, diplomas e horas complementares na Solana com SAS e inteligência artificial.",
  keywords: ["Solana", "Educação", "Blockchain", "LattesChain", "SAS", "Token-2022", "Diplomas", "Horas Complementares"],
  authors: [{ name: "LattesChain Team" }],
  openGraph: {
    title: "LattesChain — Passaporte Acadêmico Descentralizado",
    description: "Certificação educacional soberana e instantânea com Solana e SAS.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${archivo.variable} dark`}>
      <body className="flex min-h-screen flex-col bg-[#080c14] text-slate-100 antialiased selection:bg-solana-green/30 selection:text-solana-green">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
