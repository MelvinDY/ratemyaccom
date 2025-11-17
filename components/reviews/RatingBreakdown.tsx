import { RatingBreakdown as RatingBreakdownType } from '@/types';

interface RatingBreakdownProps {
  breakdown: RatingBreakdownType;
  totalReviews: number;
}

export default function RatingBreakdown({ breakdown, totalReviews }: RatingBreakdownProps) {
  const categories = [
    { key: 'cleanliness', label: 'Cleanliness', icon: '✨' },
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'value', label: 'Value for Money', icon: '💰' },
    { key: 'amenities', label: 'Amenities', icon: '🏋️' },
    { key: 'management', label: 'Management', icon: '👥' },
    { key: 'safety', label: 'Safety', icon: '🔒' },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-6">Rating Breakdown</h3>

      <div className="space-y-4">
        {categories.map((category) => {
          const rating = breakdown[category.key as keyof RatingBreakdownType];
          const percentage = (rating / 5) * 100;

          return (
            <div key={category.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium text-purple-200">{category.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{rating.toFixed(1)}</span>
              </div>

              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-purple-500/20 text-center">
        <p className="text-sm text-purple-200">
          Based on <span className="font-semibold text-white">{totalReviews}</span> verified reviews
        </p>
      </div>
    </div>
  );
}
