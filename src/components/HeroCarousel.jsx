import React, { useState, useEffect } from 'react';
import { contentService } from '../services/contentService';

const HeroCarousel = () => {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const data = await contentService.getSlides();
                setSlides(data || []);
            } catch (error) {
                console.error("Failed to load carousel slides:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 5000); 

        return () => clearInterval(interval);
    }, [slides]);

    
    if (loading || slides.length === 0) return null;

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-ivory/80 dark:bg-[#3D3530]/70 z-10 transition-colors duration-1000"></div>

            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={slide.image_url}
                        alt={slide.title || 'Carousel Slide'}
                        className="w-full h-full object-cover object-center"
                    />
                </div>
            ))}
        </div>
    );
};

export default HeroCarousel;
