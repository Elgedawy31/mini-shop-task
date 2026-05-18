import { cn } from "@/shared/utils/cn";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Input } from "../atoms/input";
import { Button } from "../atoms/button";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export const PasswordInput = ({ containerClassName, className, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const toggle = () => setVisible((prev) => !prev);

  return (
    <div className={cn("relative", containerClassName)}>
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </Button>
    </div>
  );
};
