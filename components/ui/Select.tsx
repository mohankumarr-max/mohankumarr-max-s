import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface SelectContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValue: string;
  setSelectedValue: (value: string) => void;
  onValueChange?: (value: string) => void;
  value?: string;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a Select provider');
  }
  return context;
};

interface SelectProps {
  children: ReactNode;
  onValueChange?: (value: string) => void;
  value?: string;
}

const Select: React.FC<SelectProps> = ({ children, onValueChange, value }) => {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  
  useEffect(() => {
    if(value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  return (
    <SelectContext.Provider value={{ open, setOpen, selectedValue, setSelectedValue, onValueChange, value }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const { open, setOpen } = useSelect();
  return (
    <button
      onClick={() => setOpen(!open)}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:bg-dark-background dark:ring-offset-dark-background dark:placeholder:text-dark-muted-foreground dark:focus:ring-dark-ring ${className}`}
    >
      {children}
      <i data-lucide="chevron-down" className="h-4 w-4 opacity-50"></i>
    </button>
  );
};

const SelectContent: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => {
  const { open, setOpen } = useSelect();
  const contentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
       if (window.lucide) window.lucide.createIcons();
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);
  
  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={`absolute z-50 w-full mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 dark:bg-dark-popover dark:text-dark-popover-foreground dark:border-dark-border ${className}`}
    >
      {children}
    </div>
  );
};

const SelectItem: React.FC<{ children: ReactNode; value: string; className?: string }> = ({ children, value, className }) => {
  const { setSelectedValue, setOpen, onValueChange, selectedValue: contextSelectedValue } = useSelect();
  const isSelected = contextSelectedValue === value;
  
  const handleSelect = () => {
    setSelectedValue(value);
    if(onValueChange) {
      onValueChange(value);
    }
    setOpen(false);
  };
  
  return (
    <div
      onClick={handleSelect}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:bg-dark-accent dark:focus:bg-dark-accent dark:focus:text-dark-accent-foreground ${className}`}
    >
      {isSelected && (
         <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <i data-lucide="check" className="h-4 w-4"></i>
        </span>
      )}
      {children}
    </div>
  );
};

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { selectedValue } = useSelect();
  const displayValue = selectedValue && selectedValue !== 'all' ? selectedValue : placeholder;
  return <span>{displayValue}</span>;
};


export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
