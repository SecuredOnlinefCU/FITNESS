import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LevelFitLogo } from '@/components/levelfitness/logo';

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <LevelFitLogo size={32} />
        </div>
        <Link href="/signup" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to sign up
        </Link>
        <h1 className="mb-6 mt-4 text-3xl font-black tracking-tight text-foreground">Terms of Service</h1>
        <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
          <p>Last updated: May 30, 2026</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing or using LevelFit, you agree to be bound by these Terms of Service. If you do not agree, do not use the platform.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">2. Description of Service</h2>
          <p>LevelFit provides a coaching platform that connects fitness coaches with clients. Coaches can create workout programs, nutrition plans, and track client progress. Clients can access assigned content and communicate with their coach.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">3. User Responsibilities</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to provide accurate information and keep it updated.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">4. Payments and Billing</h2>
          <p>Subscription fees are billed in advance on a monthly or annual basis. Refunds are handled in accordance with our refund policy. Coaches are responsible for setting their own pricing.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">5. Limitation of Liability</h2>
          <p>LevelFit is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Fitness advice and coaching content are provided by third-party coaches, not by LevelFit.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">6. Contact</h2>
          <p>For questions about these terms, contact support@levelfitcoach.com.</p>
        </div>
      </div>
    </div>
  );
}
