'use client';

import { Toast } from './Toast';

interface ToastData {
  id: string;
  from: {
    id: string;
    name: string;
    username: string;
  };
  message: string;
  preview: string;
  conversationId: string;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  onToastClick: (conversationId: string) => void;
}

export function ToastContainer({ toasts, onDismiss, onToastClick }: ToastContainerProps) {
  const visibleToasts = toasts.slice(0, 3);

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto space-y-3">
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            from={toast.from}
            message={toast.message}
            preview={toast.preview}
            onDismiss={() => onDismiss(toast.id)}
            onClick={() => {
              onToastClick(toast.conversationId);
              onDismiss(toast.id);
            }}
          />
        ))}
      </div>
    </div>
  );
}
