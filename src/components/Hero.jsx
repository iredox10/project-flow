
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';
import {
  auth,
  db,
  doc,
  getDoc,
} from '../firebase/config'; // Assuming config is two levels up
import { signInWithEmailAndPassword } from 'firebase/auth';

const Hero = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Sign in the user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Get the user's role from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // 3. Redirect based on the user's role
        switch (userData.role) {
          case 'student':
            navigate('/student/dashboard');
            break;
          case 'supervisor':
            navigate('/supervisor/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'super-admin':
            navigate('/super-admin/dashboard');
            break;
          default:
            navigate('/'); // Fallback to home
        }
      } else {
        throw new Error("User role not found.");
      }

    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else {
        setError('Failed to sign in. Please try again.');
      }
      console.error(err);
      setLoading(false);
    }
  };

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
            <form className="space-y-4" onSubmit={handleLogin}>
              {/* Email Input */}
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm text-left">{error}</p>}
              <div className="flex items-center justify-between text-sm">
                <a href="#" className="text-indigo-600 hover:underline">Forgot password?</a>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold transition-colors flex justify-center items-center"
                disabled={loading}
              >
                {loading ? <FiLoader className="animate-spin" /> : 'Sign In'}
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
