import { motion, type HTMLMotionProps } from 'framer-motion';

export type BouncyButtonProps = HTMLMotionProps<'button'>;

export function BouncyButton({
  children,
  className = '',
  disabled,
  ...props
}: BouncyButtonProps) {
  return (
    <motion.button
      {...props}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
