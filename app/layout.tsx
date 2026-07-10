import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/providers/app-providers";

import "./globals.css";

// Tailwind v4 owns --font-sans and --font-display (defined in globals.css @theme).
// Use distinct variable names here to avoid circular CSS variable references.
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const roboto = Roboto({
	subsets: ["latin"],
	variable: "--font-roboto",
	weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
	title: "Invoce Manager",
	description: "Manage invoices for international freelance clients.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} ${roboto.variable} font-sans`}>
				<AppProviders>{children}</AppProviders>
			</body>
		</html>
	);
}
