import React from 'react';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';
type AnimationStyle = 'none' | 'pulse' | 'bounce' | 'scale' | 'ripple';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animation?: AnimationStyle;
  as?: React.ElementType;
  to?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      animation = 'none',
      disabled,
      className = '',
      as,
      to,
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden';
    
    // Size classes
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 py-3 text-lg'
    };
    
    // Variant classes
    const variantClasses = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200',
      outline: 'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary transition-all duration-200',
      ghost: 'hover:bg-accent hover:text-accent-foreground transition-colors duration-200',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors duration-200',
      link: 'text-primary underline-offset-4 hover:underline p-0 h-auto transition-colors duration-200'
    };
    
    // Animation classes
    const animationClasses = {
      none: '',
      pulse: 'hover:animate-pulse',
      bounce: 'hover:animate-bounce',
      scale: 'hover:animate-scale',
      ripple: 'transform duration-200 ease-in-out'
    };
    
    // Width class
    const widthClass = fullWidth ? 'w-full' : '';
    
    // Handle ripple effect
    const [coords, setCoords] = React.useState({ x: -1, y: -1 });
    const [isRippling, setIsRippling] = React.useState(false);

    React.useEffect(() => {
      if (coords.x !== -1 && coords.y !== -1) {
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 500);
      } else {
        setIsRippling(false);
      }
    }, [coords]);

    React.useEffect(() => {
      if (!isRippling) setCoords({ x: -1, y: -1 });
    }, [isRippling]);

    const handleRipple = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (animation === 'ripple') {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };
    
    const Component = as || 'button';
    const componentProps = as === Link ? { to, ...props } : props;
    
    return (
      <Component
        ref={ref as any}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${animationClasses[animation]} ${widthClass} ${className}`}
        onClick={(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
          handleRipple(e);
          props.onClick?.(e as any);
        }}
        {...componentProps}
      >
        {isRippling && animation === 'ripple' && (
          <span 
            className="absolute bg-white/30 rounded-full animate-ripple"
            style={{
              left: coords.x,
              top: coords.y,
              width: '200%',
              height: '200%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        )}
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Component>
    );
  }
);

Button.displayName = 'Button';