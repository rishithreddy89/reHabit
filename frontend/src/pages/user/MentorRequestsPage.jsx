import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';
import ChatBox from '@/components/ChatBox';

const MentorRequestsPage = ({ user, onLogout }) => {
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [sentRes, receivedRes] = await Promise.all([
        axios.get(`${API}/mentors/requests/sent`),
        user.role === 'mentor' ? axios.get(`${API}/mentors/requests/received`) : Promise.resolve({ data: [] })
      ]);
      setSentRequests(sentRes.data);
      setReceivedRequests(receivedRes.data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await axios.post(`${API}/mentors/requests/${requestId}/accept`);
      toast.success('Request accepted!');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(`${API}/mentors/requests/${requestId}/reject`);
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      accepted: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle }
    };
    const { color, icon: Icon } = variants[status] || variants.pending;
    return (
      <Badge className={`${color} gap-1`}>
        <Icon className="w-3 h-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout} role="user">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout} role="user">
      <div className="space-y-6" data-testid="mentor-requests-page">
        <Link to="/user/mentors">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Mentors
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Mentor Requests</h1>
          <p className="text-slate-600 mt-1">Manage your mentor connections</p>
        </div>

        <Tabs defaultValue="sent" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sent" data-testid="sent-tab">Requests Sent</TabsTrigger>
            <TabsTrigger value="received" data-testid="received-tab" disabled={user.role !== 'mentor'}>
              Requests Received
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent" className="mt-6">
            {sentRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">You haven't sent any requests yet</p>
                  <Link to="/user/mentors">
                    <Button className="mt-4">Find a Mentor</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <Card key={request._id} data-testid={`sent-request-${request._id}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={request.mentorId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.mentorId?.name || 'Mentor')}&background=10b981&color=fff`}
                              alt={request.mentorId?.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <CardTitle className="text-lg">
                                {request.mentorId?.name || 'Unknown Mentor'}
                              </CardTitle>
                              <p className="text-sm text-slate-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {request.message && (
                          <p className="text-sm text-slate-600 mb-4">{request.message}</p>
                        )}
                        <div className="flex gap-2">
                          <Link to={`/user/mentors/${request.mentorId._id}`} className="flex-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600 font-semibold transition-all duration-200"
                            >
                              View Profile
                            </Button>
                          </Link>
                          {request.status === 'accepted' && (
                            <Button
                              size="sm"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => setSelectedChat(request)}
                              data-testid={`chat-btn-${request._id}`}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="lg:sticky lg:top-6 lg:h-fit">
                  {selectedChat ? (
                    <ChatBox
                      currentUser={user}
                      otherUser={selectedChat.mentorId}
                      requestStatus={selectedChat.status}
                    />
                  ) : (
                    <Card className="bg-slate-50">
                      <CardContent className="py-16 text-center">
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p className="text-slate-500">Select a mentor to start chatting</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="received" className="mt-6">
            {receivedRequests.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-slate-500">No requests received yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {receivedRequests.map((request) => (
                  <Card key={request._id} data-testid={`received-request-${request._id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={request.userId?.profile?.avatar || 'https://via.placeholder.com/40'}
                            alt={request.userId?.name}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <CardTitle className="text-lg">{request.userId?.name}</CardTitle>
                            <p className="text-sm text-slate-500">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {request.message && (
                        <p className="text-sm text-slate-600 mb-4">{request.message}</p>
                      )}
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAccept(request._id)}
                            className="flex-1"
                            data-testid={`accept-${request._id}`}
                          >
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleReject(request._id)}
                            variant="outline"
                            className="flex-1"
                            data-testid={`reject-${request._id}`}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
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

export default MentorRequestsPage;
