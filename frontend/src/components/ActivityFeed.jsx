import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flame, Target, Trophy, Star, TrendingUp, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await axios.get('/friends/activity');
      setActivities(res.data);
    } catch (error) {
      toast.error('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'habit_complete': return <Target className="w-5 h-5 text-emerald-600" />;
      case 'streak': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'quest': return <Trophy className="w-5 h-5 text-purple-600" />;
      case 'level_up': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'needs_support': return <Heart className="w-5 h-5 text-red-500" />;
      default: return <TrendingUp className="w-5 h-5 text-blue-600" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-500">
          No activities yet. Add friends to see their progress!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <Card key={activity._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                  {activity.userId?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getActivityIcon(activity.type)}
                  <p className="text-slate-800">
                    <span className="font-semibold">{activity.userId?.name}</span> {activity.message}
                  </p>
                </div>
                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ActivityFeed;
