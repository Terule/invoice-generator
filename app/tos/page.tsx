import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Terms of Service | Invoice Generator",
	description: "Terms of Service for Invoice Generator.",
};

export default function TermsOfServicePage() {
	return (
		<main className="min-h-screen px-6 py-10">
			<section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(19,29,43,0.92),rgba(12,23,36,0.9))] p-8 text-white shadow-soft sm:p-10">
				<p className="text-sm uppercase tracking-[0.28em] text-white/60">
					Legal
				</p>
				<h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
					Terms of Service
				</h1>
				<p className="mt-6 text-sm text-white/70">
					Last updated: July 10, 2026
				</p>

				<div className="mt-8 space-y-6 text-sm leading-7 text-white/86 sm:text-base">
					<section>
						<h2 className="font-display text-xl text-white">
							1. Acceptance of Terms
						</h2>
						<p className="mt-2">
							By accessing or using Invoice Generator, you agree to these Terms
							of Service. If you do not agree, do not use the service.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">
							2. Service Description
						</h2>
						<p className="mt-2">
							Invoice Generator helps users create, manage, and export invoices
							for business use. You are responsible for ensuring your invoices
							and business practices comply with applicable laws.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">
							3. User Responsibilities
						</h2>
						<p className="mt-2">
							You must provide accurate account information, maintain account
							security, and avoid unlawful or abusive use of the service.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">
							4. Limitation of Liability
						</h2>
						<p className="mt-2">
							The service is provided "as is" without warranties. To the maximum
							extent permitted by law, Invoice Generator is not liable for
							indirect, incidental, or consequential damages.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">
							5. Changes to Terms
						</h2>
						<p className="mt-2">
							We may update these terms from time to time. Continued use of the
							service after updates means you accept the revised terms.
						</p>
					</section>
				</div>

				<div className="mt-10 border-t border-white/10 pt-6">
					<Link
						className="text-sm text-white/72 transition hover:text-white"
						href="/"
					>
						Back to sign in
					</Link>
				</div>
			</section>
		</main>
	);
}
