import type { ButtonHTMLAttributes } from "react";

// variant "primary" is the main action, "secondary" is everything else
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ variant = "primary", className = "", ...rest }: Props) {
  return <button className={`btn btn-${variant} ${className}`} {...rest} />;
}