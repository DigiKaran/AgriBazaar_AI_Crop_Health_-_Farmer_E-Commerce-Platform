
import SignupForm from './components/SignupForm';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up - AgriCheck',
  description: 'Create a new AgriCheck account.',
};

export default function SignupPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h1 className="text-center text-3xl font-headline tracking-tight">
            Create your AgriCheck Account
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Login here
            </Link>
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
