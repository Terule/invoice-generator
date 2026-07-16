"use client";

import {
	BadgePoundSterling,
	Building2,
	CheckCircle2,
	FileCheck2,
	FileText,
	Globe,
	Lock,
	Palette,
	ReceiptText,
	ShieldCheck,
	Sparkles,
	Timer,
	Users,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";

import { GoogleLogo } from "@/components/auth/google-logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function LoginScreen() {
	function signInWithGoogle() {
		authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
		});
	}

	return (
		<main className="min-h-screen bg-background px-6 pb-12 pt-6">
			<div className="mx-auto max-w-6xl">
				<header className="animate-fade-in-up rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(19,29,43,0.9),rgba(16,31,49,0.85))] px-5 py-4 shadow-soft sm:px-7">
					<div className="flex flex-wrap items-center gap-4">
						<div className="flex min-w-0 items-center gap-3">
							<div className="rounded-xl border border-white/15 bg-white/6 p-2.5">
								<FileText className="h-5 w-5 text-accent" />
							</div>
							<div>
								<p className="font-display text-xl font-semibold text-white">Invoice Manager</p>
								<p className="text-xs uppercase tracking-[0.2em] text-white/55">International invoicing workspace</p>
							</div>
						</div>
						<nav className="ml-auto hidden items-center gap-6 text-sm text-white/72 md:flex">
							<a className="transition hover:text-white" href="#features">Features</a>
							<a className="transition hover:text-white" href="#workflow">Workflow</a>
							<a className="transition hover:text-white" href="#security">Security</a>
							<Link className="transition hover:text-white" href="/tos">Terms</Link>
							<Link className="transition hover:text-white" href="/privacy">Privacy</Link>
						</nav>
						<Button className="ml-auto gap-2 md:ml-0" onClick={signInWithGoogle}>
							<GoogleLogo />
							Login
						</Button>
					</div>
				</header>

				<section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="animate-fade-in-up rounded-[34px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.25),transparent_35%),linear-gradient(150deg,#101722,#122133_55%,#15392c)] p-8 text-white shadow-soft sm:p-11">
						<p className="text-sm font-medium uppercase tracking-[0.32em] text-white/56">Professional invoicing for global freelancers</p>
						<h1 className="mt-6 font-display text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
							Create polished invoices,
							<br />
							<span className="text-accent">keep every record immutable.</span>
						</h1>
						<p className="mt-7 max-w-xl text-base leading-7 text-white/72">
							Set up your company once, issue invoice PDFs in seconds, and maintain a reliable audit trail that protects your business and client trust.
						</p>
						<div className="mt-10 flex flex-wrap items-center gap-3">
							<Button
								className="animate-pulse-glow gap-3 bg-white px-5 py-3 font-display text-base font-semibold text-slate-950 hover:bg-white/92"
								onClick={signInWithGoogle}
							>
								<GoogleLogo />
								Login with Google
							</Button>
							<div className="flex items-center gap-2 text-sm text-white/58">
								<Lock className="h-4 w-4" />
								No password required
							</div>
						</div>
					</div>

					<Card className="animate-fade-in-up stagger-1 space-y-5 self-start">
						<div className="flex items-center justify-between">
							<h2 className="font-display text-xl font-semibold text-foreground">At a glance</h2>
							<Sparkles className="h-5 w-5 text-accent" />
						</div>
						<div className="grid grid-cols-2 gap-3 text-sm">
							<div className="rounded-2xl border border-white/8 bg-secondary/45 p-3">
								<p className="text-foreground/58">Time to issue</p>
								<p className="mt-1 text-lg font-semibold text-foreground">&lt; 2 min</p>
							</div>
							<div className="rounded-2xl border border-white/8 bg-secondary/45 p-3">
								<p className="text-foreground/58">Edit after issue</p>
								<p className="mt-1 text-lg font-semibold text-foreground">Locked</p>
							</div>
							<div className="rounded-2xl border border-white/8 bg-secondary/45 p-3">
								<p className="text-foreground/58">CNPJ / CEP</p>
								<p className="mt-1 text-lg font-semibold text-foreground">Auto-fill</p>
							</div>
							<div className="rounded-2xl border border-white/8 bg-secondary/45 p-3">
								<p className="text-foreground/58">Export format</p>
								<p className="mt-1 text-lg font-semibold text-foreground">PDF</p>
							</div>
						</div>
						<div className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 p-4 text-sm text-foreground/82">
							<div className="flex items-center gap-2 text-emerald-200">
								<CheckCircle2 className="h-4 w-4" />
								Audit-ready by design
							</div>
							<p className="mt-2 leading-6 text-foreground/78">
								Issued invoices remain immutable snapshots, even when company and contractor details are updated later.
							</p>
						</div>
					</Card>
				</section>

				<section className="mt-8" id="features">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						<FeatureCard icon={FileCheck2} title="Immutable invoices" description="Once issued, records are locked to preserve your financial history." />
						<FeatureCard icon={Building2} title="Company profile" description="Store legal data, payment details, logo, and invoice color once." />
						<FeatureCard icon={Users} title="Contractor management" description="Maintain client registry with defaults for faster invoice creation." />
						<FeatureCard icon={BadgePoundSterling} title="Cent-based totals" description="Avoid floating-point currency errors with cents-first calculations." />
						<FeatureCard icon={Globe} title="Brazilian utilities" description="CNPJ and CEP lookup help you populate data accurately." />
						<FeatureCard icon={Palette} title="Branded output" description="Generate professional PDFs with your visual identity." />
					</div>
				</section>

				<section className="mt-8 grid gap-4 lg:grid-cols-2" id="workflow">
					<Card>
						<h3 className="font-display text-xl font-semibold text-foreground">Simple workflow</h3>
						<ol className="mt-4 space-y-3 text-sm text-foreground/78">
							<li className="flex items-start gap-3"><ReceiptText className="mt-0.5 h-4 w-4 text-accent" /><span>Complete company setup and payment details once.</span></li>
							<li className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 text-accent" /><span>Add contractors and choose your billing currency.</span></li>
							<li className="flex items-start gap-3"><Timer className="mt-0.5 h-4 w-4 text-accent" /><span>Generate invoice PDF with live preview and issue in seconds.</span></li>
						</ol>
					</Card>
					<Card id="security">
						<h3 className="font-display text-xl font-semibold text-foreground">Security and trust</h3>
						<ul className="mt-4 space-y-3 text-sm text-foreground/78">
							<li className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" /><span>Google-based sign-in with no password storage in your app.</span></li>
							<li className="flex items-start gap-3"><Lock className="mt-0.5 h-4 w-4 text-primary" /><span>Immutable invoice snapshots preserve issued records integrity.</span></li>
							<li className="flex items-start gap-3"><FileText className="mt-0.5 h-4 w-4 text-primary" /><span>PDF exports with consistent values from persisted invoice data.</span></li>
						</ul>
					</Card>
				</section>

				<footer className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-card/70 px-5 py-4 text-sm text-foreground/62">
					<p>Invoice Manager</p>
					<div className="flex items-center gap-4">
						<Link className="transition hover:text-foreground" href="/tos">Terms of Service</Link>
						<Link className="transition hover:text-foreground" href="/privacy">Privacy Policy</Link>
					</div>
				</footer>
			</div>
		</main>
	);
}

function FeatureCard({
	icon: Icon,
	title,
	description,
}: {
	icon: ComponentType<{ className?: string }>;
	title: string;
	description: string;
}) {
	return (
		<Card className="animate-fade-in-up">
			<div className="flex items-start gap-3">
				<div className="rounded-xl bg-secondary p-2.5">
					<Icon className="h-4 w-4 text-accent" />
				</div>
				<div>
					<h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
					<p className="mt-2 text-sm leading-6 text-foreground/72">{description}</p>
				</div>
			</div>
		</Card>
	);
}
