'use client';

import { useRouter } from 'next/navigation';

export default function PaymentNotFound() {
  const router = useRouter();

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Payment Page Not Found</h1>
        <p>The payment page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => router.push('/')} className="home-button">
          Return to Home
        </button>
      </div>
    </div>
  );
} 