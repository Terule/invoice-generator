"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Building2,
	FileText,
	Home,
	Loader2,
	LogOut,
	Shield,
	Users,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { LoginScreen } from "@/components/auth/login-screen";
import { CompanyOnboardingModal } from "@/components/onboarding/company-onboarding-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isAdminEmail } from "@/lib/admin";
import { authClient } from "@/lib/auth-client";
import { type BootstrapPayload, fetchBootstrap } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

type DashboardContextValue = {
	bootstrap: BootstrapPayload;
	refresh: () => Promise<unknown>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboardData() {
	const context = useContext(DashboardContext);

	if (!context) {
		throw new Error("useDashboardData must be used inside DashboardShell.");
	}

	return context;
}

const baseNavItems = [
	{ href: "/", label: "Home", icon: Home },
	{ href: "/company", label: "My Company", icon: Building2 },
	{ href: "/contractors", label: "Contractors", icon: Users },
	{ href: "/invoices", label: "Invoices", icon: FileText },
] as const;

const adminNavItem = { href: "/admin", label: "Admin", icon: Shield } as const;

export function DashboardShell({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const { data: session, isPending: isSessionLoading } =
		authClient.useSession();
	const bootstrapQuery = useQuery({
		queryKey: ["bootstrap"],
		queryFn: fetchBootstrap,
		enabled: !!session?.user,
	});

	const contextValue = useMemo(
		() =>
			bootstrapQuery.data
				? {
						bootstrap: bootstrapQuery.data,
						refresh: () =>
							queryClient.invalidateQueries({ queryKey: ["bootstrap"] }),
					}
				: null,
		[bootstrapQuery.data, queryClient],
	);

	const isBootstrapLoading = Boolean(session?.user) && bootstrapQuery.isLoading;

	if (isSessionLoading || isBootstrapLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-primary" />
			</div>
		);
	}

	if (!session?.user) {
		return <LoginScreen />;
	}

	if (!bootstrapQuery.data || !contextValue) {
		return null;
	}

	const companyProfile = bootstrapQuery.data.companyProfile;
	const userName = session.user.name ?? "Workspace user";
	const userEmail = session.user.email ?? "";
	const userImage = session.user.image;
	const isAdminUser = isAdminEmail(userEmail);
	const navItems = isAdminEmail(userEmail)
		? [...baseNavItems, adminNavItem]
		: baseNavItems;
	const userInitials = userName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");

	return (
		<DashboardContext.Provider value={contextValue}>
			{!companyProfile ? (
				<CompanyOnboardingModal onComplete={contextValue.refresh} />
			) : null}
			<div className="min-h-screen bg-background px-4 py-4 sm:px-6">
				<div className="mx-auto max-w-7xl">
					<Card className="animate-fade-in-up mb-6 border-white/10 bg-[linear-gradient(135deg,rgba(19,29,43,0.95),rgba(18,47,39,0.92))]">
						<div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
							<div className="flex flex-col gap-4 xl:flex-1 xl:flex-row xl:items-center xl:justify-between">
								<div className="min-w-0">
									<div className="flex items-center gap-3">
										{companyProfile?.logoPath ? (
											<Image
												alt="Company logo"
												className="h-10 w-10 rounded-xl border border-white/10 bg-white object-contain p-1"
												height={40}
												src="/api/company-profile/logo"
												unoptimized
												width={40}
											/>
										) : null}
										<p className="font-display text-2xl font-semibold text-white">
											Invoice Manager
										</p>
									</div>
									<p className="mt-1 truncate text-sm text-foreground/62">
										{companyProfile?.tradingName ||
											companyProfile?.legalName ||
											"International invoicing workspace"}
									</p>
								</div>

								<nav className="flex flex-wrap gap-2">
									{navItems.map((item) => {
										const Icon = item.icon;
										const active = pathname === item.href;

										return (
											<Link
												key={item.href}
												className={cn(
													"inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm text-foreground/72 transition hover:border-white/10 hover:bg-white/5 hover:text-foreground",
													active && "border-white/10 bg-white/10 text-white",
												)}
															href={item.href as Route}
											>
												<Icon className="h-4 w-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}
								</nav>
							</div>

							<div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-slate-950/30 px-4 py-3 sm:px-5">
								<div className="flex min-w-0 items-center gap-3">
									{userImage ? (
										<Image
											alt={userName}
											className="h-11 w-11 rounded-full border border-white/10 object-cover"
											referrerPolicy="no-referrer"
											src={userImage}
											unoptimized
											width={44}
											height={44}
										/>
									) : (
										<div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-foreground/88">
											{userInitials || "IG"}
										</div>
									)}
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<p className="truncate text-sm font-semibold text-foreground">
												{userName}
											</p>
											{isAdminUser ? (
												<span className="inline-flex shrink-0 items-center rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-200">
													Admin
												</span>
											) : null}
										</div>
										{userEmail ? (
											<p className="truncate text-xs text-foreground/62">
												{userEmail}
											</p>
										) : null}
									</div>
								</div>
								<Button
									aria-label="Logout"
									className="shrink-0"
									onClick={() =>
										authClient.signOut({
											fetchOptions: {
												onSuccess: () => {
													window.location.href = "/";
												},
											},
										})
									}
									variant="ghost"
								>
									<LogOut className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</Card>

					<div className="min-w-0">{children}</div>
				</div>
			</div>
		</DashboardContext.Provider>
	);
}
