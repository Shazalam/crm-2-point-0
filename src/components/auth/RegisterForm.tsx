// components/auth/RegisterForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastHandler } from "@/lib/hooks/useToastHandler";
import Button from "@/components/Button";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowRight, Phone } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { registerTenantSchema, type RegisterTenantFormValues } from "@/lib/validators/auth.validator";
import { clearRegisterError, registerTenantThunk } from "@/app/store/slices/authSlice";
import { ErrorCode, ErrorMessages } from "@/lib/types";

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { registerLoading, registerError, tenant } = useAppSelector(
    (s) => s.auth
  );
  
  const { handleSuccessToast, handleErrorToast, showLoadingToast, handleDismissToast } =
    useToastHandler();

  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    phoneNumber: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterTenantFormValues>({
    resolver: zodResolver(registerTenantSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const password = watch("password");

  function getPasswordStrength(password: string) {
    if (password.length === 0)
      return { label: "", color: "bg-transparent", width: "w-0", requirements: [] };
    if (password.length < 6)
      return {
        label: "Too short",
        color: "bg-red-500",
        width: "w-1/4",
        requirements: [{ met: false, text: "At least 8 characters" }],
      };

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    const hasMinLength = password.length >= 8;

    const requirements = [
      { met: hasMinLength, text: "At least 8 characters" },
      { met: hasLower, text: "Lowercase letter" },
      { met: hasUpper, text: "Uppercase letter" },
      { met: hasNumber, text: "Number" },
      { met: hasSpecial, text: "Special character (@$!%*?&)" },
    ];

    const strength = requirements.filter((req) => req.met).length;

    if (strength <= 2)
      return {
        label: "Weak",
        color: "bg-red-500",
        width: "w-1/4",
        requirements,
      };
    if (strength === 3)
      return {
        label: "Fair",
        color: "bg-amber-500",
        width: "w-2/4",
        requirements,
      };
    if (strength === 4)
      return {
        label: "Good",
        color: "bg-blue-500",
        width: "w-3/4",
        requirements,
      };
    if (strength === 5)
      return {
        label: "Strong",
        color: "bg-green-500",
        width: "w-full",
        requirements,
      };

    return {
      label: "Weak",
      color: "bg-red-500",
      width: "w-1/4",
      requirements,
    };
  }
  
  const passwordStrength = useMemo(
    () => getPasswordStrength(password || ""),
    [password]
  );

  // ✅ Handle success
  useEffect(() => {
    console.log("tenant -", tenant)
    if (tenant) {
      handleSuccessToast("Account created! Please verify your email.");
      router.push(`/verify-email?email=${encodeURIComponent(tenant.email)}`);
    }
  }, [tenant, router, handleSuccessToast]);

  // ✅ Handle error with proper message mapping
  useEffect(() => {
    if (registerError) {
      const code = registerError.code as ErrorCode;

      const message =
        (Object.values(ErrorCode).includes(code) && ErrorMessages[code]) ||
        registerError.message;

      handleErrorToast(message);
      dispatch(clearRegisterError());
    }
  }, [registerError, dispatch, handleErrorToast]);

  async function onSubmit(values: RegisterTenantFormValues) {
    const strength = getPasswordStrength(values.password);
    if (strength.label === "Too short" || strength.label === "Weak") {
      handleErrorToast("Please use a stronger password");
      return;
    }

    const toastId = showLoadingToast("Creating account...");

    const resultAction = await dispatch(registerTenantThunk(values));

    handleDismissToast(toastId);

    if (registerTenantThunk.rejected.match(resultAction)) {
      return
      // const payload = resultAction.payload as any;
      // const message =
      //   payload?.error ||
      //   payload?.message ||
      //   "Registration failed. Please try again.";
      // handleErrorToast(message);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Full Name */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Full Name
        </label>
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            className={`w-full border-2 ${isFocused.name
              ? "border-blue-500 ring-4 ring-blue-100 bg-white"
              : "border-slate-200 bg-slate-50/50"
              } rounded-xl p-4 pl-12 placeholder-slate-400 text-slate-700 outline-none transition-all duration-300 text-lg font-medium`}
            placeholder="Enter business name"
            {...register("name")}
            onFocus={() => setIsFocused((prev) => ({ ...prev, name: true }))}
            onBlur={() => setIsFocused((prev) => ({ ...prev, name: false }))}
          />
        </motion.div>
        {errors.name && (
          <p className="text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Email Address
        </label>
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="email"
            className={`w-full border-2 ${isFocused.email
              ? "border-blue-500 ring-4 ring-blue-100 bg-white"
              : "border-slate-200 bg-slate-50/50"
              } rounded-xl p-4 pl-12 placeholder-slate-400 text-slate-700 outline-none transition-all duration-300 text-lg font-medium`}
            placeholder="your@company.com"
            {...register("email")}
            onFocus={() => setIsFocused((prev) => ({ ...prev, email: true }))}
            onBlur={() => setIsFocused((prev) => ({ ...prev, email: false }))}
          />
        </motion.div>
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      {/* Phone Number */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Phone Number
        </label>

        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />

          <input
            type="tel"
            className={`w-full border-2 ${isFocused.phoneNumber
                ? "border-blue-500 ring-4 ring-blue-100 bg-white"
                : "border-slate-200 bg-slate-50/50"
              } rounded-xl p-4 pl-12 placeholder-slate-400 text-slate-700 outline-none transition-all duration-300 text-lg font-medium`}
            placeholder="98765 43210"
            {...register("phoneNumber")}
            onFocus={() => setIsFocused((prev) => ({ ...prev, phoneNumber: true }))}
            onBlur={() => setIsFocused((prev) => ({ ...prev, phoneNumber: false }))}
          />
        </motion.div>

        {errors.phoneNumber && (
          <p className="text-xs text-red-600">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <motion.div whileFocus={{ scale: 1.02 }} className="relative">
          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            className={`w-full border-2 ${isFocused.password
              ? "border-blue-500 ring-4 ring-blue-100 bg-white"
              : "border-slate-200 bg-slate-50/50"
              } rounded-xl p-4 pl-12 pr-12 placeholder-slate-400 text-slate-700 outline-none transition-all duration-300 text-lg font-medium`}
            placeholder="Create a strong password"
            {...register("password")}
            onFocus={() =>
              setIsFocused((prev) => ({ ...prev, password: true }))
            }
            onBlur={() =>
              setIsFocused((prev) => ({ ...prev, password: false }))
            }
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={showPassword ? "show" : "hide"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </motion.div>
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}

        {/* Strength meter */}
        {password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                Password strength
              </span>
              <span
                className={`text-sm font-semibold ${passwordStrength.label === "Strong"
                  ? "text-green-600"
                  : passwordStrength.label === "Good"
                    ? "text-blue-600"
                    : passwordStrength.label === "Fair"
                      ? "text-amber-600"
                      : "text-red-600"
                  }`}
              >
                {passwordStrength.label}
              </span>
            </div>

            <div className="mt-3 space-y-1">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.width}`}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              {passwordStrength.requirements.map((req, index) => (
                <motion.div
                  key={req.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  {req.met ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`text-xs ${req.met ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    {req.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Submit */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="pt-4"
      >
        <Button
          type="submit"
          loading={registerLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <span>Creating Account...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Create Account</span>
              <ArrowRight size={20} />
            </div>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}