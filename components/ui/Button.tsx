import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
      bg-primary text-primary-foreground hover:bg-primary/90
      h-10 px-4 py-2
      dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90
      ${className}`}
      {...props}
    />
  );
};

export { Button };
