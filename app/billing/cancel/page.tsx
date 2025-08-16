'use client';

import { useRouter } from 'next/navigation';
import { X, RefreshCw, Home, HelpCircle } from 'lucide-react';

export default function BillingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-lg w-full">
        {/* Cancel Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Cancelled
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your payment was cancelled. No charges have been made to your account.
          You can try again anytime or contact our support team for assistance.
        </p>

        {/* Info Box */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-3">What happened?</h3>
              <p className="text-red-700 text-sm mb-3">
                The payment process was interrupted or cancelled. This could be due to:
              </p>
              <ul className="text-red-700 text-sm space-y-1">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>You closed the payment window</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Network connectivity issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Payment method was declined</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>You decided to cancel the transaction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/family-dashboard')}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Need help with your payment?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <a 
              href="mailto:support@calmpathai.com" 
              className="text-blue-500 hover:underline"
            >
              support@calmpathai.com
            </a>
            <span className="hidden sm:inline text-gray-400">•</span>
            <a 
              href="tel:+1-800-CALMPATH" 
              className="text-blue-500 hover:underline"
            >
              1-800-CALMPATH
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Security Notice:</strong> No payment information was stored during this process. 
            Your financial data remains secure.
          </p>
        </div>
      </div>
    </div>
  );
}
