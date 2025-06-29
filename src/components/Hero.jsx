
/*
 * ===============================================================
 * FILE: src/components/Hero.jsx
 * ===============================================================
 * This is the main Hero component that includes a login
 * form directly in the hero section for quick access.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';

const Hero = () => {
  return (
    <section className="text-center pt-32 pb-20 md:pt-40 md:pb-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Headline and Description */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Streamline Your Academic Projects
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl">
              From proposal to final submission, Projeckt provides a seamless platform for students and supervisors to collaborate effectively.
            </p>
          </div>

          {/* Right Side: Login Form Card */}
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Sign In or Get Started</h2>
              <p className="text-gray-500 mt-1">Access your dashboard now.</p>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Email Input */}
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              {/* Password Input */}
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <a href="#" className="text-indigo-600 hover:underline">Forgot password?</a>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition-colors">
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center justify-center space-x-2">
              <span className="h-px bg-gray-300 w-full"></span>
              <span className="text-gray-500 text-sm">OR</span>
              <span className="h-px bg-gray-300 w-full"></span>
            </div>

            {/* Link to Sign Up Page */}
            <Link to="/signup" className="block w-full text-center py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 font-semibold transition-colors">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
