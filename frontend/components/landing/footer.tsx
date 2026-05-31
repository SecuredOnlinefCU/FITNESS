import Link from 'next/link';
import { LevelFitLogo } from '@/components/levelfitness/logo';

export default function Footer() {
  return (
    <footer className="border-t border-line py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <LevelFitLogo size={28} />
            <p className="text-sm text-bone-fade mt-4">The platform to coach, scale, and win.</p>
          </div>

          <nav aria-label="Product links">
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-bone-fade">
              <li><a href="#features" className="hover:text-bone transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-bone transition-colors">Pricing</a></li>
              <li><Link href="/login" className="hover:text-bone transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-bone transition-colors">Get started</Link></li>
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-bone-fade">
              <li><span className="text-bone-fade">About</span></li>
              <li><span className="text-bone-fade">Blog</span></li>
              <li><span className="text-bone-fade">Careers</span></li>
              <li><span className="text-bone-fade">Contact</span></li>
            </ul>
          </nav>

          <nav aria-label="Legal links">
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-bone-fade">
              <li><span className="text-bone-fade">Privacy</span></li>
              <li><span className="text-bone-fade">Terms</span></li>
              <li><span className="text-bone-fade">Cookies</span></li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-center text-sm text-bone-fade">
          &copy; {new Date().getFullYear()} LevelFITness. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
