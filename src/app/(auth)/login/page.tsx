import { redirect } from 'next/navigation';

// Redirect /login to root (where actual login is)
export default function LoginPage() {
  redirect('/');
}
