import React, { useState, useEffect } from 'react';

interface GiftCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (cardData: {
        amount: string;
        giftCode: string;
        expirationDate: string;
        fullName: string;
    }) => void;
    initialCustomerName?: string;
}

const GiftCardModal: React.FC<GiftCardModalProps> = ({ 
    isOpen, 
    onClose, 
    onGenerate,
    initialCustomerName = 'JOHN DOE'
}) => {
    const [amount, setAmount] = useState('');
    const [giftCode, setGiftCode] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [error, setError] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // Generate initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            generateUniqueCode();
            setExpirationDate(calculateExpirationDate());
            setAmount('');
            setError('');
            setIsGenerating(false);
        }
    }, [isOpen]);

    const generateUniqueCode = () => {
        const parts = [];
        for (let i = 0; i < 4; i++) {
            parts.push(Math.floor(1000 + Math.random() * 9000));
        }
        const newCode = parts.join(' ');
        setGiftCode(newCode);
        return newCode;
    };

    const calculateExpirationDate = () => {
        const now = new Date();
        const expiration = new Date(now.setMonth(now.getMonth() + 24));
        return `${String(expiration.getMonth() + 1).padStart(2, '0')}/${expiration.getFullYear()}`;
    };

    const handleGenerateNewCode = () => {
        generateUniqueCode();
    };

    const handleGenerateCard = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount greater than 0');
            return;
        }

        if (!initialCustomerName.trim()) {
            setError('Please enter a customer name');
            return;
        }

        setIsGenerating(true);
        
        // Simulate processing delay for better UX
        await new Promise(resolve => setTimeout(resolve, 800));
        
        onGenerate({
            amount: parseFloat(amount).toFixed(2),
            giftCode,
            expirationDate,
            fullName: initialCustomerName.toUpperCase()
        });

        setIsGenerating(false);
        onClose();
    };

    const handleAmountChange = (value: string) => {
        // Allow only numbers and decimal point
        const validatedValue = value.replace(/[^0-9.]/g, '');
        // Ensure only one decimal point
        const decimalCount = (validatedValue.match(/\./g) || []).length;
        if (decimalCount <= 1) {
            setAmount(validatedValue);
            if (error) setError('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleGenerateCard();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
            {/* Enhanced Backdrop with better touch support */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/40 to-indigo-900/30 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container with responsive sizing */}
            <div className="relative w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl transform transition-all duration-300 scale-100 mx-2">
                {/* Floating Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-20 transform scale-105" />

                {/* Main Modal Card */}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 overflow-hidden max-h-[90vh] overflow-y-auto">
                    {/* Enhanced Header */}
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold text-white">Create Gift Card</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 sm:p-2 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                                aria-label="Close modal"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content with improved responsive layout */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                            {/* Input Section */}
                            <div className="space-y-4 sm:space-y-6">
                                {/* Customer Name */}
                                <div className="space-y-2 sm:space-y-3">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                                        Customer Name
                                    </label>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                                            {initialCustomerName}
                                        </span>
                                    </div>
                                </div>

                                {/* Amount Input */}
                                <div className="space-y-2 sm:space-y-3">
                                    <label htmlFor="amount-input" className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                                        Gift Card Amount ($)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 text-lg">$</span>
                                        </div>
                                        <input
                                            id="amount-input"
                                            type="text"
                                            inputMode="decimal"
                                            value={amount}
                                            onChange={(e) => handleAmountChange(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="0.00"
                                            className="w-full pl-10 pr-4 py-3 text-lg font-medium border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            min="1"
                                            step="0.01"
                                            aria-describedby="amount-error"
                                        />
                                    </div>
                                    {error && (
                                        <div id="amount-error" className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">{error}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Card Details */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Card Details</h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                                Card Number
                                            </label>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <span className="font-mono text-base sm:text-lg font-bold text-blue-800 dark:text-blue-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                                    {giftCode}
                                                </span>
                                                <button
                                                    onClick={handleGenerateNewCode}
                                                    className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-blue-300 dark:border-blue-600 text-blue-500 dark:text-blue-300 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center whitespace-nowrap"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    New Code
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-1">
                                                Expiration Date
                                            </label>
                                            <div className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                                {expirationDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={onClose}
                                        disabled={isGenerating}
                                        className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleGenerateCard}
                                        disabled={!amount || parseFloat(amount) <= 0 || isGenerating}
                                        className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                                    >
                                        {/* Loading overlay */}
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                            </div>
                                        )}
                                        <span className={`flex items-center justify-center ${isGenerating ? 'opacity-0' : 'opacity-100'}`}>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            {isGenerating ? 'Generating...' : 'Generate Gift Card'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Card Preview */}
                            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white p-4 sm:p-6 rounded-2xl relative overflow-hidden min-h-[280px] sm:min-h-[350px] flex flex-col justify-center">
                                {/* Card Chip */}
                                <div className="absolute top-4 sm:top-6 right-4 sm:right-6 w-8 h-6 sm:w-10 sm:h-7 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-md flex items-center justify-center">
                                    <div className="w-6 h-4 sm:w-7 sm:h-5 bg-gradient-to-r from-yellow-300 to-yellow-200 rounded-sm"></div>
                                </div>

                                {/* Card Brand */}
                                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-lg sm:text-xl font-bold text-white/80">TRAVEL PREMIUM</div>

                                {/* Card Number */}
                                <div className="text-lg sm:text-xl font-mono tracking-widest mb-4 sm:mb-6 mt-8 text-center px-2">
                                    {giftCode || '•••• •••• •••• ••••'}
                                </div>

                                {/* Card Details */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-auto gap-3 mb-4.5">
                                    <div className="flex-1">
                                        <div className="text-xs text-white/70 mb-1">CARDHOLDER NAME</div>
                                        <div className="text-sm sm:text-md font-semibold break-words">
                                            {initialCustomerName}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/70 mb-1">EXPIRES</div>
                                        <div className="text-sm sm:text-md font-semibold">{expirationDate}</div>
                                    </div>
                                </div>

                                {/* Amount Display */}
                                <div className="absolute bottom-3 sm:bottom-4 right-4 sm:right-6 text-lg sm:text-xl font-bold text-yellow-300">
                                    ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                                </div>

                                {/* Decorative Elements */}
                                <div className="absolute -bottom-20 -right-20 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full"></div>
                                <div className="absolute -top-20 -left-20 w-32 h-32 sm:w-40 sm:h-40 bg-white/5 rounded-full"></div>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-400 p-3 sm:p-4 rounded">
                            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                                <strong>💳 CARD TERMS:</strong> Valid for 24 months from issue date. 
                                Redeemable for flights, car rentals, and cruise bookings. Non-refundable.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftCardModal;