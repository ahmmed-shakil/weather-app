import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, animate = false, delay = 0, ...props }) => {
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: delay * 0.1,
      }
    },
    hover: {
      y: -5,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 10
      }
    }
  };

  const Component = animate ? motion.div : 'div';
  const motionProps = animate ? {
    variants,
    initial: 'initial',
    animate: 'animate',
    whileHover: 'hover',
  } : {};

  return (
    <Component
      className={cn(
        'card',
        animate && 'card-hover',
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold', className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-4 pt-4 border-t', className)} {...props}>
    {children}
  </div>
);

export const GlassCard = ({ children, className, ...props }) => (
  <Card
    className={cn(
      'glass-effect border border-white/20 backdrop-blur-md',
      className
    )}
    {...props}
  >
    {children}
  </Card>
);
