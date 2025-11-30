// components/Navbar.tsx
"use client";

import { logoutUser} from "@/app/store/slices/authSlice";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiLogOut,
  FiUser,
  FiEdit3,
  FiXCircle,
  FiMenu,
  FiChevronDown,
  FiBell
} from "react-icons/fi";
import { IoCarSport } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { useToastHandler } from "@/lib/utils/hooks/useToastHandler";


export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showLoadingToast, handleSuccessToast, handleErrorToast } = useToastHandler()

  // Select auth state from redux
  const { user } = useAppSelector((s) => s.auth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  // 3) Logout handler using thunk so redux stays consistent
  const handleLogout = useCallback(async () => {
    const toastId = showLoadingToast('Signing out...');
    try {
      await dispatch(logoutUser()).unwrap();
      handleSuccessToast('Signed out successfully ✅', toastId);
      router.replace('/login');
    } catch (err) {
      handleErrorToast(String(err) || 'Sign out failed ❌', toastId);
    }
  }, [dispatch, router,showLoadingToast,handleErrorToast,handleSuccessToast]);


    // Don't render navbar on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";
  
  if (isAuthPage) return null;

  const navItems = [
    {
      href: "/bookings/new",
      icon: FiPlus,
      label: "New Booking",
      gradient: "from-blue-600 to-cyan-500",
      mobileLabel: "New Booking"
    },
    {
      href: "/bookings/modification",
      icon: FiEdit3,
      label: "Modification",
      gradient: "from-amber-500 to-orange-500",
      mobileLabel: "Modify"
    },
    {
      href: "/bookings/cancellation",
      icon: FiXCircle,
      label: "Cancellation",
      gradient: "from-rose-500 to-red-500",
      mobileLabel: "Cancel"
    }
  ];

  const userMenuItems = [
    {
      href: "/dashboard",
      icon: FiUser,
      label: "Your Profile",
    },
    // {
    //   href: "/dashboard",
    //   icon: FiSettings,
    //   label: "Settings",
    // },
    // {
    //   href: "/dashboard",
    //   icon: FiHelpCircle,
    //   label: "Help & Support",
    // },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                {/* <span className="text-white font-bold text-sm">CR</span> */}
                <IoCarSport className="w-10 h-10 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  BFDS HUB
                </span>
                <span className="text-xs text-slate-500 -mt-1">Business Hub</span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`bg-gradient-to-r ${item.gradient} text-white px-4 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2 group relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <item.icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Bar - Desktop */}
            {/* <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 w-64"
                />
              </div>
            </motion.div> */}

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-slate-600 hover:text-blue-600 transition-colors duration-200"
            >
              <FiBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </motion.button>

            {/* User Menu */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50/80 transition-all duration-200 border border-transparent hover:border-slate-200"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900 text-left">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 text-left">{user.email}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                      {user.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <FiUser className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </div>
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      {userMenuItems.map((item, index) => (
                        <motion.div
                          key={item.href}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={item.href}
                            className="flex items-center px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200 group"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <item.icon className="w-4 h-4 mr-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}

                      {/* Divider */}
                      <div className="border-t border-slate-100 my-1"></div>

                      {/* Logout */}
                      <motion.button
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout?.();
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50/50 transition-all duration-200 group cursor-pointer"
                      >
                        <FiLogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        Sign out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors duration-200"
            >
              <FiMenu className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-lg overflow-hidden"
            >
              <div className="py-4 space-y-3">
                {/* Mobile Search */}
                {/* <div className="px-4">
                  <div className="relative">
                    <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200"
                    />
                  </div>
                </div> */}

                {/* Mobile Nav Items */}
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 mx-4 px-4 py-3 bg-gradient-to-r ${item.gradient} text-white rounded-xl font-semibold transition-all duration-200 active:scale-95`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.mobileLabel}</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile User Menu */}
                {user && (
                  <div className="px-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50/50 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center shadow">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <FiUser className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-sm text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Mobile User Links */}
                    <div className="mt-3 space-y-1">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-3 px-4 py-3 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout?.();
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50/50 rounded-lg transition-all duration-200 cursor-pointer"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}