'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ImageIcon } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use placeholder images if none provided
  const displayImages = images.length > 0 ? images : ['/images/placeholder-accommodation.jpg'];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious();
    }
    if (e.key === 'ArrowRight') {
      handleNext();
    }
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
          Photos
        </h2>

        {/* Main Image */}
        <button
          type="button"
          className="relative w-full aspect-video rounded-lg overflow-hidden cursor-pointer group mb-4"
          onClick={() => setIsModalOpen(true)}
          aria-label={`View ${name} photos in gallery`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center">
            {displayImages[selectedIndex].startsWith('/images/') ? (
              <div className="flex flex-col items-center text-white/40">
                <ImageIcon className="w-16 h-16 mb-2" />
                <span className="text-sm">Image coming soon</span>
              </div>
            ) : (
              <Image
                src={displayImages[selectedIndex]}
                alt={`${name} - Photo ${selectedIndex + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white font-medium transition-opacity duration-300">
              Click to enlarge
            </span>
          </div>

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {selectedIndex + 1} / {displayImages.length}
          </div>
        </button>

        {/* Thumbnail Grid */}
        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {displayImages.slice(0, 4).map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-video rounded-lg overflow-hidden transition-all duration-200 ${
                  selectedIndex === index
                    ? 'ring-2 ring-lyra-purple-start'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal-light to-charcoal flex items-center justify-center">
                  {image.startsWith('/images/') ? (
                    <ImageIcon className="w-6 h-6 text-white/40" />
                  ) : (
                    <Image
                      src={image}
                      alt={`${name} - Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                {index === 3 && displayImages.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-medium">+{displayImages.length - 4}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isModalOpen && (
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-label="Image gallery modal"
          aria-modal="true"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors z-10"
            aria-label="Close gallery"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Image */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4"
            onClick={(e) => e.stopPropagation()}
            role="img"
            aria-label={`${name} - Photo ${selectedIndex + 1} of ${displayImages.length}`}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {displayImages[selectedIndex].startsWith('/images/') ? (
                <div className="flex flex-col items-center text-white/40">
                  <ImageIcon className="w-24 h-24 mb-4" />
                  <span className="text-lg">Image coming soon</span>
                </div>
              ) : (
                <Image
                  src={displayImages[selectedIndex]}
                  alt={`${name} - Photo ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                />
              )}
            </div>

            {/* Navigation Arrows */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                  }}
                  className={`relative w-16 h-12 rounded overflow-hidden transition-all duration-200 ${
                    selectedIndex === index
                      ? 'ring-2 ring-lyra-purple-start'
                      : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  {image.startsWith('/images/') ? (
                    <div className="w-full h-full bg-charcoal flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-white/40" />
                    </div>
                  ) : (
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
