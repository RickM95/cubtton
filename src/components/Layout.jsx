import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-ivory dark:bg-ivory text-brown dark:text-brown font-sans transition-colors">
      <Navbar />
      <Sidebar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
      <footer className="py-12 text-center text-brown/60 dark:text-brown/80 text-sm border-t border-brown/20 dark:border-brown/30 transition-colors">
        <p>&copy; {new Date().getFullYear()} Cubtton. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
