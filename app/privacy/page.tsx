import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "Privacy Policy | Invoice Generator",
	description: "Privacy Policy for Invoice Generator.",
};

export default function PrivacyPage() {
	return (
		<main className="min-h-screen px-6 py-10">
			<section className="mx-auto max-w-3xl rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(19,29,43,0.92),rgba(12,23,36,0.9))] p-8 text-white shadow-soft sm:p-10">
				<p className="text-sm uppercase tracking-[0.28em] text-white/60">
					Legal
				</p>
				<h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
					Privacy Policy
				</h1>
				<p className="mt-6 text-sm text-white/70">
					Last updated: July 10, 2026
				</p>

				<div className="mt-8 space-y-6 text-sm leading-7 text-white/86 sm:text-base">
					<section>
						<h2 className="font-display text-xl text-white">
							1. Information We Collect
						</h2>
						<p className="mt-2">
							We collect account information provided during sign in (such as
							name and email), plus the data you enter to create invoices and
							manage company or contractor records.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">
							2. How We Use Information
						</h2>
						<p className="mt-2">
							We use your information to authenticate your account, provide
							invoice-related features, secure the service, and improve
							reliability and performance.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">3. Data Sharing</h2>
						<p className="mt-2">
							We do not sell personal data. Data may be shared with
							infrastructure providers needed to operate the service and when
							required by law.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">
							4. Data Retention and Security
						</h2>
						<p className="mt-2">
							We retain data for as long as needed to provide the service and
							comply with legal obligations. We apply reasonable technical and
							organizational safeguards to protect your information.
						</p>
					</section>

					<section>
						<h2 className="font-display text-xl text-white">5. Your Rights</h2>
						<p className="mt-2">
							Depending on your jurisdiction, you may have rights to access,
							correct, or delete your personal information. Contact the service
							operator to request support for these rights.
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