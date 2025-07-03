// app/components/SessionProviderWrapper.tsx
'use client';

import { SessionProvider } from "next-auth/react";

export default function SessionProviderWrapper({ session, children }: any) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}