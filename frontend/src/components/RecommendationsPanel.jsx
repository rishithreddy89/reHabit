import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, TrendingUp, Award, 
  Sparkles, X, Check, ChevronRight, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

const API = `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:4000'}/api`;

const RecommendationsPanel = ({ token }) => {
  const [communityRecs, setCommunityRecs] = useState([]);
  const [accountabilityMatches, setAccountabilityMatches] = useState([]);
  const [trendingChallenges, setTrendingChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('communities');

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const [commRes, accRes, chalRes] = await Promise.all([
        axios.get(`${API}/social/recommendations/communities`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/social/accountability/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/social/challenges/trending`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setCommunityRecs(commRes.data.recommendations || []);
      setAccountabilityMatches(accRes.data.matches || []);
      setTrendingChallenges(chalRes.data.challenges || []);
    } catch (error) {
      console.error('Load recommendations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinCommunity = async (communityId) => {
    try {
      await axios.post(
        `${API}/communities/${communityId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Joined community! 🎉');
      loadRecommendations();
    } catch (error) {
      toast.error('Failed to join community');
    }
  };

  const dismissRecommendation = async (recId) => {
    try {
      await axios.post(
        `${API}/social/recommendations/${recId}/dismiss`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommunityRecs(prev => prev.filter(r => r._id !== recId));
      toast.success('Recommendation dismissed');
    } catch (error) {
      console.error('Dismiss error:', error);
    }
  };

  const acceptPartner = async (partnerId) => {
    try {
      await axios.post(
        `${API}/social/accountability/${partnerId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Accountability partner accepted! 🤝');
      loadRecommendations();
    } catch (error) {
      toast.error('Failed to accept partner');
    }
  };

  useEffect(() => {
    if (token) {
      loadRecommendations();
    }
  }, [token]);

  const tabs = [
    { id: 'communities', label: 'Communities', icon: Users, count: communityRecs.length },
    { id: 'partners', label: 'Partners', icon: UserPlus, count: accountabilityMatches.length },
    { id: 'challenges', label: 'Challenges', icon: TrendingUp, count: trendingChallenges.length }
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">AI Recommendations</h3>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 p-1 bg-white rounded-lg">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Icon className="w-4 h-4" />
                {count > 0 && (
                  <span className={`text-xs ${activeTab === id ? 'text-white' : 'text-purple-600'}`}>
                    {count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {/* Communities Tab */}
            {activeTab === 'communities' && (
              <div className="space-y-3">
                {communityRecs.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No recommendations yet</p>
                ) : (
                  communityRecs.slice(0, 5).map((rec) => (
                    <motion.div
                      key={rec._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{rec.communityId?.name}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {rec.communityId?.description}
                          </p>
                        </div>
                        <Badge className="ml-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                          {rec.matchScore}% match
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {rec.reasons?.slice(0, 2).map((reason, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                            {reason}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Users className="w-3 h-3" />
                        <span>{rec.communityId?.memberCount || 0} members</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs"
                          onClick={() => joinCommunity(rec.communityId._id)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Join
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => dismissRecommendation(rec._id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Partners Tab */}
            {activeTab === 'partners' && (
              <div className="space-y-3">
                {accountabilityMatches.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No matches yet</p>
                ) : (
                  accountabilityMatches.slice(0, 5).map((match) => (
                    <motion.div
                      key={match._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-10 h-10 ring-2 ring-purple-300">
                          <AvatarImage src={match.user2Id?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                            {match.user2Id?.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{match.user2Id?.name}</h4>
                          <p className="text-xs text-gray-500">Level {match.user2Id?.level || 1}</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {match.matchScore}%
                        </Badge>
                      </div>

                      <div className="space-y-1 mb-3">
                        {match.matchReasons?.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                            <ChevronRight className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      {match.status === 'pending' && (
                        <Button
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => acceptPartner(match._id)}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
              <div className="space-y-3">
                {trendingChallenges.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No challenges yet</p>
                ) : (
                  trendingChallenges.slice(0, 5).map((challenge, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{challenge.title}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {challenge.description}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {challenge.duration} days
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs ${
                          challenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {challenge.difficulty}
                        </Badge>
                        <span className="text-xs text-gray-500">{challenge.category}</span>
                      </div>

                      <div className="flex items-start gap-1 text-xs text-gray-600 mb-3 p-2 bg-purple-50 rounded">
                        <Target className="w-3 h-3 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span>{challenge.whyRelevant}</span>
                      </div>

                      <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Join Challenge
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default RecommendationsPanel;
