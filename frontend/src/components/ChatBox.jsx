import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Circle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API } from '@/lib/config';

const ChatBox = ({ currentUser, otherUser, requestStatus, disabled = false }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  // track seen message ids to avoid duplicates from socket + post race
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    if (!otherUser?._id || requestStatus !== 'accepted') return;

    // Connect to Socket.IO
    const backendUrl = API.replace('/api', '');
    socketRef.current = io(backendUrl, {
      auth: { token: localStorage.getItem('token') }
    });

    // Join chat room
    socketRef.current.emit('join_chat', {
      userId: currentUser._id,
      otherUserId: otherUser._id
    });

    // Emit user online
    socketRef.current.emit('user_online', currentUser._id);

    // Listen for messages
    socketRef.current.on('receive_message', (message) => {
      // Deduplicate by _id (message persisted from server)
      if (message?._id) {
        if (seenIdsRef.current.has(String(message._id))) return;
        seenIdsRef.current.add(String(message._id));
      }
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    // Listen for typing
    socketRef.current.on('user_typing', ({ userId }) => {
      if (userId === otherUser._id) {
        setIsTyping(true);
      }
    });

    socketRef.current.on('user_stop_typing', ({ userId }) => {
      if (userId === otherUser._id) {
        setIsTyping(false);
      }
    });

    // Listen for online status
    socketRef.current.on('user_status', ({ userId, status }) => {
      if (userId === otherUser._id) {
        setIsOnline(status === 'online');
      }
    });

    // Fetch message history
    fetchMessages();

    return () => {
      socketRef.current?.disconnect();
    };
  }, [otherUser?._id, requestStatus]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/chat/messages/${otherUser._id}`);
      setMessages(response.data);
      // populate seenIds with server message ids
      const ids = new Set();
      (response.data || []).forEach(m => { if (m?._id) ids.add(String(m._id)); });
      seenIdsRef.current = ids;
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const payload = {
      receiverId: otherUser._id,
      message: inputText
    };

    try {
      setInputText('');
      // Persist message via API; server will emit the saved message to the room
      const res = await axios.post(`${API}/chat/send`, payload);
      const saved = res.data;

      // Deduplicate: if socket already delivered this message (race), skip adding it again
      if (saved?._id) {
        const idStr = String(saved._id);
        if (!seenIdsRef.current.has(idStr)) {
          seenIdsRef.current.add(idStr);
          setMessages(prev => [...prev, saved]);
        } else {
          // already received via socket; ensure UI scrolls to bottom
          scrollToBottom();
        }
      } else {
        // fallback: if no _id, append (non-persistent case)
        setMessages(prev => [...prev, saved]);
      }

      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Emit typing indicator
    socketRef.current?.emit('typing', {
      senderId: currentUser._id,
      receiverId: otherUser._id
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', {
        senderId: currentUser._id,
        receiverId: otherUser._id
      });
    }, 1000);
  };

  if (requestStatus === 'rejected') {
    return null;
  }

  if (requestStatus === 'pending') {
    return (
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="py-8 text-center">
          <p className="text-yellow-700">Chat will unlock once the mentor accepts your request.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <img
              src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=10b981&color=fff`}
              alt={otherUser?.name}
              className="w-8 h-8 rounded-full"
            />
            {otherUser?.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Circle className={`w-3 h-3 ${isOnline ? 'fill-green-500 text-green-500' : 'fill-slate-300 text-slate-300'}`} />
            <span className="text-sm text-slate-500">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Messages Container */}
        <div className="h-[50vh] overflow-y-auto p-4 space-y-3 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = msg.senderId._id === currentUser._id || msg.senderId === currentUser._id;
              return (
                <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-white text-slate-800 border border-slate-200'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-slate-400">
                        {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isOwn && msg.isSeen && <span className="text-xs text-emerald-600">✓✓</span>}
                      {isOwn && !msg.isSeen && <span className="text-xs text-slate-400">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={handleInputChange}
              disabled={disabled}
              className="flex-1"
              data-testid="chat-input"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || disabled}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="send-message-btn"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatBox;
