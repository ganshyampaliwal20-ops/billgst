import { redirect } from 'next/navigation';

export default function HomePage() {
  // Force redeploy to catch new env vars
  redirect('/dashboard');
}
