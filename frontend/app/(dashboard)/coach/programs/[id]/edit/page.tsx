'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { CoachPageHeader } from '@/components/coach/coach-page-header';
import { ProgramBuilderShell } from '@/components/coach/program-builder-shell';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProgramPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <ProtectedRoute roles={['coach', 'assistant_coach', 'super_admin']}>
      <DashboardShell>
        <div className="mb-4">
          <Link href={`/coach/programs/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> Back to program
          </Link>
        </div>
        <CoachPageHeader title="Edit program" subtitle="Update program name or description." />
        <ProgramBuilderShell editId={id} />
      </DashboardShell>
    </ProtectedRoute>
  );
}
