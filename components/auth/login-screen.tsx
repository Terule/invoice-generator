"use client";

import {
	BadgePoundSterling,
	Building2,
	FileCheck2,
	FileText,
	Globe,
	Home,
	Lock,
	Palette,
	Users,
} from "lucide-react";
import Link from "next/link";

import { GoogleLogo } from "@/components/auth/google-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function LoginScreen() {
	return (
		<main className="min-h-screen bg-background px-6 py-10">
			<section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="animate-fade-in-up rounded-[36px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),linear-gradient(140deg,#101722,#122133_52%,#15392c)] p-8 text-white shadow-soft sm:p-12">
					<div className="animate-fade-in-up mb-5 flex items-center gap-4">
						<div className="animate-gentle-float shrink-0 rounded-2xl border border-white/15 bg-white/6 p-3 shadow-[0_0_32px_rgba(56,189,248,0.18)] backdrop-blur-sm">
							<FileText className="h-7 w-7 text-accent" />
						</div>
						<h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
							Invoice Manager
						</h1>
					</div>

					{/* Tagline — secondary, smaller */}
					<p className="animate-fade-in-up stagger-1 mb-8 text-sm font-medium uppercase tracking-[0.32em] text-white/55">
						Secure invoicing workspace
					</p>

					{/* Hero headline */}
					<p className="animate-fade-in-up stagger-2 max-w-xl font-display text-4xl font-semibold leading-[1.06] text-white sm:text-5xl lg:text-6xl">
						Your invoices,
						<br />
						<span className="text-accent">always on record.</span>
					</p>

					{/* Description */}
					<p className="animate-fade-in-up stagger-3 mt-7 max-w-md text-base leading-7 text-white/72">
						Set up your company once, add your international clients, and issue
						professional invoices that can never be edited after sending — built
						for freelancers who need a clean audit trail.
					</p>

					{/* CTA */}
					<div className="animate-fade-in-up stagger-4 mt-10 flex flex-wrap gap-3">
						<Button
							className="animate-pulse-glow gap-3 bg-white px-5 py-3 font-display text-base font-semibold text-slate-950 hover:bg-white/92"
							onClick={() =>
								authClient.signIn.social({
									provider: "google",
									callbackURL: "/",
								})
							}
						>
							<GoogleLogo />
							Continue with Google
						</Button>
					</div>

					{/* Legal */}
					<div className="animate-fade-in-up stagger-5 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/50">
						<Link className="transition hover:text-white" href="/tos">
							Terms of Service
						</Link>
						<span aria-hidden="true" className="text-white/25">
							•
						</span>
						<Link
							className="transition hover:text-white"
							href="/privacy"
						>
							Privacy Policy
						</Link>
					</div>
				</div>

				{/* Right feature card */}
				<Card className="animate-fade-in-up stagger-2 space-y-5 self-start">
					<div className="flex items-center gap-3">
						<div className="animate-gentle-float shrink-0 rounded-2xl bg-secondary p-3">
							<FileText className="h-6 w-6 text-accent" />
						</div>
						<div>
							<h2 className="font-display text-xl font-semibold text-foreground">
								Everything you need
							</h2>
							<p className="text-sm text-foreground/62">
								A focused tool for international freelance invoicing.
							</p>
						</div>
					</div>
					<ul className="space-y-3.5 text-sm text-foreground/82">
						<li className="flex items-start gap-3">
							<Home className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>Live invoice builder with real-time PDF preview.</span>
						</li>
						<li className="flex items-start gap-3">
							<FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>
								Immutable issued invoices — locked after sending for a clean
								audit trail.
							</span>
						</li>
						<li className="flex items-start gap-3">
							<Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>Company setup with validated CNPJ lookup and payment details.</span>
						</li>
						<li className="flex items-start gap-3">
							<Palette className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>Personalized invoices with your logo and brand color.</span>
						</li>
						<li className="flex items-start gap-3">
							<Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>
								Contractor registry with per-client currency and rate defaults.
							</span>
						</li>
						<li className="flex items-start gap-3">
							<BadgePoundSterling className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>
								GBP-first billing — totals stored in cents, no floating point
								errors.
							</span>
						</li>
						<li className="flex items-start gap-3">
							<Globe className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>CEP and CNPJ auto-fill for Brazilian companies.</span>
						</li>
						<li className="flex items-start gap-3">
							<Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<span>Sign in with Google — no passwords to manage.</span>
						</li>
					</ul>
				</Card>
			</section>
		</main>
	);
}
