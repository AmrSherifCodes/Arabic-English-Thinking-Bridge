import { motion, type HTMLMotionProps } from 'framer-motion';
import { triggerHapticImpact } from '../utils/fx';

export interface BouncyButtonProps extends HTMLMotionProps<'button'> {
  disableHaptic?: boolean;
}

export function BouncyButton({
  children,
  className = '',
  disabled,
  disableHaptic = false,
  onClick,
  ...props
}: BouncyButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !disableHaptic) {
      triggerHapticImpact();
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <motion.button
      {...props}
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={`min-h-[44px] min-w-[44px] ${className}`}
    >
      {children}
    </motion.button>
  );
}
