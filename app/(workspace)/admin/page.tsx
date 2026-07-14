import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminPageContent } from "@/components/pages/admin-page";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminPage() {
	const session = await auth.api.getSession({ headers: await headers() });

	if (!session?.user?.id || !isAdminEmail(session.user.email)) {
		redirect("/");
	}

	return <AdminPageContent />;
}