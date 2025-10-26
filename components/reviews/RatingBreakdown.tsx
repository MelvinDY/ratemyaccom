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
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-6">Rating Breakdown</h3>

      <div className="space-y-4">
        {categories.map((category) => {
          const rating = breakdown[category.key as keyof RatingBreakdownType];
          const percentage = (rating / 5) * 100;

          return (
            <div key={category.key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{category.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
              </div>

              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Based on <span className="font-semibold">{totalReviews}</span> verified reviews
        </p>
      </div>
    </div>
  );
}
