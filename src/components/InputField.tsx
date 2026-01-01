// // components/InputField.tsx
// import React from "react";

// interface InputFieldProps {
//   label?: string;
//   name: string;
//   type?: string;
//   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   required?: boolean;
//   readOnly?: boolean;
//   step?: string;
//   min?: string | number;
//   maxLength?: number;
//   className?: string;
//   icon?: React.ReactNode;
//   error?: string;
//   // InputSize?:"sm" | "md" | "lg";
//   autoComplete?: string;
//   disabled?:boolean

// }

// export function InputField({
//   label,
//   name,
//   type = "text",
//   onChange,
//   onBlur,
//   placeholder,
//   required = false,
//   readOnly = false,
//   step,
//   min,
//   maxLength,
//   className = "",
//   icon,
//   error,
//   autoComplete,
//   // disabled
// }: InputFieldProps) {
//   const inputId = name;

//   return (
//     <div className="space-y-2">
//       {label && (
//         <label
//           htmlFor={inputId}
//           className="block text-sm font-semibold text-slate-700"
//         >
//           {label}
//           {required && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}

//       <div className="relative">
//         {icon && (
//           <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
//             {icon}
//           </div>
//         )}

//         <input
//           id={inputId}
//           type={type}
//           name={name}
//           onChange={onChange}
//           onBlur={onBlur}
//           placeholder={placeholder}
//           required={required}
//           readOnly={readOnly}
//           step={step}
//           min={min}
//           maxLength={maxLength}
//           aria-invalid={!!error || undefined}
//           aria-describedby={error ? `${inputId}-error` : undefined}
//           autoComplete={autoComplete}
//           className={`w-full border-2 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 ${icon ? "pl-12 pr-4" : "px-4"
//             } ${readOnly
//               ? "bg-slate-100 text-slate-500 cursor-not-allowed"
//               : "bg-white/50"
//             } ${error ? "border-red-500 focus:ring-red-100" : "border-slate-200"} ${className}`}
//         />
//       </div>

//       {error && (
//         <p id={`${inputId}-error`} className="text-xs text-red-600">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

// export default InputField;




"use client";
import React from "react";
import clsx from "clsx";
import { FieldError } from "react-hook-form";

// Remove BaseInputWrapper if you want a completely self-contained input.
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  error?: string | FieldError;
  required?: boolean;
  variant?: "default" | "modern" | "priceline";
  inputSize?: "sm" | "md" | "lg";
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  error,
  icon,
  iconRight,
  required,
  className = "",
  variant = "priceline",
  inputSize = "md",
  ...rest
}) => {
  const errorMessage = typeof error === "string" ? error : error?.message;
  const sizeClasses = {
    sm: "h-10 text-sm",
    md: "h-12 text-base",
    lg: "h-14 text-lg",
  };

  const variantClasses = {
    default:
      "border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all",
    priceline:
      "border-2 border-gray-200 bg-white rounded-xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 hover:border-emerald-300",
    modern:
      "border-b-2 border-t-0 border-l-0 border-r-0 border-gray-300 bg-gray-50 rounded-t-lg focus:border-emerald-600 focus:bg-white focus:ring-0 transition-colors",
  };

  return (
    <div className={clsx("mb-4", className)}>
      {label && (
        <label htmlFor={rest.name} className="block mb-1 font-medium text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 text-xl pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={rest.name}
          type={type}
          className={clsx(
            "w-full placeholder-gray-400 px-4 focus:outline-none",
            icon && "pl-12",
            iconRight && "pr-12",
            variantClasses[variant],
            sizeClasses[inputSize],
            errorMessage && "border-red-400 focus:border-red-500 focus:ring-red-200",
            rest.disabled && "opacity-60 cursor-not-allowed bg-gray-100"
          )}
          autoComplete={rest.autoComplete}
          {...rest}
        />
        {iconRight && (
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl cursor-pointer">
            {iconRight}
          </span>
        )}
      </div>
      {errorMessage && (
        <p className="mt-1 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};

export default InputField;
