import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const MentorManagement = ({ user, onLogout }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      const mentorUsers = response.data.filter(u => u.role === 'mentor');
      setMentors(mentorUsers);
    } catch (error) {
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} role="admin">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} role="admin">
      <div className="space-y-6" data-testid="mentor-management-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Mentor Management</h1>
          <p className="text-slate-600 mt-1">Oversee mentor accounts and performance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              All Mentors ({mentors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mentors.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No mentors registered yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="p-4 border rounded-lg" data-testid={`mentor-${mentor.id}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{mentor.name}</p>
                        <p className="text-sm text-slate-500">{mentor.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>Level {mentor.level}</span>
                          <span>{mentor.xp} XP</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
                          Active Mentor
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MentorManagement;