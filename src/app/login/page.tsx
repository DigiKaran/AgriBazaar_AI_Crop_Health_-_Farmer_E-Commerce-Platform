
import LoginForm from './components/LoginForm';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Login - AgriCheck',
  description: 'Login to your AgriCheck account.',
};

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-headline tracking-tight">
            Login to AgriCheck
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Or{' '}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
              create an account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
