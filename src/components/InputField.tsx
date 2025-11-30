// // "use client";

// // import React from "react";

// // interface InputFieldProps {
// //   label: string;
// //   name: string;
// //   type?: string;
// //   value: string | number;
// //   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
// //   placeholder?: string;
// //   required?: boolean;
// //   maxLength?: number;
// //   min?: string;      // optional
// //   step?: string;     // optional
// //   disabled?: boolean;
// //   readOnly?: boolean;
// //   className?: string
// // }

// // export default function InputField({
// //   label,
// //   name,
// //   type = "text",
// //   value,
// //   onChange,
// //   placeholder,
// //   required = false,
// //   maxLength,
// //   min,
// //   step,
// //   disabled = false,
// //   readOnly = false,     // ✅ added here
// //   className = ""
// // }: InputFieldProps) {
// //   return (
// //     <div>
// //       <label
// //         htmlFor={name}
// //         className="block text-sm font-medium text-gray-700 mb-1"
// //       >
// //         {label}
// //       </label>

// //       <input
// //         id={name}
// //         type={type}
// //         name={name}
// //         value={value}
// //         onChange={onChange}
// //         placeholder={placeholder}
// //         maxLength={maxLength}
// //         required={required}
// //         min={min}
// //         step={step}
// //         disabled={disabled}
// //         readOnly={readOnly}   // ✅ now works
// //         className={className || `w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 
// //           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition 
// //           hover:border-indigo-400
// //           ${disabled || readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
// //         `}
// //       />
// //     </div>
// //   );
// // }



// "use client";

// import React from "react";

// interface InputFieldProps {
//   label: string;
//   name: string;
//   type?: string;
//   value: string | number;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   required?: boolean;
//   maxLength?: number;
//   min?: string;
//   step?: string;
//   disabled?: boolean;
//   readOnly?: boolean;
//   className?: string;
// }

// export default function InputField({
//   label,
//   name,
//   type = "text",
//   value,
//   onChange,
//   placeholder,
//   required = false,
//   maxLength,
//   min,
//   step,
//   disabled = false,
//   readOnly = false,
//   className = "",
// }: InputFieldProps) {
//   return (
//     <div>
//       <label
//         htmlFor={name}
//         className="block text-sm font-medium text-gray-700 mb-1"
//       >
//         {label}
//       </label>

//       <input
//         id={name}
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         maxLength={maxLength}
//         required={required}
//         min={min}
//         step={step}
//         disabled={disabled}
//         readOnly={readOnly}
//         className={`w-full border border-gray-300 rounded-lg p-3 
//           text-gray-900 placeholder-gray-400 
//           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition 
//           hover:border-indigo-400
//           ${disabled || readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
//           ${className}`}
//       />
//     </div>
//   );
// }




// components/InputField.tsx
import React from 'react';

interface InputFieldProps {
    label?: string;
    name: string;
    type?: string;
    value: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    readOnly?: boolean;
    step?: string;
    min?: string;
    maxLength?: number;
    className?: string;
    icon?: React.ReactNode;
}

export default function InputField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    readOnly = false,
    step,
    min,
    maxLength,
    className = "",
    icon
}: InputFieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    readOnly={readOnly}
                    step={step}
                    min={min}
                    maxLength={maxLength}
                    className={`w-full border-2 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:outline-none transition-all duration-200 ${
                        icon ? 'pl-12 pr-4' : 'px-4'
                    } ${readOnly ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white/50'} ${className}`}
                />
            </div>
        </div>
    );
}