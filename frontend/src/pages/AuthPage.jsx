import '@/index.css';
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Zap, Mail, Lock, User, Sparkles } from 'lucide-react';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
const API = `${BACKEND_URL}/api`;

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });

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
      const response = await axios.post(`${API}${endpoint}`, formData);
      
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
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519834785169-98be25ec3f84')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Rehabit</h1>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4" style={{fontFamily: 'Space Grotesk'}}>Transform Your Life, One Habit at a Time</h2>
          <p className="text-lg text-slate-700 mb-6">Join thousands building lasting habits through community support, gamification, and AI-powered guidance.</p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-700">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>AI-powered habit recommendations</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Community challenges and support</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>Track streaks and earn rewards</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Rehabit</h1>
            </div>
          </div>

          <Tabs value={isLogin ? 'login' : 'signup'} onValueChange={(value) => setIsLogin(value === 'login')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" data-testid="login-tab">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="signup-tab">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="login-email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          data-testid="login-email-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="login-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          data-testid="login-password-input"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-btn">
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Start your habit-building journey today</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="signup-name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          className="pl-10"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          data-testid="signup-name-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="signup-email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          data-testid="signup-email-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="signup-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          data-testid="signup-password-input"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label>Select Your Role</Label>
                      <RadioGroup value={formData.role} onValueChange={handleRoleChange}>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50" data-testid="role-user">
                          <RadioGroupItem value="user" id="role-user" />
                          <Label htmlFor="role-user" className="cursor-pointer flex-1">
                            <div className="font-semibold">Regular User</div>
                            <div className="text-sm text-slate-500">Build and track your habits</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50" data-testid="role-mentor">
                          <RadioGroupItem value="mentor" id="role-mentor" />
                          <Label htmlFor="role-mentor" className="cursor-pointer flex-1">
                            <div className="font-semibold">Mentor / Coach</div>
                            <div className="text-sm text-slate-500">Guide others in their journey</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-slate-50" data-testid="role-admin">
                          <RadioGroupItem value="admin" id="role-admin" />
                          <Label htmlFor="role-admin" className="cursor-pointer flex-1">
                            <div className="font-semibold">Admin</div>
                            <div className="text-sm text-slate-500">Manage platform and users</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading} data-testid="signup-submit-btn">
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