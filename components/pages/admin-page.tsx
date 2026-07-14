"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RotateCcw, Shield, UserRound } from "lucide-react";
import { useState } from "react";

import { SectionHeader } from "@/components/shared/section-header";
import { useDashboardData } from "@/components/shell/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

type AdminUser = {
	id: string;
	name: string;
	email: string;
	createdAt: string;
	updatedAt: string;
	hasCompanyProfile: boolean;
	contractorCount: number;
	invoiceCount: number;
};

async function fetchAdminUsers(): Promise<AdminUser[]> {
	const response = await fetch("/api/admin/users");

	if (!response.ok) {
		const error = await response.json().catch(() => null);
		throw new Error(error?.message || "Unable to load users.");
	}

	return response.json();
}

async function resetUserAccount(userId: string) {
	const response = await fetch(`/api/admin/users/${userId}/reset`, {
		method: "POST",
	});

	if (!response.ok) {
		const error = await response.json().catch(() => null);
		throw new Error(error?.message || "Unable to reset this account.");
	}

	return response.json();
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function AdminPageContent() {
	const queryClient = useQueryClient();
	const { refresh } = useDashboardData();
	const { data: session } = authClient.useSession();
	const [actionError, setActionError] = useState("");
	const usersQuery = useQuery({
		queryKey: ["admin", "users"],
		queryFn: fetchAdminUsers,
	});

	const resetMutation = useMutation({
		mutationFn: resetUserAccount,
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
				refresh(),
			]);
		},
	});
	const users = usersQuery.data ?? [];

	async function handleReset(user: AdminUser) {
		if (
			!window.confirm(
				`Reset ${user.email}? This clears company profile, contractors, invoices and stored files. The user will need onboarding again.`,
			)
		) {
			return;
		}

		setActionError("");

		try {
			await resetMutation.mutateAsync(user.id);
		} catch (error) {
			setActionError(
				error instanceof Error ? error.message : "Unable to reset this account.",
			);
		}
	}

	if (usersQuery.isLoading) {
		return (
			<Card className="animate-fade-in-up">
				<div className="flex items-center gap-2 text-sm text-foreground/70">
					<Loader2 className="h-4 w-4 animate-spin" />
					Loading users...
				</div>
			</Card>
		);
	}

	if (usersQuery.isError) {
		return (
			<Card className="animate-fade-in-up">
				<p className="text-sm text-rose-300" role="alert">
					{usersQuery.error instanceof Error
						? usersQuery.error.message
						: "Unable to load users."}
				</p>
			</Card>
		);
	}

	return (
		<section className="space-y-6">
			<Card className="animate-fade-in-up">
				<SectionHeader
					description="Visible only to the configured admin account."
					icon={Shield}
					title="Admin"
				/>
				<p className="mt-4 text-sm text-foreground/70">
					Resetting an account removes company profile, contractors, invoices, and
					stored logo/PDF files. The user will go through onboarding again.
				</p>
			</Card>

			<div className="grid gap-4">
				{users.length ? (
					users.map((user) => {
						const isResetting =
							resetMutation.isPending && resetMutation.variables === user.id;
						const isCurrentAdmin =
							session?.user?.id === user.id ||
							session?.user?.email?.trim().toLowerCase() ===
								user.email.trim().toLowerCase();

						return (
							<Card className="animate-fade-in-up" key={user.id}>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div>
										<p className="inline-flex items-center gap-2 text-lg font-semibold">
											<UserRound className="h-4 w-4" />
											{user.name}
											{isCurrentAdmin ? (
												<span className="inline-flex items-center rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-200">
													You
												</span>
											) : null}
										</p>
										<p className="text-sm text-foreground/72">{user.email}</p>
										<p className="mt-2 text-sm text-foreground/62">
											Created: {formatDate(user.createdAt)} · Last update: {formatDate(user.updatedAt)}
										</p>
										<p className="mt-2 text-sm text-foreground/62">
											Onboarding: {user.hasCompanyProfile ? "completed" : "pending"} · Contractors: {user.contractorCount} · Invoices: {user.invoiceCount}
										</p>
									</div>
									<Button
										disabled={isResetting}
										onClick={() => handleReset(user)}
										type="button"
										variant="outline"
									>
										{isResetting ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<RotateCcw className="h-4 w-4" />
										)}
										Reset account
									</Button>
								</div>
							</Card>
						);
					})
				) : (
					<Card className="animate-fade-in-up">
						<p className="text-sm text-foreground/68">No users found.</p>
					</Card>
				)}
			</div>

			{actionError ? (
				<p className="text-sm text-rose-300" role="alert">
					{actionError}
				</p>
			) : null}
		</section>
	);
}