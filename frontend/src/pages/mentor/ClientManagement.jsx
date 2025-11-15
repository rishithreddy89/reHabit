import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const ClientManagement = ({ user, onLogout }) => {
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
      <div className="space-y-6" data-testid="client-management-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Client Management</h1>
          <p className="text-slate-600 mt-1">View and manage all your clients</p>
        </div>

        {clients.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No clients yet</h3>
                <p className="text-slate-500">Clients will appear here when assigned</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="card-hover" data-testid={`client-card-${client.id}`}>
                <CardHeader>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>{client.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Level</span>
                      <span className="font-semibold text-slate-800">{client.level}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Total XP</span>
                      <span className="font-semibold text-slate-800">{client.xp}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Streak</span>
                      <span className="font-semibold text-slate-800">{client.streak} days</span>
                    </div>
                  </div>
                  <Link to={`/mentor/client/${client.id}`}>
                    <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors" data-testid={`view-client-${client.id}`}>
                      View Progress
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ClientManagement;