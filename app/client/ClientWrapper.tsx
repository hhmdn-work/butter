// app/client/ClientWrapper.tsx
'use client';

import React, { ReactNode, type JSX } from 'react';
import { SessionProvider } from 'next-auth/react';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';

interface ClientWrapperProps {
  children: ReactNode;
}

/**
 * ClientWrapper provides session context and shared layout components
 * like the topbar and sidebar for the application.
 */
export default function ClientWrapper({ children }: ClientWrapperProps): JSX.Element {
  return (
    <SessionProvider>
      <Topbar />
      <Sidebar />
      {children}
    </SessionProvider>
  );
}
