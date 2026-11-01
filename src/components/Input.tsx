import type { InputHTMLAttributes } from "react";

//here i am creating a variable with the type being a props object
type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helpText?: string;
};

// A label, input and optional help text grouped together
export function Input({ label, helpText, id, ...rest }: Props) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...rest} />
      {helpText && <p className="help-text">{helpText}</p>}
    </div>
  );
}