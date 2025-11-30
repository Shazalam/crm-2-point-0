// components/sections/features.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Zap, 
  Shield,
  MessageSquare,
  Workflow
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Sales Analytics',
    description: 'Real-time insights and predictive analytics to drive your sales strategy and maximize revenue.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Contact Management',
    description: 'Centralize all customer interactions and build lasting relationships with intelligent contact management.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Automation',
    description: 'Automate repetitive tasks and workflows to focus on what matters most - closing deals.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level security with end-to-end encryption to protect your valuable customer data.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: MessageSquare,
    title: 'Communication Hub',
    description: 'Unified communication across email, phone, and social media with built-in tracking.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Workflow,
    title: 'Workflow Builder',
    description: 'Drag-and-drop workflow builder to customize processes that match your business needs.',
    color: 'from-rose-500 to-red-500',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Powerful features designed to streamline your sales process, enhance customer relationships, 
            and drive business growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}