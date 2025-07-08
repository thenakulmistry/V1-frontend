import React from 'react';
import Button from '@/components/common/Button';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 p-4 animate-fadeIn transition-colors duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-white/30 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl max-w-md w-full mx-4 p-6 flex flex-col animate-fadeIn text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100/50 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800">
            {title || 'Confirm Action'}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-stone-600">{message || 'Are you sure you want to proceed?'}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full justify-center rounded-md border-stone-400 text-stone-700 hover:bg-stone-500/20"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="w-full justify-center rounded-md bg-orange-600 hover:bg-orange-700 text-white"
          >
            Confirm
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-3 right-3 text-stone-500 hover:text-stone-700 hover:bg-white/30 rounded-full"
        >
          <X size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
