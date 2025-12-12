import React, { createContext, useContext, useState, useCallback } from 'react';
import Alert from '../components/Alert';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState(null);

    /**
     * Show an alert message.
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', 'loading', 'info'.
     * @param {number} duration - Time in ms before auto-close (default 3000ms).
     */
    const showAlert = useCallback((message, type = 'info', duration = 3000) => {
        setAlert({ message, type, duration, id: Date.now() });
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(null);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alert && (
                <Alert
                    key={alert.id}
                    message={alert.message}
                    type={alert.type}
                    duration={alert.duration}
                    onClose={hideAlert}
                />
            )}
        </AlertContext.Provider>
    );
};
