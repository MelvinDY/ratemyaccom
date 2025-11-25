'use client';

import Link from 'next/link';
import { Star, Pencil } from 'lucide-react';

interface ReviewFormProps {
  accommodationId: string;
  accommodationSlug: string;
}

export default function ReviewForm({ accommodationId }: ReviewFormProps) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-lyra-purple-start/20 to-lyra-purple-end/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Pencil className="w-8 h-8 text-lyra-purple-start" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-3">
          Share Your Experience
        </h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Lived here before? Help other students by sharing your honest review about this
          accommodation.
        </p>

        {/* Preview Stars */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-8 h-8 text-white/20" />
          ))}
        </div>

        <Link
          href={`/write-review?accommodation=${accommodationId}`}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-lyra-purple-start/50 transition-all duration-300"
        >
          <Pencil className="w-5 h-5" />
          Write a Review
        </Link>

        <p className="text-white/40 text-sm mt-4">
          You must be logged in with a verified university email to submit a review.
        </p>
      </div>
    </div>
  );
}
