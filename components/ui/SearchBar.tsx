'use client';

import { useState } from 'react';

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [university, setUniversity] = useState('');

  const universities = [
    'All Universities',
    'University of New South Wales (UNSW)',
    'University of Sydney',
    'Macquarie University',
    'University of Technology Sydney (UTS)',
    'Western Sydney University',
    'University of Wollongong',
    'University of Newcastle',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigation logic would go here
    // TODO: Implement search navigation
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 -mt-10 relative z-10 max-w-4xl mx-4 lg:mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
              University
            </label>
            <select
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="input"
            >
              {universities.map((uni) => (
                <option key={uni} value={uni}>
                  {uni}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Location or Accommodation Name
            </label>
            <input
              id="search"
              type="text"
              placeholder="e.g., Kensington, UNSW Village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full md:w-auto px-8">
          <svg
            className="w-5 h-5 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Search Accommodations
        </button>
      </form>
    </div>
  );
}
