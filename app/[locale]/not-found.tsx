import {Link} from '@/i18n/routing';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-white mb-4">404</h1>
        <h2 className="text-4xl font-bold text-purple-400 mb-6">Page Not Found</h2>
        <p className="text-xl text-gray-300 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="bg-purple-600 text-white text-lg px-8 py-3 rounded-full hover:bg-purple-700 inline-block"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
} 