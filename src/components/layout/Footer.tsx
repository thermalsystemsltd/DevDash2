import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>© {new Date().getFullYear()} </span>
            <a 
              href="https://thermal-systems.co.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Thermal Systems Ltd
            </a>
            <span> - All rights reserved</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}