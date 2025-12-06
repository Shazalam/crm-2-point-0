"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, CheckCircle, XCircle, User, Mail, Lock, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingButton from "@/components/LoadingButton";
import { IoCarSport } from "react-icons/io5";
import { useToastHandler } from "@/lib/hooks/useToastHandler";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ name: false, email: false, password: false });
  const {handleSuccessToast, handleErrorToast, showLoadingToast, handleDismissToast} = useToastHandler()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    const strength = getPasswordStrength(password);
    if (strength.label === "Too short" || strength.label === "Weak") {
      handleErrorToast("Please use a stronger password");
      return;
    }

    const toastId = showLoadingToast("Creating account...");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        handleSuccessToast("Account created successfully! Please log in.", toastId);
        router.push("/login");
      } else {
        handleErrorToast(data.error || "Something went wrong", toastId);
      }
    } catch {
      // ✅ removed unused 'error' variable
      handleErrorToast("Network error. Please try again.");
    } finally {
      handleDismissToast(toastId);
      setLoading(false);
    }
  }

  function getPasswordStrength(password: string) {
    if (password.length === 0) return { label: "", color: "bg-transparent", width: "w-0", requirements: [] };
    if (password.length < 6) return {
      label: "Too short",
      color: "bg-red-500",
      width: "w-1/4",
      requirements: [{ met: false, text: "At least 8 characters" }]
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
      { met: hasSpecial, text: "Special character (@$!%*?&)" }
    ];

    const strength = requirements.filter(req => req.met).length;

    if (strength <= 2) return {
      label: "Weak",
      color: "bg-red-500",
      width: "w-1/4",
      requirements
    };
    if (strength === 3) return {
      label: "Fair",
      color: "bg-amber-500",
      width: "w-2/4",
      requirements
    };
    if (strength === 4) return {
      label: "Good",
      color: "bg-blue-500",
      width: "w-3/4",
      requirements
    };
    if (strength === 5) return {
      label: "Strong",
      color: "bg-green-500",
      width: "w-full",
      requirements
    };

    return {
      label: "Weak",
      color: "bg-red-500",
      width: "w-1/4",
      requirements
    };
  }

  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 xl:p-20 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          {/* Mobile Brand */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">CR</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">BFDS HUB</h1>
                <p className="text-slate-600 text-sm">Enterprise Grade CRM</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900">
                  Create Account
                </h2>
                <p className="text-slate-600 mt-2">
                  Join thousands of professionals using BFDS HUB
                </p>
              </div>

              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                onSubmit={handleRegister}
                className="space-y-6"
              >
                {/* Name Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      className={`w-full border-2 ${isFocused.name
                        ? 'border-blue-500 ring-4 ring-blue-100 bg-white'
                        : 'border-slate-200 bg-slate-50/50'
                        } rounded-xl p-4 pl-12 placeholder-slate-400 text-slate-700 outline-none transition-all duration-300 text-lg font-medium`}
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setIsFocused(prev => ({ ...prev, name: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, name: false }))}
                      required
                    />
                  </motion.div>
                </div>

                {/* Email Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      className={`w-full border-2 ${isFocused.email
                        ? 'border-blue-500 ring-4 ring-blue-100 bg-white'
                        : 'border-slate-200 bg-slate-50/50'
                        } rounded-xl p-4 pl-12 placeholder-slate-400 text-slate-700 outline-none transition-all duration-300 text-lg font-medium`}
                      placeholder="your@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                      required
                    />
                  </motion.div>
                </div>

                {/* Password Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.02 }}
                    className="relative"
                  >
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full border-2 ${isFocused.password
                        ? 'border-blue-500 ring-4 ring-blue-100 bg-white'
                        : 'border-slate-200 bg-slate-50/50'
                        } rounded-xl p-4 pl-12 pr-12 placeholder-slate-400 text-slate-700 outline-none transition-all duration-300 text-lg font-medium`}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                      onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                      required
                    />
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={showPassword ? 'show' : 'hide'}
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

                  {/* Password Strength Meter */}
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
                        <span className={`text-sm font-semibold ${passwordStrength.label === "Strong" ? "text-green-600" :
                          passwordStrength.label === "Good" ? "text-blue-600" :
                            passwordStrength.label === "Fair" ? "text-amber-600" : "text-red-600"
                          }`}>
                          {passwordStrength.label}
                        </span>
                      </div>

                      {/* ✅ Password Strength Meter */}
                      {password && (
                        <div className="mt-3 space-y-1">
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${passwordStrength.color} ${passwordStrength.width}`}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Password Requirements */}
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
                            <span className={`text-xs ${req.met ? "text-green-600" : "text-red-600"
                              }`}>
                              {req.text}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Submit Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>Create Account</span>
                        <ArrowRight size={20} />
                      </div>
                    )}
                  </LoadingButton>
                </motion.div>
              </motion.form>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-4 text-slate-500 text-sm font-medium">Or</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center"
              >
                <p className="text-slate-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-blue-600 font-bold hover:text-blue-500 transition-colors duration-200 inline-flex items-center space-x-1 group"
                  >
                    <span>Sign in now</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-900 to-blue-900 relative overflow-hidden order-1 lg:order-2">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative flex flex-col justify-center px-12 xl:px-24 py-12 w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center space-x-3 mb-8"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-2xl">
                {/* <span className="text-white font-bold text-xl">CR</span> */}
                <IoCarSport className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">BFDS HUB</h1>
                <p className="text-cyan-200 text-sm">Enterprise Grade CRM</p>
              </div>
            </motion.div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Start Your{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>

            <p className="text-xl text-slate-300 mb-12">
              Join thousands of professionals who trust BFDS HUB to power their sales and customer relationships.
            </p>

            {/* Features List */}
            <div className="space-y-6 mb-12">
              {[
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  description: "Bank-level encryption and secure data handling"
                },
                {
                  icon: User,
                  title: "Professional Dashboard",
                  description: "Intuitive interface designed for sales professionals"
                },
                {
                  icon: CheckCircle,
                  title: "Free 14-Day Trial",
                  description: "Full access to all features, no credit card required"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <div>
                  <div className="text-white font-semibold">Join 12,500+ Professionals</div>
                  <div className="text-cyan-200 text-sm">Trusted by businesses worldwide</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}