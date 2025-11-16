import '@/index.css';
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Zap, Mail, Lock, User, Sparkles, Eye, EyeOff } from 'lucide-react';
import { API } from '@/lib/config';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      // for login only send email + password (avoid sending role which can cause backend role mismatch)
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password, role: formData.role };
      const response = await axios.post(`${API}${endpoint}`, payload);
      
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      console.error('Auth error response:', error.response?.data || error);
      const serverMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Authentication failed';
      toast.error(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-green-100 via-blue-50 to-white">
      {/* Pure white background, no image */}

      {/* Single Card Container with glassmorphism */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div 
          className="relative bg-white/30 backdrop-blur-xl rounded-2xl p-4 border border-green-200/60 shadow-2xl"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            border: '1px solid rgba(220, 252, 231, 0.4)',
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            maxHeight: '650px',
            minHeight: '0',
            width: '100%',
            maxWidth: '400px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Logo and Title with green icon */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-green-700" style={{fontFamily: 'Space Grotesk'}}>
                reHabit
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-green-600" style={{fontFamily: 'Space Grotesk'}}>
              Reset, Restart, Rebuild
            </h2>
          </div>

          {/* Auth Tabs and Forms */}
          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(value) => setIsLogin(value === 'login')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/40 border border-green-200/60">
              <TabsTrigger 
                value="login" 
                data-testid="login-tab"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-green-700"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                data-testid="signup-tab"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-green-700"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-white/20 border-green-200/60 shadow-none backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-gray-800">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-600">Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 bg-white/80 border-gray-300 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/50"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          data-testid="login-email-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="login-password"
                          name="password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-white/80 border-gray-300 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/50"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          data-testid="login-password-input"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-5 w-5 text-gray-400 focus:outline-none"
                          tabIndex={0}
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowLoginPassword((s) => !s)}
                        >
                          {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-semibold shadow-lg border border-green-600"
                      style={{backgroundImage: 'linear-gradient(90deg, #34d399 0%, #22c55e 50%, #16a34a 100%)'}}
                      disabled={loading} 
                      data-testid="login-submit-btn"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="bg-white/20 border-green-200/60 shadow-none backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-gray-800">Create Account</CardTitle>
                  <CardDescription className="text-gray-600">Start your habit-building journey today</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <Label htmlFor="role-select" className="text-gray-300 font-medium">Select Your Role</Label>
                      <div className="relative">
                        {/* Custom dropdown with enhanced styling */}
                        <div
                          tabIndex={0}
                          className={`w-full bg-gradient-to-br from-gray-700/30 to-gray-800/30 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                            roleOpen
                              ? 'border-blue-500/60 shadow-lg shadow-blue-500/20 bg-gray-800/40'
                              : 'border-gray-600/60 hover:border-gray-500/80 hover:shadow-md hover:shadow-gray-700/30'
                          }`}
                          onClick={() => setRoleOpen((s) => !s)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRoleOpen((s) => !s); } }}
                          onBlur={() => setRoleOpen(false)}
                          aria-haspopup="listbox"
                          aria-expanded={roleOpen}
                        >
                          <span className="text-gray-100 font-medium">
                            {formData.role === 'user' ? 'Regular User' : formData.role === 'mentor' ? 'Mentor / Coach' : 'Admin'}
                          </span>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${roleOpen ? 'rotate-180' : ''}`}
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>

                        {roleOpen && (
                          <ul
                            role="listbox"
                            aria-label="Select role"
                            className="absolute z-50 mt-3 w-full bg-gradient-to-b from-gray-750 to-gray-850 border border-gray-600/60 rounded-xl shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-sm"
                          >
                            {[
                              { value: 'user', label: 'Regular User', desc: 'Build and track your habits' },
                              { value: 'mentor', label: 'Mentor / Coach', desc: 'Guide others in their journey' },
                              { value: 'admin', label: 'Admin', desc: 'Manage platform and users' }
                            ].map((opt, idx) => (
                              <li
                                key={opt.value}
                                role="option"
                                aria-selected={formData.role === opt.value}
                                onMouseDown={(e) => { e.preventDefault(); handleRoleChange(opt.value); setRoleOpen(false); }}
                                className={`px-5 py-4 cursor-pointer flex items-center justify-between transition-colors duration-150 ${
                                  formData.role === opt.value
                                    ? 'bg-gradient-to-r from-blue-600/40 to-blue-500/20 border-l-3 border-blue-500'
                                    : 'hover:bg-gray-700/50 border-l-3 border-transparent'
                                } ${idx !== 2 ? 'border-b border-gray-700/30' : ''}`}
                              >
                                <div className="flex flex-col">
                                  <span className={`font-medium transition-colors ${formData.role === opt.value ? 'text-blue-300' : 'text-gray-200'}`}>
                                    {opt.label}
                                  </span>
                                  <span className={`text-xs ${formData.role === opt.value ? 'text-blue-200/70' : 'text-gray-400'}`}>
                                    {opt.desc}
                                  </span>
                                </div>
                                {formData.role === opt.value && (
                                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-gray-700">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="signup-name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10 bg-white/80 border-gray-300 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/50"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          data-testid="signup-name-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 bg-white/80 border-gray-300 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/50"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          data-testid="signup-email-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <Input
                          id="signup-password"
                          name="password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-white/80 border-gray-300 text-black placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500/50"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          data-testid="signup-password-input"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 h-5 w-5 text-gray-400 focus:outline-none"
                          tabIndex={0}
                          aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowSignupPassword((s) => !s)}
                        >
                          {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold shadow-lg border border-green-600"
                      disabled={loading} 
                      data-testid="signup-submit-btn"
                    >
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;