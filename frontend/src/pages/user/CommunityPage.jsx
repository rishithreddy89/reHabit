import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, UserPlus, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';
import { mockCommunities } from '@/lib/mockData';
import StudioHub from '@/components/StudioHub';
import CommunityFeed from '@/components/CommunityFeed';
import demoStore from '@/lib/demoStore';

const CommunityPage = ({ user, onLogout }) => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'group'
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const [demoJoined, setDemoJoined] = useState(() => demoStore.getJoinedCommunities());

  useEffect(() => {
    const unsub = demoStore.subscribe(() => setDemoJoined(demoStore.getJoinedCommunities()));
    return () => unsub();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`${API}/communities`);
      // backend may return { communities: [...] } or an array; normalize
      const data = response.data?.communities ?? response.data ?? [];
      if (!data || (Array.isArray(data) && data.length === 0)) {
        // fallback to demo communities when backend returns empty (silent)
        setCommunities(demoStore.getCommunities());
      } else {
        setCommunities(data);
      }
    } catch (error) {
      // if unauthorized or backend unavailable, fall back to mock data
      // If unauthorized or backend unreachable, show demo communities
      if (error?.response?.status === 401 || !error?.response) {
        setCommunities(demoStore.getCommunities());
      } else {
        toast.error('Failed to load communities');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/communities`, formData);
      setCommunities([...communities, response.data]);
      toast.success('Community created!');
      setDialogOpen(false);
      setFormData({ name: '', description: '', type: 'group' });
    } catch (error) {
      const status = error?.response?.status;
      // If user not signed in or backend error, create demo community locally
      if (!user?.id || !error?.response || status === 401 || status >= 500) {
        const created = demoStore.addCommunity({ ...formData, createdBy: user?.id });
        setCommunities(prev => [created, ...prev]);
        toast.success('Community created (demo)');
        setDialogOpen(false);
        setFormData({ name: '', description: '', type: 'group' });
        return;
      }
      toast.error('Failed to create community');
    }
  };

  const handleJoin = async (communityId) => {
    try {
      await axios.post(`${API}/communities/${communityId}/join`);
      toast.success('Joined community!');
      fetchCommunities();
    } catch (error) {
      // If backend is unavailable or has a server error, fall back to demo join
      const status = error?.response?.status;
      if (!error?.response || (status && status >= 500)) {
        // persist demo join and update local view
        demoStore.joinCommunity(communityId);
        setCommunities(prev => prev.map(c => {
          if (c.id !== communityId) return c;
          const nextMembers = Array.isArray(c.members) ? [...c.members] : [];
          if (user?.id && !nextMembers.includes(user.id)) nextMembers.push(user.id);
          return { ...c, members: nextMembers };
        }));
        toast.success('Joined community (demo)');
        return;
      }

      // For auth errors, tell the user to sign in; otherwise show the returned error
      if (status === 401 || status === 403) {
        toast.error('Please sign in to join this community');
      } else {
        toast.error('Failed to join community');
      }
    }
  };

  const groups = communities.filter(c => c.type === 'group');
  const challenges = communities.filter(c => c.type === 'challenge');

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
      <div className="space-y-6" data-testid="community-page">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>Community</h1>
            <p className="text-slate-600 mt-1">Connect with others on their habit journey</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="create-community-btn">
                  <Plus className="w-4 h-4" />
                  Create Community
                </Button>
              </DialogTrigger>
            <DialogContent
              data-testid="create-community-dialog"
              className="bg-white text-slate-900 rounded-lg shadow-xl border border-slate-200 w-[520px] max-w-full"
            >
              <DialogHeader>
                <DialogTitle>Create New Community</DialogTitle>
                <DialogDescription>Start a group or challenge</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Community Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Morning Risers, 30-Day Fitness"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    data-testid="community-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="What's this community about?"
                    value={formData.description}
                    onChange={handleChange}
                    data-testid="community-description-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={formData.type === 'group' ? 'default' : 'outline'}
                      onClick={() => setFormData({...formData, type: 'group'})}
                      className="flex-1"
                      data-testid="type-group"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Group
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === 'challenge' ? 'default' : 'outline'}
                      onClick={() => setFormData({...formData, type: 'challenge'})}
                      className="flex-1"
                      data-testid="type-challenge"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Challenge
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white" data-testid="submit-community-btn" disabled={!formData.name.trim()}>Create Community</Button>
                </div>
                {/** inline feedback for demo creations when user is not signed in or backend fails */}
                {(!user?.id) && (
                  <div className="text-xs text-amber-600 mt-2">You're currently unsigned — communities will be created in demo mode and stored locally.</div>
                )}
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed" data-testid="feed-tab">Feed</TabsTrigger>
            <TabsTrigger value="groups" data-testid="groups-tab">Groups</TabsTrigger>
            <TabsTrigger value="challenges" data-testid="challenges-tab">Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <CommunityFeed communityId={null} token={user?.token} user={user} />
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            {groups.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No groups yet</h3>
                    <p className="text-slate-500 mb-4">Be the first to create one!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((community) => (
                      <Card key={community.id} className="card-hover shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-shadow transition-transform duration-200" data-testid={`community-${community.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        {community.name}
                      </CardTitle>
                      <CardDescription>{community.members?.length ?? 0} members</CardDescription>
                    </CardHeader>
                      <CardContent>
                      <p className="text-sm text-slate-600 mb-4">{community.description || 'No description'}</p>
                      {(() => {
                        const isJoined = (user?.id && community.members.includes(user.id)) || demoJoined.has(community.id);
                        return (
                          <Button
                            onClick={() => handleJoin(community.id)}
                            variant={isJoined ? 'outline' : 'default'}
                            className={`w-full transition-colors duration-150 ${!isJoined ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                            disabled={isJoined}
                            data-testid={`join-community-${community.id}`}
                          >
                            {isJoined ? 'Joined' : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Join Group
                              </>
                            )}
                          </Button>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            {challenges.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No challenges yet</h3>
                    <p className="text-slate-500 mb-4">Create your first challenge!</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((community) => (
                  <Card key={community.id} className="card-hover shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-shadow transition-transform duration-200" data-testid={`challenge-${community.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        {community.name}
                      </CardTitle>
                      <CardDescription>{community.members?.length ?? 0} participants</CardDescription>
                    </CardHeader>
                      <CardContent>
                      <p className="text-sm text-slate-600 mb-4">{community.description || 'No description'}</p>
                      {(() => {
                        const isPart = community.members.includes(user.id);
                        return (
                          <Button
                            onClick={() => handleJoin(community.id)}
                            variant={isPart ? 'outline' : 'default'}
                            className={`w-full ${!isPart ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                            disabled={isPart}
                            data-testid={`join-challenge-${community.id}`}
                          >
                            {isPart ? 'Participating' : 'Join Challenge'}
                          </Button>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        <div className="mt-8">
          <StudioHub user={user} />
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPage;