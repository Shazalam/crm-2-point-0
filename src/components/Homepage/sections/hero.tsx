// components/sections/hero.tsx
'use client';

import { motion } from 'framer-motion';
import { Play, ArrowRight, Star, TrendingUp, Users, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [metrics, setMetrics] = useState({
    customers: 0,
    revenue: 0,
    satisfaction: 0,
  });

  useEffect(() => {
    const animateMetrics = () => {
      setMetrics({
        customers: 12500,
        revenue: 45.2,
        satisfaction: 98.7,
      });
    };

    animateMetrics();
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Trusted by 12,500+ businesses worldwide
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
              The CRM That{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Grows With You
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-8 max-w-2xl">
              Streamline your sales, nurture customer relationships, and drive growth with our 
              intelligent CRM platform designed for modern businesses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <motion.a
                href="#signup"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </motion.a>
              
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-slate-300 text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-blue-400 hover:shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </motion.a>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <Users className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-slate-900">
                    {metrics.customers.toLocaleString()}+
                  </span>
                </div>
                <p className="text-sm text-slate-600">Happy Customers</p>
              </div>
              
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-2xl font-bold text-slate-900">
                    ${metrics.revenue}M+
                  </span>
                </div>
                <p className="text-sm text-slate-600">Revenue Generated</p>
              </div>
              
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-2">
                  <Shield className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-2xl font-bold text-slate-900">
                    {metrics.satisfaction}%
                  </span>
                </div>
                <p className="text-sm text-slate-600">Satisfaction Rate</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-200">
              {/* Mock CRM Dashboard */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-sm text-slate-500">BFDS HUB Dashboard</div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Leads', value: '247', change: '+12%' },
                    { label: 'Deals', value: '89', change: '+8%' },
                    { label: 'Revenue', value: '$124K', change: '+23%' },
                    { label: 'Tasks', value: '34', change: '-5%' },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200"
                    >
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-600">{stat.label}</div>
                        <div className={`text-xs font-medium ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Activity Chart */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm font-semibold text-slate-900">Sales Performance</div>
                    <div className="text-xs text-slate-500">Last 7 days</div>
                  </div>
                  <div className="flex items-end justify-between h-20">
                    {[40, 60, 75, 65, 85, 95, 70].map((height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-slate-700">Active Deal</span>
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1">$12,500</div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-slate-200"
            >
              <div className="text-xs text-slate-600">New Lead</div>
              <div className="text-sm font-bold text-slate-900">Acme Corp</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}