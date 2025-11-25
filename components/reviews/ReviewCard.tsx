'use client';

import { useState } from 'react';
import { Review } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReviewCardProps {
  review: Review;
}

type ReportReason = 'spam' | 'offensive' | 'fake' | 'other';

const reportReasons: { value: ReportReason; label: string; description: string }[] = [
  { value: 'spam', label: 'Spam', description: 'Promotional content or repetitive posts' },
  {
    value: 'offensive',
    label: 'Offensive',
    description: 'Inappropriate, hateful, or abusive content',
  },
  { value: 'fake', label: 'Fake Review', description: 'Misleading or fabricated information' },
  { value: 'other', label: 'Other', description: 'Other violation of community guidelines' },
];

export default function ReviewCard({ review }: ReviewCardProps) {
  const { isAuthenticated } = useAuth();
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false);
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false);
  const [helpfulError, setHelpfulError] = useState<string | null>(null);

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [reportDetails, setReportDetails] = useState('');
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleHelpfulClick = async () => {
    if (!isAuthenticated) {
      setHelpfulError('Please log in to mark reviews as helpful');
      setTimeout(() => setHelpfulError(null), 3000);
      return;
    }

    if (hasMarkedHelpful) {
      return;
    }

    setIsHelpfulLoading(true);
    setHelpfulError(null);

    try {
      const response = await api.post<{
        success: boolean;
        data: { helpfulCount: number };
      }>(`/reviews/${review.id}/helpful`);

      setHelpfulCount(response.data.helpfulCount);
      setHasMarkedHelpful(true);
    } catch (error) {
      setHelpfulError(error instanceof Error ? error.message : 'Failed to mark as helpful');
      setTimeout(() => setHelpfulError(null), 3000);
    } finally {
      setIsHelpfulLoading(false);
    }
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      setReportError('Please log in to report reviews');
      setTimeout(() => setReportError(null), 3000);
      return;
    }
    setIsReportDialogOpen(true);
  };

  const handleReportSubmit = async () => {
    if (!selectedReason) {
      return;
    }

    setIsReportLoading(true);
    setReportError(null);

    try {
      await api.post(`/reviews/${review.id}/report`, {
        reason: selectedReason,
        details: reportDetails || undefined,
      });

      setReportSuccess(true);
      setTimeout(() => {
        setIsReportDialogOpen(false);
        setReportSuccess(false);
        setSelectedReason(null);
        setReportDetails('');
      }, 2000);
    } catch (error) {
      setReportError(error instanceof Error ? error.message : 'Failed to submit report');
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleDialogClose = () => {
    if (!isReportLoading) {
      setIsReportDialogOpen(false);
      setSelectedReason(null);
      setReportDetails('');
      setReportError(null);
      setReportSuccess(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {review.userName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-white">{review.userName}</h4>
                {review.verified && (
                  <span className="bg-green-600/30 text-green-300 border border-green-500/50 px-2 py-0.5 rounded-full text-xs">
                    Verified
                  </span>
                )}
              </div>
              {review.userUniversity && (
                <p className="text-sm text-purple-200">{review.userUniversity}</p>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center space-x-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(review.rating) ? 'text-yellow-400' : 'text-gray-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-purple-200">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{review.title}</h3>

      <p className="text-gray-300 mb-4 leading-relaxed">{review.text}</p>

      {review.roomType && review.stayDuration && (
        <div className="flex flex-wrap gap-2 mb-4 text-sm">
          <span className="bg-purple-600/30 text-purple-200 border border-purple-500/50 px-3 py-1 rounded-full">
            Room: {review.roomType}
          </span>
          <span className="bg-purple-600/30 text-purple-200 border border-purple-500/50 px-3 py-1 rounded-full">
            Stayed: {review.stayDuration}
          </span>
        </div>
      )}

      {(review.pros || review.cons) && (
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {review.pros && review.pros.length > 0 && (
            <div>
              <h5 className="font-semibold text-green-400 mb-2 text-sm">Pros</h5>
              <ul className="space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start">
                    <svg
                      className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {review.cons && review.cons.length > 0 && (
            <div>
              <h5 className="font-semibold text-red-400 mb-2 text-sm">Cons</h5>
              <ul className="space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start">
                    <svg
                      className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
        <div className="flex flex-col">
          <button
            onClick={handleHelpfulClick}
            disabled={isHelpfulLoading || hasMarkedHelpful}
            className={`text-sm transition-colors flex items-center ${
              hasMarkedHelpful
                ? 'text-purple-400 cursor-default'
                : 'text-purple-200 hover:text-purple-400'
            } ${isHelpfulLoading ? 'opacity-50 cursor-wait' : ''}`}
          >
            <svg
              className={`w-5 h-5 mr-1 ${hasMarkedHelpful ? 'fill-purple-400' : ''}`}
              fill={hasMarkedHelpful ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            {isHelpfulLoading ? 'Loading...' : `Helpful (${helpfulCount})`}
          </button>
          {helpfulError && <span className="text-xs text-red-400 mt-1">{helpfulError}</span>}
        </div>

        <div className="flex flex-col items-end">
          <button
            onClick={handleReportClick}
            className="text-sm text-gray-400 hover:text-red-400 transition-colors"
          >
            Report
          </button>
          {reportError && !isReportDialogOpen && (
            <span className="text-xs text-red-400 mt-1">{reportError}</span>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="bg-gray-900 border border-purple-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Report Review</DialogTitle>
            <DialogDescription className="text-gray-400">
              Help us maintain a safe community by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>

          {reportSuccess ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-green-400 font-medium">Report submitted successfully</p>
              <p className="text-gray-400 text-sm mt-1">
                Thank you for helping keep our community safe.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <span className="text-sm font-medium text-gray-300 mb-2 block">
                    Why are you reporting this review?
                  </span>
                  <div className="space-y-2" role="radiogroup" aria-label="Report reason">
                    {reportReasons.map((reason) => (
                      <button
                        key={reason.value}
                        onClick={() => setSelectedReason(reason.value)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedReason === reason.value
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                        }`}
                      >
                        <span className="font-medium text-white">{reason.label}</span>
                        <p className="text-sm text-gray-400 mt-0.5">{reason.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="report-details"
                    className="text-sm font-medium text-gray-300 mb-2 block"
                  >
                    Additional details (optional)
                  </label>
                  <textarea
                    id="report-details"
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide any additional context..."
                    className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                  />
                </div>

                {reportError && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                    <p className="text-sm text-red-400">{reportError}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={isReportLoading}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReportSubmit}
                  disabled={!selectedReason || isReportLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isReportLoading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
