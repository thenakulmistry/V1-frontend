import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '@/components/common/Button';
import { Loader } from 'lucide-react';

export default function CheckoutForm({ onPaymentSuccess, onPaymentError }) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/user/profile?payment_status=success`,
      },
      redirect: 'if_required', // This prevents immediate redirection
    });

    if (error) {
      setMessage(error.message);
      if (onPaymentError) onPaymentError(error);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setMessage('Payment succeeded!');
      if (onPaymentSuccess) onPaymentSuccess(paymentIntent);
    } else {
      setMessage('An unexpected error occurred.');
    }

    setIsProcessing(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />
      <Button
        disabled={isProcessing || !stripe || !elements}
        id="submit"
        className="w-full mt-6"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <Loader className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </span>
        ) : (
          'Pay now'
        )}
      </Button>

      {message && <div id="payment-message" className="text-red-600 text-sm mt-2">{message}</div>}
    </form>
  );
}