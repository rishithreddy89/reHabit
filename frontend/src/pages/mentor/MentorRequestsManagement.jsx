import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const MentorRequestsManagement = ({ user, onLogout }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API}/mentors/requests/received`);
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load requests');
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(`${API}/mentors/requests/${requestId}/accept`);
      toast.success('Request accepted! Client added to your mentees.');
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
      console.error('Error accepting request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(`${API}/mentors/requests/${requestId}/reject`);
      toast.success('Request rejected');
      fetchRequests(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject request');
      console.error('Error rejecting request:', error);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'PENDING' },
      accepted: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'ACCEPTED' },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'REJECTED' }
    };
    const { color, icon: Icon, label } = variants[status] || variants.pending;
    return (
      <Badge className={`${color} gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

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
      <div className="space-y-6" data-testid="mentor-requests-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>
              Client Requests
            </h1>
            <p className="text-slate-600 mt-1">
              Manage incoming mentorship requests from potential clients
            </p>
          </div>
          {pendingRequests.length > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700 text-lg px-4 py-2">
              {pendingRequests.length} Pending
            </Badge>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
              <Clock className="w-5 h-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{pendingRequests.length}</div>
              <p className="text-xs text-slate-500 mt-1">Awaiting your response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Accepted</CardTitle>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{acceptedRequests.length}</div>
              <p className="text-xs text-slate-500 mt-1">Now your clients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Requests</CardTitle>
              <Mail className="w-5 h-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{requests.length}</div>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" data-testid="pending-tab">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="accepted" data-testid="accepted-tab">
              Accepted ({acceptedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="rejected-tab">
              Rejected ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Pending Requests</h3>
                  <p className="text-slate-500">You're all caught up! New requests will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pendingRequests.map((request) => (
                  <Card key={request._id} data-testid={`request-${request._id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={request.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userId?.name || 'User')}&background=10b981&color=fff`}
                            alt={request.userId?.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">{request.userId?.name || 'Unknown User'}</CardTitle>
                            <p className="text-sm text-slate-500">{request.userId?.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span>Received {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>

                        {request.message && (
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm text-slate-700 font-medium mb-1">Message:</p>
                            <p className="text-sm text-slate-600">{request.message}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleAccept(request._id)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            data-testid={`accept-${request._id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleReject(request._id)}
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                            data-testid={`reject-${request._id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accepted" className="mt-6">
            {acceptedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Accepted Requests</h3>
                  <p className="text-slate-500">Accepted requests will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {acceptedRequests.map((request) => (
                  <Card key={request._id} data-testid={`accepted-request-${request._id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={request.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userId?.name || 'User')}&background=10b981&color=fff`}
                            alt={request.userId?.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">{request.userId?.name || 'Unknown User'}</CardTitle>
                            <p className="text-sm text-slate-500">{request.userId?.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          <span>Accepted {new Date(request.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {request.message && (
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm text-slate-600">{request.message}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <XCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No Rejected Requests</h3>
                  <p className="text-slate-500">Rejected requests will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {rejectedRequests.map((request) => (
                  <Card key={request._id} data-testid={`rejected-request-${request._id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={request.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.userId?.name || 'User')}&background=10b981&color=fff`}
                            alt={request.userId?.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">{request.userId?.name || 'Unknown User'}</CardTitle>
                            <p className="text-sm text-slate-500">{request.userId?.email}</p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>Rejected {new Date(request.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default MentorRequestsManagement;
