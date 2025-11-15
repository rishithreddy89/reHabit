import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const MentorDashboard = ({ user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API}/mentor/clients`);
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} role="mentor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} role="mentor">
      <div className="space-y-6" data-testid="mentor-dashboard">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Mentor Dashboard</h1>
          <p className="text-slate-600 mt-1">Guide your clients to success</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card data-testid="stat-total-clients">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Clients</CardTitle>
              <Users className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{clients.length}</div>
              <p className="text-xs text-slate-500 mt-1">Active assignments</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-avg-progress">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Progress</CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">78%</div>
              <p className="text-xs text-slate-500 mt-1">Client success rate</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-active-goals">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Goals</CardTitle>
              <Target className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{clients.length * 3}</div>
              <p className="text-xs text-slate-500 mt-1">Being tracked</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Clients</CardTitle>
            <CardDescription>Manage and track client progress</CardDescription>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No clients assigned yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clients.map((client) => (
                  <Link key={client.id} to={`/mentor/client/${client.id}`} data-testid={`client-card-${client.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">{client.name}</h3>
                          <p className="text-sm text-slate-500">{client.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Level {client.level}</p>
                          <p className="text-xs text-slate-500">{client.xp} XP</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MentorDashboard;