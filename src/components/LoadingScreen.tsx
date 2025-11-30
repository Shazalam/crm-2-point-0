"use client";

export default function LoadingScreen() {
  return (
    // <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors p-4">

    //   {/* Main Container with Floating Animation */}
    //   <motion.div
    //     initial={{ opacity: 0, scale: 0.9 }}
    //     animate={{ opacity: 1, scale: 1 }}
    //     transition={{ duration: 0.5 }}
    //     className="text-center max-w-md w-full"
    //   >

    //     {/* Animated Logo Container */}
    //     <motion.div
    //       className="relative mb-8"
    //     >
    //       {/* Outer Glow Effect */}
    //       <motion.div
    //         animate={{
    //           scale: [1, 1.1, 1],
    //           opacity: [0.3, 0.6, 0.3],
    //         }}
    //         transition={{
    //           duration: 2,
    //           repeat: Infinity,
    //           ease: "easeInOut"
    //         }}
    //         className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
    //       />

    //       {/* Car Icon with Multiple Animations */}
    //       <motion.div
    //         className="relative z-10 mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl"
    //         animate={{
    //           y: [0, -10, 0],
    //           rotateY: [0, 180, 360],
    //         }}
    //         transition={{
    //           y: {
    //             duration: 2,
    //             repeat: Infinity,
    //             ease: "easeInOut"
    //           },
    //           rotateY: {
    //             duration: 4,
    //             repeat: Infinity,
    //             ease: "easeInOut"
    //           }
    //         }}
    //       >
    //         <IoCarSport className="text-white text-4xl" />
    //       </motion.div>

    //       {/* Floating Road Lines */}
    //       {[1, 2, 3].map((item) => (
    //         <motion.div
    //           key={item}
    //           className="absolute w-4 h-1 bg-blue-300 rounded-full"
    //           animate={{
    //             x: [-100, 100],
    //             opacity: [0, 1, 0],
    //           }}
    //           transition={{
    //             duration: 1.5,
    //             repeat: Infinity,
    //             delay: item * 0.5,
    //             ease: "linear"
    //           }}
    //           style={{
    //             top: `${60 + item * 10}%`,
    //           }}
    //         />
    //       ))}
    //     </motion.div>

    //     {/* Progress Bar Container */}
    //     <div className="mb-8">
    //       {/* Animated Progress Bar */}
    //       <div className="w-full bg-gray-200 rounded-full h-2 mb-4 dark:bg-gray-700 overflow-hidden">
    //         <motion.div
    //           className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
    //           initial={{ width: "0%" }}
    //           animate={{ width: "100%" }}
    //           transition={{
    //             duration: 2,
    //             repeat: Infinity,
    //             ease: "easeInOut",
    //             repeatType: "reverse"
    //           }}
    //         />
    //       </div>

    //       {/* Percentage Text */}
    //       <motion.div
    //         className="text-sm text-gray-600 dark:text-gray-400 font-medium"
    //         animate={{ opacity: [0.5, 1, 0.5] }}
    //         transition={{ duration: 1.5, repeat: Infinity }}
    //       >
    //         <motion.span
    //           animate={{ opacity: [1, 0.7, 1] }}
    //           transition={{ duration: 2, repeat: Infinity }}
    //         >
    //           Preparing your rental experience...
    //         </motion.span>
    //       </motion.div>
    //     </div>

    //     {/* Main Loading Text */}
    //     <motion.h2
    //       className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4"
    //       animate={{ opacity: [0.8, 1, 0.8] }}
    //       transition={{ duration: 2, repeat: Infinity }}
    //     >
    //       BFDS HUB
    //     </motion.h2>

    //     {/* Subtitle with Typing Effect */}
    //     <motion.p
    //       className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-8 leading-relaxed"
    //       initial={{ opacity: 0 }}
    //       animate={{ opacity: 1 }}
    //       transition={{ delay: 0.5 }}
    //     >
    //       Premium Car Rentals
    //     </motion.p>

    //     {/* Features Grid */}
    //     <motion.div
    //       className="grid grid-cols-3 gap-4 mb-8"
    //       initial={{ opacity: 0, y: 20 }}
    //       animate={{ opacity: 1, y: 0 }}
    //       transition={{ delay: 0.8 }}
    //     >
    //       {[
    //         { icon: IoLocation, text: "Multiple Locations", color: "text-blue-500" },
    //         { icon: IoTime, text: "24/7 Service", color: "text-green-500" },
    //         { icon: IoShieldCheckmark, text: "Fully Insured", color: "text-purple-500" }
    //       ].map((feature, index) => (
    //         <motion.div
    //           key={index}
    //           className="flex flex-col items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
    //           whileHover={{ scale: 1.05 }}
    //           animate={{ 
    //             y: [0, -5, 0],
    //             opacity: [0.7, 1, 0.7]
    //           }}
    //           transition={{
    //             y: {
    //               duration: 2,
    //               repeat: Infinity,
    //               delay: index * 0.3
    //             },
    //             opacity: {
    //               duration: 2,
    //               repeat: Infinity,
    //               delay: index * 0.3
    //             }
    //           }}
    //         >
    //           <feature.icon className={`text-xl mb-2 ${feature.color}`} />
    //           <span className="text-xs text-gray-600 dark:text-gray-300 text-center">{feature.text}</span>
    //         </motion.div>
    //       ))}
    //     </motion.div>

    //     {/* Dots Animation */}
    //     <div className="flex justify-center space-x-2 mb-6">
    //       {[1, 2, 3].map((dot) => (
    //         <motion.div
    //           key={dot}
    //           className="w-2 h-2 bg-blue-500 rounded-full"
    //           animate={{
    //             scale: [1, 1.5, 1],
    //             opacity: [0.5, 1, 0.5],
    //           }}
    //           transition={{
    //             duration: 1,
    //             repeat: Infinity,
    //             delay: dot * 0.2,
    //           }}
    //         />
    //       ))}
    //     </div>

    //     {/* Status Messages */}
    //     <motion.div
    //       className="text-xs text-gray-500 dark:text-gray-400 space-y-1"
    //       initial={{ opacity: 0 }}
    //       animate={{ opacity: 1 }}
    //       transition={{ delay: 1 }}
    //     >
    //       <motion.div
    //         animate={{ opacity: [0.5, 1, 0.5] }}
    //         transition={{ duration: 3, repeat: Infinity }}
    //         className="flex items-center justify-center space-x-2"
    //       >
    //         <IoShieldCheckmark className="text-green-500" />
    //         <span>Checking vehicle availability</span>
    //       </motion.div>
    //       <motion.div
    //         animate={{ opacity: [0.5, 1, 0.5] }}
    //         transition={{ duration: 3, repeat: Infinity, delay: 1 }}
    //         className="flex items-center justify-center space-x-2"
    //       >
    //         <IoLocation className="text-blue-500" />
    //         <span>Locating nearest rental station</span>
    //       </motion.div>
    //       <motion.div
    //         animate={{ opacity: [0.5, 1, 0.5] }}
    //         transition={{ duration: 3, repeat: Infinity, delay: 2 }}
    //         className="flex items-center justify-center space-x-2"
    //       >
    //         <IoTime className="text-purple-500" />
    //         <span>Finalizing your reservation</span>
    //       </motion.div>
    //     </motion.div>
    //   </motion.div>

    //   {/* Footer Note */}
    //   <motion.div
    //     className="absolute bottom-8 text-center"
    //     initial={{ opacity: 0 }}
    //     animate={{ opacity: 1 }}
    //     transition={{ delay: 1.5 }}
    //   >
    //     <p className="text-xs text-gray-400 dark:text-gray-500">
    //       Driving your journey forward
    //     </p>
    //   </motion.div>

    //   {/* Road Animation at Bottom */}
    //   <motion.div
    //     className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
    //     animate={{
    //       opacity: [0.3, 0.7, 0.3],
    //     }}
    //     transition={{
    //       duration: 2,
    //       repeat: Infinity,
    //     }}
    //   />
    // </div>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}