import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
  description?: string;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Enter your PIN',
  description = 'Please enter your PIN to continue',
}) => {
  const [pin, setPin] = useState('');
  const maxLength = 4;

  const handleNumberClick = (number: string) => {
    if (pin.length < maxLength) {
      setPin(prev => prev + number);
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    if (pin.length === maxLength) {
      onConfirm(pin);
      setPin('');
      onClose();
    }
  };

  const handleClose = () => {
    setPin('');
    onClose();
  };

  if (!isOpen) return null;

  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', 'X']
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
          {/* Header */}
          <div className="p-6 text-center border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
            <p className="text-sm text-gray-600">{description}</p>
          </div>

          {/* PIN Display */}
          <div className="p-6">
            <div className="flex justify-center gap-3 mb-8">
              {Array.from({ length: maxLength }).map((_, index) => (
                <div
                  key={index}
                  className={`
                    w-4 h-4 rounded-full border-2 transition-colors
                    ${index < pin.length 
                      ? 'bg-red-600 border-red-600' 
                      : 'bg-gray-200 border-gray-300'
                    }
                  `}
                />
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3">
              {numbers.flat().map((num, index) => {
                if (num === 'X') {
                  return (
                    <button
                      key={index}
                      onClick={handleBackspace}
                      className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-700 transition-colors flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleNumberClick(num)}
                    className="h-14 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-gray-900 text-lg transition-colors"
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClear}
                className="flex-1 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleConfirm}
                disabled={pin.length !== maxLength}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};