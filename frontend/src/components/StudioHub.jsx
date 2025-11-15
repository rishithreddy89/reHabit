import React, { useEffect, useState } from 'react';
import demoStore from '@/lib/demoStore';
import { mockUsers } from '@/lib/mockCommunityFeed';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const StudioHub = ({ user }) => {
  const [studios, setStudios] = useState(() => demoStore.getStudios());
  const [stories, setStories] = useState(() => demoStore.getMicroStories());
  const [message, setMessage] = useState('');
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    const unsub = demoStore.subscribe(() => {
      setStudios(demoStore.getStudios());
      setStories(demoStore.getMicroStories());
    });
    return () => unsub();
  }, []);

  const join = (studioId) => {
    const uid = user?.id || 'guest';
    demoStore.joinStudio(studioId, uid);
    toast.success(user?.id ? 'Joined studio (demo)' : 'Joined studio (guest demo)');
  };

  const checkIn = (studioId) => {
    const uid = user?.id || 'guest';
    demoStore.checkInStudio(studioId, uid);
    toast.success(user?.id ? 'Checked in (demo)' : 'Checked in (guest demo)');
  };

  const publishStory = (studioId) => {
    if (!message.trim()) return toast.error('Write something small');
    const authorName = user?.name || 'Guest';
    const story = { id: `ms-${Date.now()}`, title: `${authorName}'s micro-win`, text: message, author: authorName, studioId, createdAt: new Date().toISOString() };
    demoStore.addMicroStory(story);
    setMessage('');
    toast.success(user?.id ? 'Added to Micro-Success Wall (demo)' : 'Added to Micro-Success Wall (guest demo)');
  };

  const likeStory = (storyId) => {
    demoStore.reactToStory(storyId);
    toast.success('Liked (demo)');
  };

  const submitComment = (storyId) => {
    const text = (commentText[storyId] || '').trim();
    if (!text) return toast.error('Write a comment');
    const comment = { id: `c-${Date.now()}`, text, author: user?.name || 'Guest', authorId: user?.id || 'guest', at: new Date().toISOString() };
    demoStore.addCommentToStory(storyId, comment);
    setCommentText(prev => ({ ...prev, [storyId]: '' }));
    toast.success('Comment added (demo)');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Habit Studios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {studios.map(s => (
          <Card key={s.id} className="p-4 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-shadow transition-transform duration-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{s.name}</h3>
                  <Badge className="text-xs">Energy: {s.energy + Math.floor(Math.random()*3)}</Badge>
                </div>
                <p className="text-sm text-slate-600">{s.description}</p>
                <div className="mt-3">
                  <div className="text-xs text-slate-500">Members</div>
                  <div className="flex items-center gap-2 mt-2">
                    {(s.members||[]).slice(0,5).map(id => {
                      const u = mockUsers.find(x=>x.id===id) || { name: id };
                      return (
                        <div key={id} className="text-center">
                          <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm"><AvatarFallback className="bg-emerald-400 text-white">{u.name[0]}</AvatarFallback></Avatar>
                          <div className="text-xs">{u.name}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" onClick={() => join(s.id)} className="transition-colors duration-150">Join Studio</Button>
                  <Button variant="ghost" size="sm" onClick={() => checkIn(s.id)} className="transition-colors duration-150">Check-in</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Micro-Success Stories Wall</h3>
        <p className="text-sm text-slate-500 mb-3">Share a tiny success — AI will turn it into a motivational card (demo).</p>
        <Textarea placeholder="Share a small win..." value={message} onChange={(e)=>setMessage(e.target.value)} />
        <div className="mt-3"><Button onClick={() => publishStory()} className="transition-colors duration-150">Publish to Wall</Button></div>
        <div className="mt-4 space-y-3">
          {stories.map(st => (
            <Card key={st.id} className="p-3 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{st.title}</div>
                  <div className="text-xs text-slate-500">{st.author}</div>
                </div>
                <div className="text-sm text-slate-500">{st.studioId ? `Studio: ${st.studioId}` : ''}</div>
              </div>
              <p className="mt-2 text-sm text-slate-700">{st.text}</p>
              <div className="mt-3 flex items-center gap-4">
                <button onClick={() => likeStory(st.id)} className="text-sm inline-flex items-center gap-2 text-slate-700 hover:text-emerald-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 9l3 3m0 0l-3 3m3-3H3" />
                  </svg>
                  <span>{st.likes || 0}</span>
                </button>
                <div className="text-sm text-slate-500">{(st.comments || []).length} comments</div>
              </div>

              <div className="mt-3">
                <div className="space-y-2">
                  {(st.comments || []).map(c => (
                    <div key={c.id} className="flex items-start gap-3">
                      <div className="shrink-0">
                        <Avatar className="w-8 h-8 ring-2 ring-white shadow-sm"><AvatarFallback className="bg-emerald-400 text-white">{(c.author||'G')[0]}</AvatarFallback></Avatar>
                      </div>
                      <div>
                        <div className="text-xs font-medium">{c.author}</div>
                        <div className="text-sm text-slate-700">{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input value={commentText[st.id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [st.id]: e.target.value }))} className="flex-1 input bg-white border rounded-md px-3 py-2 text-sm" placeholder="Write a comment..." />
                  <Button size="sm" onClick={() => submitComment(st.id)}>Comment</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default StudioHub;
