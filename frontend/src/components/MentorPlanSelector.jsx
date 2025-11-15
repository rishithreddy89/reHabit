import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Users, Zap, Crown, Star } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/lib/config';

const MentorPlanSelector = ({ open, onClose, mentorId, mentorName, onSuccess }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API}/mentor-plans/plans`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setSubscribing(true);
    try {
      const response = await axios.post(
        `${API}/mentor-plans/subscribe`,
        {
          mentorId,
          planId: plan._id,
          additionalMembers: [] // Can be extended to support adding members
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      toast.success(`Successfully subscribed to ${plan.displayName}! 🎉`);
      onSuccess && onSuccess(response.data);
      onClose();
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error(error.response?.data?.message || 'Failed to subscribe to plan');
    } finally {
      setSubscribing(false);
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName) {
      case 'basic':
        return <Star className="w-6 h-6" />;
      case 'duo':
        return <Users className="w-6 h-6" />;
      case 'family':
        return <Crown className="w-6 h-6" />;
      default:
        return <Zap className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName) {
      case 'basic':
        return {
          gradient: 'from-blue-500 to-blue-600',
          bg: 'bg-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600',
          light: 'bg-blue-50'
        };
      case 'duo':
        return {
          gradient: 'from-emerald-500 to-teal-600',
          bg: 'bg-emerald-500',
          button: 'bg-emerald-500 hover:bg-emerald-600',
          light: 'bg-emerald-50'
        };
      case 'family':
        return {
          gradient: 'from-purple-500 to-purple-600',
          bg: 'bg-purple-500',
          button: 'bg-purple-500 hover:bg-purple-600',
          light: 'bg-purple-50'
        };
      default:
        return {
          gradient: 'from-slate-500 to-slate-600',
          bg: 'bg-slate-500',
          button: 'bg-slate-500 hover:bg-slate-600',
          light: 'bg-slate-50'
        };
    }
  };

  const getPopularBadge = (planName) => {
    if (planName === 'duo') {
      return (
        <Badge className="absolute -top-3 -right-3 bg-orange-500 text-white shadow-lg">
          Most Popular
        </Badge>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center">Choose Your Mentorship Plan</DialogTitle>
          <DialogDescription className="text-center text-base">
            Select a plan to start your journey with {mentorName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 py-6 px-2 items-stretch">
            {plans.map((plan) => {
              const colors = getPlanColor(plan.name);
              return (
                <Card
                  key={plan._id}
                  className={`relative transition-all duration-300 hover:shadow-2xl cursor-pointer border-2 flex flex-col ${
                    selectedPlan?._id === plan._id ? 'border-emerald-500 shadow-xl' : 'border-slate-200'
                  } ${plan.name === 'duo' ? 'shadow-xl' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  {getPopularBadge(plan.name)}
                  
                  <CardHeader className="text-center pb-4 pt-6 flex-shrink-0">
                    <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                      {getPlanIcon(plan.name)}
                    </div>
                    <CardTitle className="text-2xl font-bold mb-2">{plan.displayName}</CardTitle>
                    <div className="text-4xl font-bold text-slate-900 mt-2">
                      ${plan.price}
                      <span className="text-base font-normal text-slate-500">/month</span>
                    </div>
                    <CardDescription className="mt-2 text-slate-600">
                      {plan.name === 'basic' && 'Perfect for individuals'}
                      {plan.name === 'duo' && 'Great for pairs'}
                      {plan.name === 'family' && 'Best for families'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 px-6 flex-grow flex flex-col">
                    <div className="flex-grow space-y-4">
                      <div className={`space-y-3 py-4 px-4 rounded-lg ${colors.light}`}>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Users className={`w-4 h-4 ${colors.bg.replace('bg-', 'text-')}`} />
                          <span>Up to {plan.maxMentees} {plan.maxMentees === 1 ? 'person' : 'people'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Check className={`w-4 h-4 ${colors.bg.replace('bg-', 'text-')}`} />
                          <span>{plan.sessionsPerMonth} sessions per month{plan.maxMentees > 1 ? ` (${Math.floor(plan.sessionsPerMonth / plan.maxMentees)} per person)` : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Check className={`w-4 h-4 ${colors.bg.replace('bg-', 'text-')}`} />
                          <span>Email support within {plan.responseTime}</span>
                        </div>
                      </div>

                      <div className="pt-2 space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                            <Check className={`w-4 h-4 ${colors.bg.replace('bg-', 'text-')} mt-0.5 flex-shrink-0`} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      className={`w-full mt-6 ${colors.button} text-white font-semibold py-6 text-base shadow-lg transition-all flex-shrink-0`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribe(plan);
                      }}
                      disabled={subscribing}
                    >
                      {subscribing && selectedPlan?._id === plan._id ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </span>
                      ) : (
                        'Select Plan'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="border-t pt-6 mt-4 bg-slate-50 -mx-6 px-6 pb-6 rounded-b-lg">
          <p className="text-center text-slate-600 mb-4 font-medium">
            All plans include access to mentor resources, progress tracking, and secure messaging
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-500" />
              30-day satisfaction guarantee
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-500" />
              Secure payment
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentorPlanSelector;
