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

          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-bone-fade">
              <li><a href="#features" className="hover:text-bone transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-bone transition-colors">Pricing</a></li>
              <li><Link href="/login" className="hover:text-bone transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-bone transition-colors">Get started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-bone-fade">
              <li><a href="#" className="hover:text-bone transition-colors">About</a></li>
              <li><a href="#" className="hover:text-bone transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-bone transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-bone transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-bone-fade">
              <li><a href="#" className="hover:text-bone transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-bone transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-bone transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8 text-center text-sm text-bone-fade">
          &copy; {new Date().getFullYear()} LevelFITness. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
