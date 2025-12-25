// components/InputField.tsx
import React from "react";

interface InputFieldProps {
  label?: string;
  name: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  step?: string;
  min?: string;
  maxLength?: number;
  className?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  readOnly = false,
  step,
  min,
  maxLength,
  className = "",
  icon,
  error,
}: InputFieldProps) {
  const inputId = name;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          step={step}
          min={min}
          maxLength={maxLength}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full border-2 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${
            icon ? "pl-12 pr-4" : "px-4"
          } ${
            readOnly
              ? "bg-slate-100 text-slate-500 cursor-not-allowed"
              : "bg-white/50"
          } ${error ? "border-red-500 focus:ring-red-100" : "border-slate-200"} ${className}`}
        />
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export default InputField;
