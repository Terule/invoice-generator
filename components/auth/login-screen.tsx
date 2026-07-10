"use client";

import {
	BadgePoundSterling,
	Building2,
	FileText,
	Home,
	Sparkles,
	Users,
} from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { GoogleLogo } from "@/components/auth/google-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LoginScreen() {
	return (
		<main className="min-h-screen bg-background px-6 py-10">
			<section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="animate-fade-in-up rounded-[36px] border border-white/12 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.22),_transparent_34%),linear-gradient(140deg,#101722,#122133_52%,#15392c)] p-8 text-white shadow-soft sm:p-12">
					<div className="mb-6 flex items-center gap-3">
						<div className="animate-gentle-float rounded-2xl border border-white/10 bg-white/5 p-3">
							<Sparkles className="h-5 w-5 text-accent" />
						</div>
						<p className="font-display text-sm uppercase tracking-[0.38em] text-white/70">
							Secure invoicing workspace
						</p>
					</div>
					<div className="animate-fade-in-up stagger-1 mb-7 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3 shadow-[0_0_45px_rgba(56,189,248,0.2)] backdrop-blur-sm">
						<div className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
						<p className="font-display text-xl font-semibold tracking-[0.14em] text-white sm:text-2xl">
							Invoice Manager
						</p>
					</div>
					<h1 className="animate-fade-in-up stagger-2 max-w-4xl font-display text-4xl font-semibold leading-[0.98] text-white sm:text-6xl lg:text-7xl">
						Build and send clean contractor invoices from one place.
					</h1>
					<p className="animate-fade-in-up stagger-3 mt-8 max-w-3xl text-lg leading-8 text-white/86">
						Sign in with Google, configure your Brazilian company once, and
						draft GBP invoices with live previews and immutable issued records.
					</p>
					<div className="animate-fade-in-up stagger-4 mt-10 flex flex-wrap gap-3">
						<Button
							className="animate-pulse-glow gap-3 bg-white px-5 py-3 font-display text-base font-semibold text-slate-950 hover:bg-white/92"
							onClick={() => signIn("google")}
						>
							<GoogleLogo />
							Continue with Google
						</Button>
					</div>
					<div className="animate-fade-in-up stagger-5 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
						<Link className="transition hover:text-white" href="/tos">
							Terms of Service
						</Link>
						<span aria-hidden="true" className="text-white/35">
							•
						</span>
						<Link
							className="transition hover:text-white"
							href="/privacy-policy"
						>
							Privacy Policy
						</Link>
					</div>
				</div>

				<Card className="animate-fade-in-up stagger-2 space-y-5 self-start">
					<div className="flex items-center gap-3">
						<div className="animate-gentle-float rounded-2xl bg-secondary p-3">
							<FileText className="h-6 w-6 text-accent" />
						</div>
						<div>
							<h2 className="font-display text-xl font-semibold text-foreground">
								What is inside
							</h2>
							<p className="text-sm text-foreground/78">
								A proper app shell with pages instead of a single dashboard
								wall.
							</p>
						</div>
					</div>
					<ul className="space-y-3 text-sm text-foreground/82">
						<li className="flex items-center gap-3">
							<Home className="h-4 w-4 text-primary" />
							Home invoice builder with live preview.
						</li>
						<li className="flex items-center gap-3">
							<Building2 className="h-4 w-4 text-primary" />
							Dedicated company setup and summary.
						</li>
						<li className="flex items-center gap-3">
							<Users className="h-4 w-4 text-primary" />
							Contractor registry and future invoice defaults.
						</li>
						<li className="flex items-center gap-3">
							<BadgePoundSterling className="h-4 w-4 text-primary" />
							GBP-first invoice values and issued records.
						</li>
					</ul>
				</Card>
			</section>
		</main>
	);
}
