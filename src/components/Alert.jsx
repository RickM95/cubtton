import React, { useEffect, useState } from 'react';

const Alert = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
        success: 'bg-green-600 text-white border-green-700 shadow-green-900/20',
        error: 'bg-red-600 text-white border-red-700 shadow-red-900/20',
        loading: 'bg-gray-800 text-white border-gray-900 shadow-gray-900/20',
        info: 'bg-blue-600 text-white border-blue-700 shadow-blue-900/20',
    };

    // icons
    const icons = {
        success: (
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
        ),
        error: (
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        ),
        loading: (
            <svg className="animate-spin w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        ),
        info: (
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        )
    };

    return (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[99999] flex items-center gap-4 px-8 py-6 rounded-2xl shadow-2xl transition-all duration-300 animate-slide-in-top border-2 ${typeStyles[type] || typeStyles.info} min-w-[350px] max-w-lg md:min-w-[400px]`}>
            <span className="flex-shrink-0 opacity-100 scale-125">{icons[type]}</span>
            <p className="font-bold text-base md:text-lg flex-1 tracking-wide leading-relaxed">{message}</p>
            <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className="p-2 -mr-2 rounded-full hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    );
};

export default Alert;
