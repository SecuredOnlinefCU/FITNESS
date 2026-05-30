'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientMessagesRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/dashboard/messages'); }, [router]);
  return null;
}
