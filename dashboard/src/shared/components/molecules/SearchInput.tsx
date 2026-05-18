import React from "react";
import { Search } from "lucide-react";
import { Input } from "../atoms/input";
import { cn } from "../../utils/cn";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
}

export function SearchInput({ className, onSearch, ...props }: SearchInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="relative">
      <Search
        className={cn(
          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
          "text-muted-foreground dark:text-muted-foreground"
        )}
      />
      <Input
        className={cn(
          "pl-10",
          "bg-background border-input text-foreground",
          "placeholder:text-muted-foreground",
          "dark:bg-transparent dark:border-input dark:text-foreground",
          "dark:placeholder:text-muted-foreground",
          className
        )}
        placeholder="Search..."
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
