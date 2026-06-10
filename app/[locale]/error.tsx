'use client';

import {Link} from '@/i18n/routing';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  // Log error server-side for debugging, never show to users
  console.error('Application error:', error);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-white mb-4">500</h1>
        <h2 className="text-4xl font-bold text-purple-400 mb-6">Something went wrong</h2>
        <p className="text-xl text-gray-300 mb-8">
          We&apos;re sorry, but there was an error processing your request.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-purple-600 text-white text-lg px-8 py-3 rounded-full hover:bg-purple-700 inline-block"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-purple-600 text-white text-lg px-8 py-3 rounded-full hover:bg-purple-600/20 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
