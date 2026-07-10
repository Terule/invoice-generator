import { createAuthClient } from "better-auth/react";

// No baseURL needed — in a Next.js app the client defaults to the current origin.
export const authClient = createAuthClient();
