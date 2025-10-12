import React from 'react';

interface IconProps {
  className?: string;
}

export const CheckmarkIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M9 12.75L11.25 15 15 9.75" fillRule="evenodd" clipRule="evenodd" />
    <path d="M12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3z" />
  </svg>
);

export const LightningIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M13.5 2.25L3 13.5h8.25L10.5 21.75 21 10.5H12L13.5 2.25z" />
  </svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75H3v-6.75C3 12.504 3.504 12 4.125 12zM9.75 7.5h2.25v13.5H9.75V7.5zM16.5 3.375h2.25V19.125H16.5V3.375z" />
  </svg>
);