export const ADMIN_EMAIL = "terule@gmail.com";

export function isAdminEmail(email?: string | null) {
	return email?.trim().toLowerCase() === ADMIN_EMAIL;
}