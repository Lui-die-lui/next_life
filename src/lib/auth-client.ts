"use client";

import { createAuthClient } from "better-auth/react";

// No baseURL needed: the client always talks to same-origin /api/auth.
export const authClient = createAuthClient();

export const { useSession, signIn, signOut } = authClient;
