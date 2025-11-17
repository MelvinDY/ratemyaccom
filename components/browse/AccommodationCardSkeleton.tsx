export default function AccommodationCardSkeleton() {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col animate-pulse">
      {/* Image skeleton with purple gradient */}
      <div className="relative h-48 bg-gradient-to-br from-lyra-purple-start/20 via-lyra-purple-end/10 to-lyra-purple-start/10"></div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Title skeleton */}
        <div className="h-6 bg-white/10 rounded-lg w-3/4 mb-3"></div>

        {/* Rating skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 bg-white/10 rounded-lg w-24"></div>
        </div>

        {/* University skeleton */}
        <div className="h-4 bg-white/10 rounded-lg w-1/2 mb-3"></div>

        {/* Location skeleton */}
        <div className="h-4 bg-white/10 rounded-lg w-2/3 mb-2"></div>

        {/* Distance skeleton */}
        <div className="h-4 bg-white/10 rounded-lg w-1/2 mb-4"></div>

        {/* Amenities skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-white/10 rounded-lg w-16"></div>
          <div className="h-6 bg-white/10 rounded-lg w-20"></div>
          <div className="h-6 bg-white/10 rounded-lg w-14"></div>
        </div>

        {/* Pricing skeleton */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-baseline justify-between">
            <div className="h-8 bg-white/10 rounded-lg w-32"></div>
            <div className="h-4 bg-white/10 rounded-lg w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
