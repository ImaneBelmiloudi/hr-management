import React from 'react';
import { FiHeart } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 w-full">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <span>© {currentYear} HR Management. All rights reserved.</span>
          </div>
          
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <span>Made with</span>
            <FiHeart className="h-4 w-4 text-red-500" />
            <span>by Your Company</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
