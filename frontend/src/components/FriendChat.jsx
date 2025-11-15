import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Smile } from 'lucide-react';
import { toast } from 'sonner';
import { SOCKET_URL } from '@/lib/config';
import io from 'socket.io-client';

const FriendChat = ({ selectedFriendId }) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    fetchFriends();
    initializeSocket();
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend._id);
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const newSocket = io(SOCKET_URL);
    newSocket.emit('authenticate', currentUserId);
    
    newSocket.on('new-message', (message) => {
      if (selectedFriend && 
          (message.senderId._id === selectedFriend._id || message.receiverId._id === selectedFriend._id)) {
        setMessages(prev => [...prev, message]);
      }
    });

    setSocket(newSocket);
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get('/friends/list');
      setFriends(res.data);
      if (selectedFriendId) {
        const friend = res.data.find(f => f._id === selectedFriendId);
        if (friend) setSelectedFriend(friend);
      }
    } catch (error) {
      toast.error('Failed to load friends');
    }
  };

  const fetchMessages = async (friendId) => {
    try {
      const res = await axios.get(`/messages/${friendId}`);
      setMessages(res.data);
    } catch (error) {
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    try {
      const res = await axios.post('/messages/send', {
        receiverId: selectedFriend._id,
        content: newMessage,
        type: 'text'
      });
      
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Friends List Sidebar */}
      <Card className="lg:col-span-1 overflow-hidden">
        <CardContent className="p-4 h-full overflow-y-auto">
          <h3 className="font-semibold text-slate-800 mb-4">Conversations</h3>
          <div className="space-y-2">
            {friends.map((friend) => (
              <div
                key={friend._id}
                onClick={() => setSelectedFriend(friend)}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFriend?._id === friend._id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                }`}
              >
                <Avatar>
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {friend.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{friend.name}</p>
                  <p className="text-xs text-slate-500">Level {friend.level}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden">
        {selectedFriend ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {selectedFriend.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-slate-800">{selectedFriend.name}</h3>
                <p className="text-sm text-emerald-600">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => {
                const isOwn = msg.senderId._id === currentUserId || msg.senderId === currentUserId;
                return (
                  <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-800'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
              <Button type="button" variant="outline" size="icon">
                <Smile className="w-5 h-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="w-5 h-5" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            Select a friend to start chatting
          </div>
        )}
      </Card>
    </div>
  );
};

export default FriendChat;
