import React, { useEffect, useState } from 'react';

const Alert = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
        success: 'bg-green-100/90 dark:bg-green-900/40 text-green-800 dark:text-green-100 border-green-200 dark:border-green-800',
        error: 'bg-red-100/90 dark:bg-red-900/40 text-red-800 dark:text-red-100 border-red-200 dark:border-red-800',
        loading: 'bg-taupe/90 dark:bg-taupe/40 text-brown dark:text-ivory border-taupe/50',
        info: 'bg-blue-100/90 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-800',
    };

    // Modern icons
    const icons = {
        success: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
        ),
        error: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        ),
        loading: (
            <svg className="animate-spin w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ),
        info: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        )
    };

    return (
        <div className={`fixed top-24 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg glass backdrop-blur-md border border-opacity-20 transition-all duration-300 animate-slide-in ${typeStyles[type] || typeStyles.info} min-w-[300px]`}>
            <span className="flex-shrink-0">{icons[type]}</span>
            <p className="font-medium text-sm flex-1">{message}</p>
            <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition">
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    );
};

export default Alert;
