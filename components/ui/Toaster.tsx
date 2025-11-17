
import React, { useState, useEffect, useCallback } from 'react';

type ToastMessage = {
  id: number;
  message: string;
  type: 'success' | 'error';
};

let toastId = 0;
const listeners: Array<(toast: ToastMessage) => void> = [];

export const toast = (message: string, type: 'success' | 'error' = 'success') => {
  const newToast: ToastMessage = { id: toastId++, message, type };
  listeners.forEach(listener => listener(newToast));
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const newToastListener = (newToast: ToastMessage) => {
      setToasts(currentToasts => [...currentToasts, newToast]);
      setTimeout(() => {
        setToasts(currentToasts => currentToasts.filter(t => t.id !== newToast.id));
      }, 3000);
    };

    listeners.push(newToastListener);
    return () => {
      const index = listeners.indexOf(newToastListener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const getBgColor = (type: 'success' | 'error') => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-800';
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {toasts.map(toastItem => (
        <div
          key={toastItem.id}
          className={`${getBgColor(toastItem.type)} text-white py-2 px-4 rounded-md shadow-lg mb-2 animate-fade-in-up`}
        >
          {toastItem.message}
        </div>
      ))}
    </div>
  );
};
