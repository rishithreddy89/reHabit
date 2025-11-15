import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Search, MessageCircle, Activity } from 'lucide-react';
import FriendsList from './FriendsList';
import SearchAddFriends from './SearchAddFriends';
import FriendChat from './FriendChat';
import ActivityFeed from './ActivityFeed';

const FriendsHub = () => {
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 font-raleway">Friends & Social</h1>
        <p className="text-slate-600 mt-1 font-merriweather">Connect, support, and grow together</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Friends</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="mt-6">
          <FriendsList />
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <SearchAddFriends />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <FriendChat />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsHub;
