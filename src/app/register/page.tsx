"use client";

import Link from "next/link";
import {  ArrowRight, CheckCircle, User,  Shield } from "lucide-react";
import { motion } from "framer-motion";
import { IoCarSport } from "react-icons/io5";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
 
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
              <div className="w-full max-w-xl bg-white p-2">
                <RegisterForm />
              </div>

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