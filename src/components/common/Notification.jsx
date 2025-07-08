import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const isSuccess = type === 'success';
  const iconColor = isSuccess ? 'text-green-600' : 'text-red-600';
  const Icon = isSuccess ? CheckCircle : XCircle;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md animate-fadeIn">
      <div className="bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-4 flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-stone-800">{message}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex rounded-md text-stone-500 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
