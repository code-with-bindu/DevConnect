import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-400 py-12 md:py-16 mt-auto">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧑‍💻</span>
              <span className="font-display font-bold text-xl bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                DevConnect
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              Connect with developers, share ideas, and build amazing projects together.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Discover
                </Link>
              </li>
              <li>
                <Link to="/user/connections" className="hover:text-primary-400 transition-colors">
                  Connections
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-primary-400 transition-colors">
                  Messages
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
            <p>&copy; {year} DevConnect. All rights reserved.</p>
            <p className="mt-4 md:mt-0">
              Made with <span className="text-primary-500">❤️</span> for developers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
