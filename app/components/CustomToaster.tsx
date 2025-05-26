'use client';

import { Toaster } from 'react-hot-toast';

const CustomToaster = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      style: {
        background: '#1f2937', // Tailwind: bg-gray-800
        color: '#fff',
        border: '1px solid #4f46e5', // Tailwind: border-indigo-600
        padding: '12px 16px',
        fontSize: '0.875rem',
      },
      success: {
        iconTheme: {
          primary: '#10b981',
          secondary: '#1f2937',
        },
      },
    }}
  />
);

export default CustomToaster;
