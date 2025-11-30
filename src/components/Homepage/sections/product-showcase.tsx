// components/sections/product-showcase.tsx
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  CheckCircle,
  ArrowRight 
} from 'lucide-react';

const tabs = [
  { id: 'sales', label: 'Sales Pipeline', icon: Monitor },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone },
  { id: 'analytics', label: 'Analytics', icon: Tablet },
];

const features = [
  'Drag-and-drop pipeline management',
  'Real-time collaboration',
  'Automated lead scoring',
  'Customizable workflows',
  'Integration with 100+ tools',
  'Advanced reporting',
];

export default function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <section id="product" className="py-24 bg-gradient-to-br from-slate-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Built for{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Modern Teams
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience the power of intuitive design and cutting-edge technology 
            that works seamlessly across all your devices.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-800/50 rounded-xl p-1 mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Features List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-slate-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="#demo"
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center space-x-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              <span>View Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-2xl">
              {/* Mock Browser */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="flex-1 bg-slate-700 rounded-lg px-4 py-1">
                  <div className="text-slate-400 text-sm text-center">
                    nexus-crm.com/dashboard
                  </div>
                </div>
              </div>

              {/* Mock Content */}
              <div className="space-y-4">
                {/* Pipeline */}
                <div className="grid grid-cols-4 gap-4">
                  {['New', 'Qualified', 'Proposal', 'Won'].map((stage, index) => (
                    <div key={stage} className="bg-slate-700 rounded-lg p-4">
                      <div className="text-slate-300 text-sm font-medium mb-2">{stage}</div>
                      <div className="text-white text-xl font-bold mb-2">
                        {[12, 8, 5, 3][index]}
                      </div>
                      <div className="h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${[60, 40, 25, 15][index]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activity */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-slate-300 text-sm font-medium mb-3">
                    Recent Activity
                  </div>
                  <div className="space-y-2">
                    {[
                      'New lead from Acme Corp',
                      'Proposal sent to GlobalTech',
                      'Meeting scheduled with InnovateInc',
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <div className="text-slate-400 text-sm">{activity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-4 shadow-lg"
            >
              <div className="text-white text-sm font-semibold">+23%</div>
              <div className="text-cyan-100 text-xs">This month</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}