import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const SearchAddFriends = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timer = setTimeout(() => searchUsers(), 500);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/friends/search?query=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get('/friends/requests/pending');
      setPendingRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch pending requests');
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      await axios.post('/friends/request', { friendId });
      toast.success('Friend request sent!');
      setResults(results.filter(u => u._id !== friendId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const acceptRequest = async (friendId) => {
    try {
      await axios.post('/friends/accept', { friendId });
      toast.success('Friend request accepted!');
      fetchPendingRequests();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const rejectRequest = async (friendId) => {
    try {
      await axios.post('/friends/reject', { friendId });
      toast.success('Request rejected');
      fetchPendingRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Pending Requests</h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {request.userId.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800">{request.userId.name}</p>
                      <p className="text-sm text-slate-500">{request.userId.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptRequest(request.userId._id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => rejectRequest(request.userId._id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Search Results</h3>
            <div className="space-y-3">
              {results.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-800">{user.name}</p>
                      <p className="text-sm text-slate-500">Level {user.level} • {user.xp} XP</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => sendFriendRequest(user._id)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <div className="text-center py-8 text-slate-600">Searching...</div>}
    </div>
  );
};

export default SearchAddFriends;
