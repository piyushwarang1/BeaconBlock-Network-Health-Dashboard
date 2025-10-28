import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  animation?: 'fade-in' | 'slide-in' | 'scale-in';
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ children, className = '', animation, ...props }, ref) => {
    const animationClasses = {
      'fade-in': 'animate-fade-in',
      'slide-in': 'animate-slide-in',
      'scale-in': 'animate-scale-in',
    };
    
    return (
      <div className="w-full overflow-auto">
        <table
          ref={ref}
          className={`w-full caption-bottom text-sm ${animation ? animationClasses[animation] : ''} ${className}`}
          {...props}
        >
          {children}
        </table>
      </div>
    );
  }
);

Table.displayName = 'Table';

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <thead ref={ref} className={`${className}`} {...props}>
        {children}
      </thead>
    );
  }
);

TableHeader.displayName = 'TableHeader';

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <tbody ref={ref} className={`${className}`} {...props}>
        {children}
      </tbody>
    );
  }
);

TableBody.displayName = 'TableBody';

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <tfoot
        ref={ref}
        className={`bg-muted/50 font-medium ${className}`}
        {...props}
      >
        {children}
      </tfoot>
    );
  }
);

TableFooter.displayName = 'TableFooter';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  interactive?: boolean;
  animation?: 'highlight' | 'pulse' | 'fade';
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ children, className = '', interactive = false, animation, ...props }, ref) => {
    const animationClasses = {
      highlight: 'hover:bg-primary/5 active:bg-primary/10',
      pulse: 'hover:animate-pulse',
      fade: 'hover:opacity-90',
    };
    
    return (
      <tr
        ref={ref}
        className={`border-b border-border transition-all duration-200 
          ${interactive ? 'cursor-pointer' : ''} 
          ${animation ? animationClasses[animation] : 'hover:bg-muted/50'} 
          ${className}`}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

TableRow.displayName = 'TableRow';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`h-10 px-4 text-left align-middle font-medium text-muted-foreground ${className}`}
        {...props}
      >
        {children}
      </th>
    );
  }
);

TableHead.displayName = 'TableHead';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`p-4 align-middle ${className}`}
        {...props}
      >
        {children}
      </td>
    );
  }
);

TableCell.displayName = 'TableCell';

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  children: React.ReactNode;
}

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <caption
        ref={ref}
        className={`mt-4 text-sm text-muted-foreground ${className}`}
        {...props}
      >
        {children}
      </caption>
    );
  }
);

TableCaption.displayName = 'TableCaption';