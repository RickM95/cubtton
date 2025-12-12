import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-[#0f0f0f]"></div>
          {/* Abstract background elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter">
            <span className="text-gradient">CUBTTON</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 font-light">
            Elevating your digital presence with premium aesthetics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-transform hover:scale-105"
            >
              View Products
            </Link>
            <button className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Featured Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="glass rounded-xl overflow-hidden hover:transform hover:-translate-y-2 transition-all duration-300 group">
              <div className="h-64 bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tr from-purple-500/20 to-blue-500/20 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Placeholder for image */}
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  Project {item} Preview
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Project Title {item}</h3>
                <p className="text-gray-400 text-sm">A brief description of the project and the value it provided.</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
