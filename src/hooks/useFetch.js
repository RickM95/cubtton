import { useState, useEffect, useCallback } from 'react';

// hook
// gets data
const useFetch = (url, options = {}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        // If no URL is provided, we can't fetch. 
        // This allows the hook to be used conditionally or initialized without a URL.
        if (!url) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [url, JSON.stringify(options)]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = () => {
        fetchData();
    };

    return { data, loading, error, refetch };
};

export default useFetch;
