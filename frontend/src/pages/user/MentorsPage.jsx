import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Star, UserCheck, Filter, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { API } from '@/lib/config';

const MentorsPage = ({ user, onLogout }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log('Location access denied')
      );
    }
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);
      if (ratingFilter !== 'all') params.append('rating', ratingFilter);
      if (onlineOnly) params.append('online', 'true');
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
      }

      const response = await axios.get(`${API}/mentors?${params.toString()}`);
      // normalize backend user-shaped mentor objects to a consistent UI shape
      const normalized = (response.data || []).map((m) => ({
        _id: m._id,
        name: m.name || (m.userId && m.userId.name) || 'Unknown Mentor',
        avatar: m.avatar || (m.userId && m.userId.profile?.avatar) || '',
        bio: m.bio || (m.userId && m.userId.bio) || '',
        specialization: m.mentorProfile?.specialization || m.specialization || (m.userId && m.userId.mentorProfile?.specialization) || [],
        rating: m.mentorProfile?.rating || m.stats?.rating || (m.userId && m.userId.mentorProfile?.rating) || 0,
        totalReviews: m.mentorProfile?.totalReviews || m.stats?.totalReviews || 0,
        activeMentees: m.mentorProfile?.currentClients || m.stats?.activeMentees || 0,
        maxMentees: m.mentorProfile?.maxClients || m.maxMentees || 10,
        isOnline: m.mentorProfile?.isOnline || false,
        location: m.mentorProfile?.location || m.location || null,
        distance: m.distance, // preserved if computed server-side
      }));
      console.log('Fetched mentors (normalized):', normalized);
      setMentors(normalized);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      toast.error('Failed to load mentors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [category, ratingFilter, onlineOnly, userLocation]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentors();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
      />
    ));
  };

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
      <div className="space-y-6 mt-5" data-testid="mentors-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800" style={{ fontFamily: 'Rethink Sans, sans-serif' }}>Find a Mentor</h1>
            <p className="text-slate-600 mt-1" style={{ fontFamily: 'Spectral, serif' }}>Connect with experienced mentors to guide your journey</p>
          </div>
          <Link to="/user/mentors/requests">
            <Button variant="outline" className="gap-2">
              <UserCheck className="w-4 h-4" />
              My Requests
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search mentors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                </div>

                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="category-filter">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="mindfulness">Mindfulness</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="mental-wellness">Mental Wellness</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger data-testid="rating-filter">
                    <SelectValue placeholder="Min Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4">4+ Stars</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant={onlineOnly ? 'default' : 'outline'}
                  onClick={() => setOnlineOnly(!onlineOnly)}
                  data-testid="online-filter"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  {onlineOnly ? 'Online Only' : 'All Status'}
                </Button>
              </div>

              <Button type="submit" className="w-full md:w-auto" data-testid="search-btn">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No mentors found</h3>
                <p className="text-slate-500 mb-4">
                  {category !== 'all' || ratingFilter !== 'all' || onlineOnly || search
                    ? 'Try adjusting your filters or search criteria'
                    : 'Be the first mentor! Register as a mentor to help others.'}
                </p>
                {(category !== 'all' || ratingFilter !== 'all' || onlineOnly || search) && (
                  <Button 
                    onClick={() => {
                      setCategory('all');
                      setRatingFilter('all');
                      setOnlineOnly(false);
                      setSearch('');
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            mentors.map((mentor) => (
              <Card key={mentor._id} className="card-hover" data-testid={`mentor-card-${mentor._id}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img
                      src={mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || 'Mentor')}&background=10b981&color=fff`}
                      alt={mentor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {mentor.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">{renderStars(mentor.rating || 0)}</div>
                        <span className="text-sm text-slate-600">
                          ({mentor.totalReviews || 0})
                        </span>
                      </div>
                    </div>
                    {mentor.isOnline && (
                      <Badge variant="success" className="bg-green-100 text-green-700">Online</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {mentor.specialization?.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="secondary">{spec}</Badge>
                      ))}
                    </div>

                    <p className="text-sm text-slate-600 line-clamp-2">
                      {mentor.bio || 'No bio available'}
                    </p>

                    {typeof mentor.distance === 'number' && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span>{mentor.distance.toFixed(1)} km away</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <UserCheck className="w-4 h-4" />
                      <span>{mentor.activeMentees || 0} / {mentor.maxMentees} mentees</span>
                    </div>

                    <Link to={`/user/mentors/${mentor._id}`} className="block mt-4">
                      <Button 
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 py-2.5" 
                        data-testid={`view-mentor-${mentor._id}`}
                      >
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MentorsPage;
