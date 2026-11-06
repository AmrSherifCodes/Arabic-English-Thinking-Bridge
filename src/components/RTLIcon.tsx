import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';

interface RTLIconProps extends LucideProps {
  icon: LucideIcon;
  flipInRTL?: boolean;
}

/**
 * RTLIcon wrapper that flips horizontal icons in RTL direction.
 * Set flipInRTL={false} for icons that represent time, media playback, etc.
 */
export const RTLIcon: React.FC<RTLIconProps> = ({ icon: Icon, flipInRTL = true, className = '', ...props }) => {
  const flipClass = flipInRTL ? 'rtl:-scale-x-100 transform' : '';
  return <Icon className={`${flipClass} ${className}`.trim()} {...props} />;
};
