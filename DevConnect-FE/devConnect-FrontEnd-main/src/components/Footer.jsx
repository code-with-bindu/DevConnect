import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 py-6 mt-auto shadow-inner">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm md:text-base">
          &copy; {new Date().getFullYear()} DevTinder. All rights reserved.
        </p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-gray-100 transition duration-200">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-100 transition duration-200">
            Terms of Service
          </a>
          <a href="#" className="hover:text-gray-100 transition duration-200">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
