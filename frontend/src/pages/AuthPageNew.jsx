import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, Phone, User, ArrowRight, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const AuthPage = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await axios.post('http://localhost:4000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Welcome back to NeuraRise! 🚀');
        window.location.href = '/dashboard';
      } else if (mode === 'register') {
        const response = await axios.post('http://localhost:4000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        if (response.data.requiresOtp) {
          setMode('otp');
          toast.success('OTP sent to your phone! 📱');
        } else {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success('Welcome to NeuraRise! 🎉');
          window.location.href = '/onboarding';
        }
      } else if (mode === 'otp') {
        const response = await axios.post('http://localhost:4000/api/auth/verify-otp', {
          phone: formData.phone,
          otp: formData.otp
        });
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Phone verified! Let\'s get started! 🎊');
        window.location.href = '/onboarding';
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-premium flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neura-emerald rounded-full opacity-20"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center mb-4"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-12 h-12 text-neura-gold" />
          </motion.div>
          <h1 className="text-5xl font-bold mb-2 neura-gradient-text">
            NeuraRise
          </h1>
          <p className="text-neura-gray text-lg">
            Transform Your Habits, Transform Your Life
          </p>
        </div>

        {/* Auth Card */}
        <motion.div
          className="neura-card p-8"
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex justify-center mb-6 space-x-4">
            <button
              onClick={() => setMode('login')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-neura text-white'
                  : 'text-neura-gray hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                mode === 'register' || mode === 'otp'
                  ? 'bg-gradient-neura text-white'
                  : 'text-neura-gray hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neura-gray-dark w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  required
                  className="neura-input pl-12"
                />
              </motion.div>
            )}

            {mode !== 'otp' && (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neura-gray-dark w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                    required
                    className="neura-input pl-12"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neura-gray-dark w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    required
                    className="neura-input pl-12"
                  />
                </div>
              </>
            )}

            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neura-gray-dark w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number (Optional)"
                  className="neura-input pl-12"
                />
              </motion.div>
            )}

            {mode === 'otp' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neura-gold w-5 h-5" />
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="Enter OTP"
                  required
                  className="neura-input pl-12 text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-neura-gray text-sm mt-2 text-center">
                  Enter the 6-digit code sent to {formData.phone}
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full neura-btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : mode === 'otp' ? 'Verify OTP' : mode === 'login' ? 'Login' : 'Create Account'}</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          {mode === 'login' && (
            <div className="mt-4 text-center">
              <a href="/forgot-password" className="text-neura-emerald hover:text-neura-emerald-light text-sm">
                Forgot Password?
              </a>
            </div>
          )}

          {mode === 'register' && (
            <div className="mt-6 text-center text-sm text-neura-gray">
              By registering, you agree to our{' '}
              <a href="/terms" className="text-neura-emerald hover:text-neura-emerald-light">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-neura-emerald hover:text-neura-emerald-light">
                Privacy Policy
              </a>
            </div>
          )}
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div>
            <div className="text-neura-gold text-3xl font-bold">🧠</div>
            <p className="text-neura-gray text-xs mt-1">AI Mentor</p>
          </div>
          <div>
            <div className="text-neura-emerald text-3xl font-bold">🏆</div>
            <p className="text-neura-gray text-xs mt-1">Gamification</p>
          </div>
          <div>
            <div className="text-neura-gold text-3xl font-bold">👥</div>
            <p className="text-neura-gray text-xs mt-1">Community</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
