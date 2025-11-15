import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Target, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const MentorDashboard = ({ user, onLogout }) => {
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // quick health check to avoid connection-refused spam
      const base = API.replace(/\/api\/?$/, '');
      try {
        await axios.get(`${base}/health`, { timeout: 2500 });
      } catch (err) {
        console.error('Backend health check failed:', err?.message || err);
        toast.error(`Backend not reachable at ${base}. Start the server and refresh.`);
        setLoading(false);
        return;
      }

      const [clientsRes, requestsRes] = await Promise.all([
        axios.get(`${API}/mentors/clients`).catch(e => ({ error: e })),
        axios.get(`${API}/mentors/requests/received`).catch(e => ({ error: e }))
      ]);

      if (clientsRes?.error) {
        console.error('Failed to load clients:', clientsRes.error);
        toast.error('Failed to load clients');
        setClients([]);
      } else {
        setClients(clientsRes.data || []);
      }

      if (requestsRes?.error) {
        console.error('Failed to load requests:', requestsRes.error);
        toast.error('Failed to load requests');
        setPendingRequests([]);
      } else {
        setPendingRequests((requestsRes.data || []).filter(r => r.status === 'pending'));
      }
    } catch (error) {
      console.error('Unexpected dashboard error:', error);
      toast.error('Failed to load dashboard data');
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

          <Card data-testid="stat-pending-requests">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
              <Inbox className="w-5 h-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{pendingRequests.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                <Link to="/mentor/requests" className="text-emerald-600 hover:underline">
                  View all requests →
                </Link>
              </p>
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

        {/* Pending Requests Preview */}
        {pendingRequests.length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-yellow-600" />
                  New Requests ({pendingRequests.length})
                </CardTitle>
                <Link to="/mentor/requests">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div key={request._id} className="bg-white rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userId?.name || 'User')}&background=10b981&color=fff`}
                        alt={request.userId?.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-slate-800">{request.userId?.name}</p>
                        <p className="text-xs text-slate-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link to="/mentor/requests">
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                  <Link key={client._id || client.id} to={`/mentor/client/${client._id || client.id}`} data-testid={`client-card-${client._id || client.id}`}>
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