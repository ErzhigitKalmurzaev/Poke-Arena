import { LandingShowcase } from '@/widgets/landing-showcase';

// This route reads no cookies()/headers() and does no fetch({ cache: 'no-store' }) -
// nothing here is per-request, so Next renders it once at build time (SSG) and
// serves it from the CDN for every visitor. The interactivity below (draft, duel,
// tune demos) is client-side only local state - it never touches the real
// IndexedDB/auth layer that the logged-in app uses.
export default function LandingPage() {
  return <LandingShowcase />;
}
