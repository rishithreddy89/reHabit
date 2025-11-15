import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, User, Heart, Flame, Zap, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const res = await axios.get('/friends/list');
      setFriends(res.data);
    } catch (error) {
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async (friendId, type) => {
    try {
      const messages = {
        cheer: '👍 Keep going! You\'re doing amazing!',
        boost: '🔥 Boosting your energy! You got this!',
        quest: '🧩 Let\'s team up for a Duo Quest!',
        calm: '🎧 Take a deep breath. You\'re on the right path.'
      };

      await axios.post('/messages/send', {
        receiverId: friendId,
        content: messages[type],
        type: 'sticker'
      });

      toast.success('Support sent!');
    } catch (error) {
      toast.error('Failed to send support');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading friends...</div>;
  }

  if (friends.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <UsersIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-slate-600 mb-4">No friends yet. Start connecting!</p>
          <Button onClick={() => navigate('/user/friends?tab=search')}>
            Search Friends
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {friends.map((friend) => (
        <Card key={friend._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                    {friend.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h3 className="font-semibold text-slate-800">{friend.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {friend.streak || 0} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Level {friend.level || 1}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/user/friends/chat/${friend._id}`)}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/user/friends/profile/${friend._id}`)}
                >
                  <User className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSupport(friend._id, 'cheer')}
                  className="gap-1"
                >
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="hidden sm:inline">Support</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FriendsList;
