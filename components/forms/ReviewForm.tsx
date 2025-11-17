'use client';

import { useState } from 'react';

export default function ReviewForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Write a Review</h3>

      <form className="space-y-6">
        <div>
          <span className="block text-sm font-medium text-purple-200 mb-2">Overall Rating *</span>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="ml-2 text-sm text-purple-200">
              {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-purple-200 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            id="title"
            className="w-full px-4 py-2 bg-gray-700 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Summarize your experience"
            required
          />
        </div>

        <div>
          <label htmlFor="review-text" className="block text-sm font-medium text-purple-200 mb-2">
            Your Review *
          </label>
          <textarea
            id="review-text"
            rows={6}
            className="w-full px-4 py-2 bg-gray-700 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Share your experience living here. What did you like? What could be improved?"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="room-type" className="block text-sm font-medium text-purple-200 mb-2">
              Room Type
            </label>
            <select id="room-type" className="w-full px-4 py-2 bg-gray-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Select room type</option>
              <option value="single">Single</option>
              <option value="twin">Twin Share</option>
              <option value="studio">Studio</option>
              <option value="ensuite">Ensuite</option>
            </select>
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-purple-200 mb-2">
              Stay Duration
            </label>
            <select id="duration" className="w-full px-4 py-2 bg-gray-700 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              <option value="">Select duration</option>
              <option value="1-semester">1 Semester</option>
              <option value="2-semesters">2 Semesters</option>
              <option value="1-year">1 Year</option>
              <option value="2-years">2+ Years</option>
            </select>
          </div>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="verified"
            className="mt-1 rounded border-purple-500/30 bg-gray-700 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="verified" className="ml-2 text-sm text-gray-300">
            I verify that I have lived at this accommodation and this review is based on my personal
            experience.
          </label>
        </div>

        <div className="flex space-x-4">
          <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200">
            Submit Review
          </button>
          <button type="button" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
