// components/form/RHFInputField.tsx
"use client";

import { FieldPath, FieldValues, UseFormRegister } from "react-hook-form";
import InputField from "@/components/InputField";

interface RHFInputFieldProps<
  TFieldValues extends FieldValues = FieldValues
> {
  name: FieldPath<TFieldValues>;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  register: UseFormRegister<TFieldValues>;
  error?: string;
  className?: string;
}

export function RHFInputField<TFieldValues extends FieldValues>({
  name,
  label,
  type = "text",
  placeholder,
  required,
  icon,
  register,
  error,
  className,
}: RHFInputFieldProps<TFieldValues>) {
  const { onChange, onBlur, ref } = register(name);

  return (
    <div className="space-y-3">
      <InputField
        label={label}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        onChange={onChange}
        onBlur={onBlur}
        icon={icon}
        className={className}
        error={error}
      />
      {/* react-hook-form will attach ref via name, no need to pass ref manually for simple inputs */}
    </div>
  );
}
