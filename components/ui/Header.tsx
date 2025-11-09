import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-purple-900/30 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-purple-700/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl px-3 py-1 rounded-lg">
                RMA
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                Rate My Accom NSW
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center">
            <div className="inline-flex rounded-lg border border-purple-700/50 bg-purple-900/20 backdrop-blur-sm p-1">
              <Button
                asChild
                variant="ghost"
                className="text-purple-100 hover:text-white hover:bg-purple-700/50 rounded-md"
              >
                <Link href="/">Home</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-purple-100 hover:text-white hover:bg-purple-700/50 rounded-md"
              >
                <Link href="/accommodations">Browse</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="text-purple-100 hover:text-white hover:bg-purple-700/50 rounded-md"
              >
                <Link href="/about">About</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="border-2 border-purple-300 text-purple-100 px-4 py-2 rounded-lg font-medium hover:bg-purple-800 transition-all duration-200 text-sm">
              Sign In
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm">
              Write Review
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
