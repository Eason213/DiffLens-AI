import React from 'react';

interface IOSButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'glass';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const IOSButton: React.FC<IOSButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon
}) => {
  const baseStyles = "relative overflow-hidden transition-all duration-300 active:scale-95 flex items-center justify-center font-medium tracking-wide";
  
  const variants = {
    primary: "bg-ios-blue text-white shadow-[0_0_20px_rgba(10,132,255,0.4)] hover:bg-blue-500",
    secondary: "bg-ios-surface text-white border border-ios-glassBorder hover:bg-gray-800",
    danger: "bg-ios-red text-white shadow-[0_0_20px_rgba(255,69,58,0.4)]",
    glass: "bg-ios-glass backdrop-blur-md border border-ios-glassBorder text-white hover:bg-white/10",
  };

  const rounded = className.includes('rounded') ? '' : 'rounded-2xl';
  const padding = className.includes('p-') ? '' : 'py-4 px-6';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${rounded} ${padding} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};