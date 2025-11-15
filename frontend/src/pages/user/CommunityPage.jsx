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

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`${API}/communities`);
      setCommunities(response.data);
    } catch (error) {
      toast.error('Failed to load communities');
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
      toast.error('Failed to create community');
    }
  };

  const handleJoin = async (communityId) => {
    try {
      await axios.post(`${API}/communities/${communityId}/join`);
      toast.success('Joined community!');
      fetchCommunities();
    } catch (error) {
      toast.error('Failed to join community');
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
              <Button className="gap-2" data-testid="create-community-btn">
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
                <Button type="submit" className="w-full" data-testid="submit-community-btn">Create Community</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="groups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="groups" data-testid="groups-tab">Groups</TabsTrigger>
            <TabsTrigger value="challenges" data-testid="challenges-tab">Challenges</TabsTrigger>
          </TabsList>

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
                  <Card key={community.id} className="card-hover" data-testid={`community-${community.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-600" />
                        {community.name}
                      </CardTitle>
                      <CardDescription>{community.members.length} members</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4">{community.description || 'No description'}</p>
                      <Button
                        onClick={() => handleJoin(community.id)}
                        variant={community.members.includes(user.id) ? 'outline' : 'default'}
                        className="w-full"
                        disabled={community.members.includes(user.id)}
                        data-testid={`join-community-${community.id}`}
                      >
                        {community.members.includes(user.id) ? (
                          'Joined'
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Join Group
                          </>
                        )}
                      </Button>
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
                  <Card key={community.id} className="card-hover" data-testid={`challenge-${community.id}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        {community.name}
                      </CardTitle>
                      <CardDescription>{community.members.length} participants</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-4">{community.description || 'No description'}</p>
                      <Button
                        onClick={() => handleJoin(community.id)}
                        variant={community.members.includes(user.id) ? 'outline' : 'default'}
                        className="w-full"
                        disabled={community.members.includes(user.id)}
                        data-testid={`join-challenge-${community.id}`}
                      >
                        {community.members.includes(user.id) ? 'Participating' : 'Join Challenge'}
                      </Button>
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

export default CommunityPage;