import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  animation?: 'hover-lift' | 'hover-glow' | 'none';
}

export const Card = ({ 
  children, 
  className = '', 
  interactive = false,
  animation = 'none'
}: CardProps) => {
  const interactiveClasses = interactive ? 'cursor-pointer hover:border-primary/50' : '';
  
  const animationClasses = {
    'none': '',
    'hover-lift': 'transition-transform duration-300 hover:-translate-y-1',
    'hover-glow': 'transition-all duration-300 hover:shadow-md hover:shadow-primary/20'
  };
  
  return (
    <div className={`bg-card rounded-lg border border-border transition-colors ${interactiveClasses} ${animationClasses[animation]} ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return (
    <div className={`p-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle = ({ children, className = '' }: CardTitleProps) => {
  return (
    <h3 className={`text-lg font-medium ${className}`}>
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription = ({ children, className = '' }: CardDescriptionProps) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      {children}
    </p>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = '' }: CardContentProps) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return (
    <div className={`p-4 border-t border-border ${className}`}>
      {children}
    </div>
  );
};