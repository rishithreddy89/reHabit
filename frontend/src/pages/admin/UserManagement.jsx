import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const UserManagement = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) return;

    try {
      await axios.put(`${API}/admin/users/${userId}/suspend`);
      toast.success('User suspended');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to suspend user');
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
      <div className="space-y-6" data-testid="user-management-page">
        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>User Management</h1>
          <p className="text-slate-600 mt-1">Manage all platform users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="p-4 border rounded-lg flex items-center justify-between" data-testid={`user-${u.id}`}>
                  <div>
                    <p className="font-semibold text-slate-800">{u.name}</p>
                    <p className="text-sm text-slate-500">{u.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="capitalize bg-slate-100 px-2 py-1 rounded">{u.role}</span>
                      <span>Level {u.level}</span>
                      <span>{u.xp} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.suspended ? (
                      <span className="text-sm text-red-600 font-medium">Suspended</span>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSuspend(u.id)}
                        disabled={u.id === user.id}
                        data-testid={`suspend-user-${u.id}`}
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Suspend
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserManagement;