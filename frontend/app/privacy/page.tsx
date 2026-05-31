import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LevelFitLogo } from '@/components/levelfitness/logo';

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <LevelFitLogo size={32} />
        </div>
        <Link href="/signup" className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Back to sign up
        </Link>
        <h1 className="mb-6 mt-4 text-3xl font-black tracking-tight text-foreground">Privacy Policy</h1>
        <div className="prose prose-sm prose-invert max-w-none text-muted-foreground">
          <p>Last updated: May 30, 2026</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, including your name, email address, and profile information. Coaches may upload additional client data as part of their coaching services.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve the LevelFit platform, process payments, send notifications, and enable coach-client communication.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">3. Data Sharing</h2>
          <p>We do not sell your personal data. Client data shared with coaches is limited to what is necessary for coaching services. We use third-party services (Stripe, Vercel, Railway) that may process data in accordance with their own privacy policies.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">4. Data Security</h2>
          <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest. However, no method of transmission is 100% secure.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">5. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting support@levelfitcoach.com.</p>
          <h2 className="mt-8 text-lg font-bold text-foreground">6. Contact</h2>
          <p>For privacy-related inquiries, contact support@levelfitcoach.com.</p>
        </div>
      </div>
    </div>
  );
}
