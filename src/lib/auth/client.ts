"use client";

import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  phoneNumberClient,
  twoFactorClient,
  adminClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    phoneNumberClient(),
    twoFactorClient(),
    adminClient(),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
