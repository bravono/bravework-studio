'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Payment page error:', error);
  }, [error]);

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Something went wrong!</h1>
        <div className="error-message">
          {error.message || 'An error occurred while loading the payment page.'}
        </div>
        <div className="error-actions">
          <button onClick={reset} className="retry-button">
            Try again
          </button>
          <button onClick={() => router.push('/')} className="home-button">
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
} 