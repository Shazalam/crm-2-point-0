'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import { FiX, FiDownload, FiMinus, FiPlus } from 'react-icons/fi';

interface ImagePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title?: string;
}

export default function ImagePreviewModal({
    isOpen,
    onClose,
    imageUrl,
    title = 'Image Preview',
}: ImagePreviewModalProps) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    if (!isOpen) return null;

    const handleDownload = () => {
        // Open image in new tab
        window.open(imageUrl, '_blank', 'noopener,noreferrer');
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleResetZoom = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setStartPosition({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - startPosition.x,
                y: e.clientY - startPosition.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const img = e.target as HTMLImageElement;
        setImageDimensions({
            width: img.naturalWidth,
            height: img.naturalHeight
        });
    };

    // Calculate container dimensions based on image aspect ratio
    const getContainerStyle = () => {
        if (imageDimensions.width === 0 || imageDimensions.height === 0) {
            return { minHeight: '400px' };
        }

        const aspectRatio = imageDimensions.width / imageDimensions.height;
        const maxWidth = 1200; // Maximum width for very wide images
        const maxHeight = 800; // Maximum height for very tall images

        if (aspectRatio > 1.5) {
            // Wide image
            return { 
                width: '100%', 
                height: `min(80vh, ${maxHeight}px)`,
                maxWidth: `${maxWidth}px`
            };
        } else if (aspectRatio < 0.67) {
            // Tall image
            return { 
                width: 'auto', 
                height: `min(80vh, ${maxHeight}px)`,
                maxWidth: '100%'
            };
        } else {
            // Balanced aspect ratio
            return { 
                width: 'auto', 
                height: 'auto',
                maxWidth: '100%',
                maxHeight: '80vh'
            };
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            Zoom: {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <FiX className="text-2xl text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Image Preview */}
                <div 
                    ref={containerRef}
                    className="relative w-full flex-1 bg-gray-900 flex justify-center items-center overflow-hidden p-4"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                >
                    <div
                        className="relative transition-transform duration-200 flex items-center justify-center"
                        style={{
                            transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
                            transformOrigin: 'center center',
                            ...getContainerStyle()
                        }}
                    >
                        <Image
                            src={imageUrl}
                            alt="Document Image"
                            width={imageDimensions.width || 800}
                            height={imageDimensions.height || 600}
                            className="object-contain"
                            style={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%'
                            }}
                            onLoad={handleImageLoad}
                            onError={() => {
                                console.error('Failed to load image:', imageUrl);
                                // You can set a fallback image here if needed
                            }}
                            quality={100}
                            priority
                            unoptimized={false} // Let Next.js optimize if possible
                        />
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute right-4 top-4 flex flex-col gap-2 bg-black/50 rounded-lg p-2 backdrop-blur-sm">
                        <button
                            onClick={handleZoomIn}
                            className="p-2 text-white hover:bg-white/20 rounded transition"
                            title="Zoom In"
                        >
                            <FiPlus className="text-xl" />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="p-2 text-white hover:bg-white/20 rounded transition text-sm font-medium"
                            title="Reset Zoom"
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="p-2 text-white hover:bg-white/20 rounded transition"
                            title="Zoom Out"
                        >
                            <FiMinus className="text-xl" />
                        </button>
                    </div>

                    {/* Drag Hint */}
                    {zoom > 1 && !isDragging && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                            Click and drag to pan
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center py-4 px-6 border-t bg-white">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Use mouse wheel to zoom</span>
                        <span>•</span>
                        <span>Click and drag to pan when zoomed</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleResetZoom}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Reset View
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            <FiDownload />
                            Open in New Tab
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}