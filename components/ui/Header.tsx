import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 text-white font-bold text-xl px-3 py-1 rounded-lg">
                RMA
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Rate My Accom NSW
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link
              href="/accommodations"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Browse
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="btn btn-outline text-sm">Sign In</button>
            <button className="btn btn-primary text-sm">Write Review</button>
          </div>
        </div>
      </nav>
    </header>
  );
}
