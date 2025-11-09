'use client';

import { useEffect, useRef } from 'react';
import { Accommodation } from '@/types';
import AccommodationCard from './AccommodationCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FeaturedGridProps {
  accommodations: Accommodation[];
}

export default function FeaturedGrid({ accommodations }: FeaturedGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Show first 3 accommodations
  const displayedAccommodations = accommodations.slice(0, 3);

  useEffect(() => {
    if (!sectionRef.current || !scrollContainerRef.current) return;

    const section = sectionRef.current;
    const scrollContainer = scrollContainerRef.current;

    // Calculate total scroll distance needed to show all cards including right padding
    const scrollWidth = scrollContainer.scrollWidth;
    const containerWidth = scrollContainer.clientWidth;
    const rightPadding = 300; // Match px-[300px]
    const scrollDistance = scrollWidth - containerWidth + rightPadding;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${scrollDistance * 1.8}`, // Extended scroll distance
        scrub: 0.3,
        pin: true,
        anticipatePin: 1,
      },
    });

    // Animate from right to left (negative x)
    tl.to(scrollContainer, {
      x: -scrollDistance,
      ease: 'none',
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full overflow-hidden">
      <div className="h-screen flex flex-col justify-center">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Featured Accommodations
            </h2>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Popular student housing options across NSW universities, reviewed by students like you.
            </p>
          </div>

          <div className="w-full overflow-hidden">
            <div ref={scrollContainerRef} className="flex gap-[300px] pb-8 px-[300px]">
              {displayedAccommodations.map((accommodation) => (
                <div key={accommodation.id} className="flex-shrink-0 w-[800px]">
                  <AccommodationCard accommodation={accommodation} />
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="border-2 border-purple-500 text-purple-300 px-8 py-2 rounded-lg font-medium hover:bg-purple-500/20 transition-all duration-200">
              View All Accommodations
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
