import '@/index.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, Award, MapPin, UserCheck, MessageCircle, Calendar, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const MentorProfilePage = ({ user, onLogout }) => {
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userRequest, setUserRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMessage, setRequestMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchMentorProfile();
  }, [mentorId]);

  const fetchMentorProfile = async () => {
    try {
      const response = await axios.get(`${API}/mentors/${mentorId}`);
      const m = response.data || {};
      // normalize to expected shape
      const normalized = {
        _id: m._id,
        name: m.name || (m.userId && m.userId.name) || 'Unknown Mentor',
        avatar: m.avatar || (m.userId && m.userId.profile?.avatar) || '',
        bio: m.bio || (m.userId && m.userId.bio) || '',
        specialization: m.mentorProfile?.specialization || m.specialization || [],
        rating: m.mentorProfile?.rating || m.stats?.rating || 0,
        totalReviews: m.mentorProfile?.totalReviews || m.stats?.totalReviews || 0,
        isOnline: m.mentorProfile?.isOnline || false,
        activeMentees: m.mentorProfile?.currentClients || m.stats?.activeMentees || 0,
        maxMentees: m.mentorProfile?.maxClients || m.maxMentees || 10,
        location: m.mentorProfile?.location || m.location || null,
        // keep raw object for any other fields
        raw: m
      };
      setMentor(normalized);
      // backend currently doesn't return reviews/userRequest with User model - leave reviews empty
      setReviews(m.reviews || []);
      setUserRequest(m.userRequest || null);
    } catch (error) {
      toast.error('Failed to load mentor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API}/mentors/${mentorId}/request`, {
        message: requestMessage
      });
      setUserRequest(response.data);
      toast.success('Request sent successfully!');
      setDialogOpen(false);
      setRequestMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/mentors/${mentorId}/review`, {
        rating,
        comment: reviewComment
      });
      toast.success('Review submitted!');
      setReviewDialogOpen(false);
      setReviewComment('');
      fetchMentorProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 cursor-pointer transition-colors ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
        }`}
        onClick={() => interactive && setRating(i + 1)}
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

  if (!mentor) {
    return (
      <Layout user={user} onLogout={onLogout} role="user">
        <div className="text-center py-12">
          <p className="text-slate-500">Mentor not found</p>
          <Link to="/user/mentors">
            <Button className="mt-4">Back to Mentors</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const canReview = userRequest?.status === 'accepted';

  return (
    <Layout user={user} onLogout={onLogout} role="user">
      <div className="space-y-6" data-testid="mentor-profile-page">
        {/* Back Button */}
        <Link to="/user/mentors">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Mentors
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <img
                src={mentor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.name || 'Mentor')}&background=10b981&color=fff`}
                alt={mentor.name}
                className="w-24 h-24 rounded-full object-cover shadow-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>
                    {mentor.name}
                  </h1>
                  {mentor.raw?.isVerified && (
                    <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                      <Award className="w-3 h-3" />
                      Verified
                    </Badge>
                  )}
                  {mentor.isOnline && (
                    <Badge className="bg-green-100 text-green-700">Online</Badge>
                  )}
                </div>

                {/* Prominent rating */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-extrabold text-slate-800">{(mentor.rating || 0).toFixed(1)}</div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(mentor.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-slate-600">({mentor.totalReviews || 0} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(mentor.specialization || []).map((spec) => (
                    <Badge key={spec} variant="secondary">{spec}</Badge>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-4 h-4" />
                    <span>{mentor.activeMentees || 0} active mentees</span>
                  </div>
                  {mentor.location?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{mentor.location.city}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {!userRequest ? (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" data-testid="send-request-btn">
                        <MessageCircle className="w-4 h-4" />
                        Send Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Send Mentor Request</DialogTitle>
                        <DialogDescription>
                          Introduce yourself to {mentor.name}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSendRequest} className="space-y-4">
                        <Textarea
                          placeholder="Why would you like this mentor to guide you?"
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          rows={4}
                          data-testid="request-message"
                        />
                        <Button type="submit" className="w-full" data-testid="submit-request">
                          Send Request
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Badge
                    className={
                      userRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      userRequest.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }
                  >
                    {userRequest.status.toUpperCase()}
                  </Badge>
                )}

                {canReview && (
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2" data-testid="leave-review-btn">
                        <Star className="w-4 h-4" />
                        Leave Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Leave a Review</DialogTitle>
                        <DialogDescription>Share your experience</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Rating</label>
                          <div className="flex gap-1">{renderStars(rating, true)}</div>
                        </div>
                        <Textarea
                          placeholder="Share your thoughts..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={4}
                          data-testid="review-comment"
                        />
                        <Button type="submit" className="w-full" data-testid="submit-review">
                          Submit Review
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* About */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">
                  {mentor.bio || 'No bio available'}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0" data-testid={`review-${review._id}`}>
                        <div className="flex items-start gap-3">
                          <img
                            src={review.userId?.profile?.avatar || 'https://via.placeholder.com/40'}
                            alt={review.userId?.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-slate-800">{review.userId?.name}</span>
                              <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-slate-600">{review.comment}</p>
                            )}
                            <span className="text-xs text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Mentees</span>
                  <span className="font-semibold">{mentor.stats?.totalMentees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Active Mentees</span>
                  <span className="font-semibold">{mentor.activeMentees || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Success Rate</span>
                  <span className="font-semibold">{mentor.stats?.successRate || 0}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Credentials */}
            {mentor.credentials && mentor.credentials.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Credentials</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mentor.credentials.map((cred, idx) => (
                      <div key={idx} className="border-l-2 border-emerald-500 pl-3">
                        <div className="font-semibold text-slate-800">{cred.title}</div>
                        <div className="text-sm text-slate-600">{cred.organization}</div>
                        <div className="text-xs text-slate-400">{cred.year}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MentorProfilePage;
