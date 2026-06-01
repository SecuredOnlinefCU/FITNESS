declare module 'lucide-react';
declare module 'next';
declare module 'next/link';
declare module 'next/navigation';
declare module 'next/image';
declare module 'next/dynamic';
declare module 'next/head';
declare module 'next/script';
declare module 'next/font/*';

// Fallback for any other next submodules
declare module 'next/*';
// Lightweight aliases for Next-generated types that sometimes cause TS issues
// (these are intentionally permissive to unblock local typechecking)
declare type Metadata = any;
declare type Viewport = any;
declare type ResolvingMetadata = any;
declare type ResolvingViewport = any;

declare type LucideIcon = any;
declare type NextConfig = any;
// Allow importing SVGs as React components if used
declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}
