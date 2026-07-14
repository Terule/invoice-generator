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
import { createContext, useContext, useMemo, useState } from "react";
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
	const [logoRefreshNonce, setLogoRefreshNonce] = useState(0);
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
						refresh: async () => {
							const result = await queryClient.invalidateQueries({ queryKey: ["bootstrap"] });
							setLogoRefreshNonce((current) => current + 1);
							return result;
						},
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
	const companyDisplayName =
		companyProfile?.tradingName ||
		companyProfile?.legalName ||
		"International invoicing workspace";
	const companyInitials = companyDisplayName
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
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
			<div className="min-h-screen bg-background">
				<Card className="animate-fade-in-up sticky top-0 z-40 mb-4 rounded-none border-x-0 border-t-0 border-white/10 bg-[linear-gradient(135deg,rgba(19,29,43,0.95),rgba(18,47,39,0.92))] hover:border-white/10">
					<div className="grid w-full gap-3 px-4 py-2.5 sm:px-6 xl:grid-cols-[minmax(280px,1fr)_auto_minmax(280px,1fr)] xl:items-center">
						<div className="flex min-w-0 items-center gap-3">
							{companyProfile?.logoPath ? (
								<Image
									alt="Company logo"
									className="h-12 w-12 rounded-xl border border-white/10 bg-white object-contain p-1"
									height={48}
									src={`/api/company-profile/logo?v=${encodeURIComponent(companyProfile.logoPath)}-${logoRefreshNonce}`}
									unoptimized
									width={48}
								/>
							) : (
								<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-foreground/78">
									{companyInitials || "IM"}
								</div>
							)}
							<div className="min-w-0">
								<p className="truncate font-display text-xl font-semibold leading-tight text-white">
									Invoice Manager
								</p>
								<p className="truncate text-sm leading-tight text-foreground/70">{companyDisplayName}</p>
							</div>
						</div>

						<nav className="flex flex-wrap items-center justify-center gap-3 xl:justify-self-center">
									{navItems.map((item) => {
										const Icon = item.icon;
										const active = pathname === item.href;

										return (
											<Link
												key={item.href}
												className={cn(
													"inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-1.5 text-sm text-foreground/72 transition hover:border-white/10 hover:bg-white/5 hover:text-foreground",
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

						<details className="relative ml-auto xl:ml-0 xl:justify-self-end">
							<summary className="flex cursor-pointer list-none items-center rounded-full border border-white/10 bg-slate-950/35 p-1 transition hover:border-white/25 [&::-webkit-details-marker]:hidden">
								{userImage ? (
									<Image
										alt={userName}
										className="h-10 w-10 rounded-full border border-white/10 object-cover"
										height={40}
										referrerPolicy="no-referrer"
										src={userImage}
										unoptimized
										width={40}
									/>
								) : (
									<div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-foreground/88">
										{userInitials || "IG"}
									</div>
								)}
							</summary>

							<div className="absolute right-0 top-[calc(100%+0.7rem)] z-50 w-72 rounded-2xl border border-white/10 bg-slate-950/95 p-4 shadow-soft backdrop-blur">
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<p className="truncate text-sm font-semibold text-foreground">{userName}</p>
										{isAdminUser ? (
											<span className="inline-flex shrink-0 items-center rounded-full border border-emerald-300/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-200">
												Admin
											</span>
										) : null}
									</div>
									{userEmail ? <p className="truncate text-xs text-foreground/62">{userEmail}</p> : null}
								</div>
								<div className="mt-4 border-t border-white/10 pt-3">
									<Button
										aria-label="Logout"
										className="w-full items-center gap-2 justify-start rounded-xl px-3 py-2 text-sm"
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
										<span>Logout</span>
									</Button>
								</div>
							</div>
						</details>
					</div>
				</Card>

				<div className="mx-auto max-w-384 px-4 pb-4 sm:px-6">
					<div className="min-w-0">{children}</div>
				</div>
			</div>
		</DashboardContext.Provider>
	);
}
