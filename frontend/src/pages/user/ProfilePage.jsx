import '@/index.css';
import React, { useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Award, Target } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const ProfilePage = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${API}/users/profile`, formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout user={user} onLogout={onLogout} role="user">
      <div className="space-y-6 max-w-2xl" data-testid="profile-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Profile</h1>
          <p className="text-slate-600 mt-1">Manage your account settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card data-testid="profile-xp">
            <CardContent className="pt-6 text-center">
              <Award className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">{user.xp || 0}</p>
              <p className="text-xs text-slate-500">Total XP</p>
            </CardContent>
          </Card>
          <Card data-testid="profile-level">
            <CardContent className="pt-6 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">{user.level || 1}</p>
              <p className="text-xs text-slate-500">Level</p>
            </CardContent>
          </Card>
          <Card data-testid="profile-streak">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl mb-2">🔥</div>
              <p className="text-2xl font-bold text-slate-800">{user.streak || 0}</p>
              <p className="text-xs text-slate-500">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    data-testid="profile-name-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    data-testid="profile-email-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user.role} disabled className="capitalize" />
              </div>
              <Button type="submit" disabled={loading} data-testid="save-profile-btn">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;