import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, ArrowRight, Flame, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const FriendsWidget = () => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const res = await axios.get('/friends/activity?limit=3');
      setActivities((res.data || []).slice(0, 3));
    } catch (error) {
      console.log('Failed to fetch friend activities');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'habit_complete': return <Target className="w-4 h-4 text-emerald-600" />;
      case 'streak': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'quest': return <Trophy className="w-4 h-4 text-purple-600" />;
      default: return null;
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-emerald-600" />
          Friend Activity
        </CardTitle>
        <Link to="/user/friends">
          <Button variant="ghost" size="sm" className="gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                    {activity.userId?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 truncate">
                    <span className="font-medium">{activity.userId?.name}</span> {activity.message}
                  </p>
                </div>
                {getIcon(activity.type)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-500 text-sm">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>Add friends to see their progress!</p>
            <Link to="/user/friends?tab=search">
              <Button size="sm" className="mt-2">Find Friends</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FriendsWidget;
