import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  validate?: (value: string) => string | undefined;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    validate,
    required,
    id,
    ...props 
  }, ref) => {
    const [internalError, setInternalError] = React.useState<string | undefined>(error);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (validate) {
        const validationError = validate(e.target.value);
        setInternalError(validationError);
      }
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (validate && internalError) {
        const validationError = validate(e.target.value);
        setInternalError(validationError);
      }
      props.onChange?.(e);
    };

    const displayError = internalError || error;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              displayError && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        
        {displayError && (
          <p className="mt-1 text-sm text-destructive">{displayError}</p>
        )}
        
        {helperText && !displayError && (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    placeholder, 
    options, 
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
