// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";

// interface VehicleSelectorProps {
//   value: string; // current vehicleImage (Cloudinary URL)
//   onChange: (url: string) => void; // callback when vehicleImage changes
// }

// export default function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
//   const [preview, setPreview] = useState(value || "");
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     if (value !== "") setPreview(value);
//   }, [value]);

//   async function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
//     const items = e.clipboardData.items;
//     for (const item of items) {
//       if (item.type.startsWith("image/")) {
//         const file = item.getAsFile();
//         if (file) {
//           // ✅ Instant local preview
//           const localUrl = URL.createObjectURL(file);
//           setPreview(localUrl);

//           setUploading(true);

//           const formData = new FormData();
//           formData.append("file", file);

//           try {
//             const res = await fetch("/api/upload", {
//               method: "POST",
//               body: formData,
//             });

//             const data = await res.json();
//             if (data.success) {
//               const url = data.result.secure_url;
//               setPreview(url); // replace local preview with Cloudinary URL
//               onChange(url);   // notify parent
//             } else {
//               console.error("Upload failed:", data.error);
//             }
//           } catch (err) {
//             console.error("Upload error:", err);
//           }

//           setUploading(false);
//         }
//       }
//     }
//   }

//   return (
//     <div className="md:col-span-2 relative">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Vehicle Image (Paste from clipboard)
//       </label>
//       <input
//         type="text"
//         onPaste={handlePaste}
//         placeholder="Click here and press Ctrl+V to paste an image"
//         className="w-full border border-gray-300 rounded-lg p-3 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition hover:border-indigo-400"
//       />

//       {uploading && <p className="text-sm text-blue-500 mt-2">Uploading...</p>}

//       {preview && (
//         <div className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 shadow-xl overflow-hidden transition hover:shadow-2xl">
//           <div className="flex flex-col items-center p-6">
//             <div className="relative w-full max-w-md h-64 flex items-center justify-center bg-white rounded-xl border border-gray-200 shadow-md">
//               <Image
//                 src={preview}
//                 alt="Vehicle"
//                 fill
//                 className="object-contain p-4"
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Copy, CheckCircle, AlertCircle, Car } from "lucide-react";

interface VehicleSelectorProps {
  value: string; // current vehicleImage (Cloudinary URL)
  onChange: (url: string) => void; // callback when vehicleImage changes
}

export default function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (value !== "") setPreview(value);
  }, [value]);

  const handleCopyUrl = async () => {
    if (!preview) return;
    
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  async function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const items = e.clipboardData.items;
    setError("");
    
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          // Validate file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
          }

          // Validate file type
          if (!file.type.startsWith("image/")) {
            setError("Please paste an image file");
            return;
          }

          // ✅ Instant local preview
          const localUrl = URL.createObjectURL(file);
          setPreview(localUrl);

          setUploading(true);

          const formData = new FormData();
          formData.append("file", file);

          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();
            if (data.success) {
              const url = data.result.secure_url;
              setPreview(url); // replace local preview with Cloudinary URL
              onChange(url);   // notify parent
            } else {
              setError(data.error || "Upload failed");
              console.error("Upload failed:", data.error);
            }
          } catch (err) {
            setError("Upload error. Please try again.");
            console.error("Upload error:", err);
          }

          setUploading(false);
        }
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file
      if (!file.type.startsWith("image/")) {
        setError("Please drop an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      // ✅ Instant local preview
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);

      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          const url = data.result.secure_url;
          setPreview(url);
          onChange(url);
        } else {
          setError(data.error || "Upload failed");
        }
      } catch (err) {
        console.log("error =>", err)
        setError("Upload error. Please try again.");
      }

      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-lg font-bold text-slate-800 mb-2">
            Vehicle Image
          </label>
          <p className="text-slate-600 text-sm">
            Paste an image or drag & drop to upload
          </p>
        </div>
        
        {preview && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyUrl}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-all duration-200"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? "Copied!" : "Copy URL"}</span>
          </motion.button>
        )}
      </div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group"
        >
          <input
            type="text"
            onPaste={handlePaste}
            placeholder="Click here and press Ctrl+V to paste an image, or drag & drop"
            className="w-full bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl p-4 text-slate-700 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 text-center cursor-pointer"
          />
          
          <div className="mt-4 flex flex-col items-center space-y-3">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-sm text-slate-600">
              <p>Supported formats: JPEG, PNG, WebP</p>
              <p>Max file size: 5MB</p>
            </div>
          </div>
        </div>

        {/* Uploading Indicator */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-700 font-medium">Uploading image...</p>
                <p className="text-slate-500 text-sm mt-1">Please wait</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Section */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Preview</h3>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Image uploaded successfully</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="relative w-full max-w-2xl mx-auto h-80 bg-white rounded-xl border-2 border-slate-200 shadow-inner overflow-hidden group">
                  <Image
                    src={preview}
                    alt="Vehicle preview"
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    onError={() => setError("Failed to load image")}
                  />
                  
                  {/* Image Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4" />
                        <span>Vehicle Image</span>
                      </div>
                      <button
                        onClick={handleCopyUrl}
                        className="flex items-center space-x-1 text-blue-300 hover:text-white transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span className="text-xs">Copy URL</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* URL Preview */}
                {/* <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={preview}
                      readOnly
                      className="flex-1 bg-slate-100 border border-slate-300 rounded-lg p-3 text-slate-600 text-sm font-mono truncate"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyUrl}
                      className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {!preview && !uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              No vehicle image selected
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Paste an image from clipboard or drag & drop a vehicle image to get started
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}