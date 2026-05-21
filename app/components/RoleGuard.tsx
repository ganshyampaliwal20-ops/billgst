'use client';

import { useSession } from 'next-auth/react';

interface RoleGuardProps {
  allowedRoles: string[];
  deniedTitle?: string;
  deniedMessage?: string;
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, deniedTitle = 'Access Denied', deniedMessage, children }: RoleGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-slate-500">
        Loading...
      </div>
    );
  }

  const role = (session?.user?.role || 'USER').toString().toUpperCase();
  const isAllowed = !!session?.user && allowedRoles.includes(role);

  if (!isAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <h1 className="text-3xl font-black text-rose-600 mb-2">{deniedTitle}</h1>
        <p className="text-slate-500 max-w-xl">{deniedMessage || 'You do not have permission to view this page.'}</p>
      </div>
    );
  }

  return <>{children}</>;
}
