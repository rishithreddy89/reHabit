import '@/index.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
const API = `${BACKEND_URL}/api`;

const OnboardingPage = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    goals: [],
    interests: [],
    preferences: {}
  });

  const goalOptions = [
    'Build healthier habits',
    'Increase productivity',
    'Improve mental wellbeing',
    'Develop new skills',
    'Stay consistent',
    'Connect with community'
  ];

  const interestOptions = [
    'Health & Fitness',
    'Mental Wellbeing',
    'Productivity',
    'Personal Growth',
    'Creativity',
    'Finance',
    'Relationships',
    'Spirituality'
  ];

  const toggleGoal = (goal) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const toggleInterest = (interest) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleComplete = async () => {
    try {
      await axios.post(`${API}/users/onboarding`, data);
      toast.success('Welcome to Rehabit!');
      navigate(`/${user.role}/dashboard`);
    } catch (error) {
      toast.error('Failed to complete onboarding');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2" style={{fontFamily: 'Space Grotesk'}}>Welcome to Rehabit!</h1>
          <p className="text-slate-600">Let's personalize your experience</p>
        </div>

        {step === 1 && (
          <Card className="animate-fade-in" data-testid="onboarding-step-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                What are your goals?
              </CardTitle>
              <CardDescription>Select all that apply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {goalOptions.map((goal) => (
                <div key={goal} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => toggleGoal(goal)} data-testid={`goal-${goal.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Checkbox checked={data.goals.includes(goal)} onCheckedChange={() => toggleGoal(goal)} />
                  <Label className="cursor-pointer flex-1">{goal}</Label>
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <Button onClick={() => navigate(`/${user.role}/dashboard`)} variant="outline" className="flex-1">Skip</Button>
                <Button onClick={() => setStep(2)} disabled={data.goals.length === 0} className="flex-1" data-testid="next-to-step-2">Next</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-fade-in" data-testid="onboarding-step-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                What interests you?
              </CardTitle>
              <CardDescription>Choose areas you want to focus on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {interestOptions.map((interest) => (
                <div key={interest} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer" onClick={() => toggleInterest(interest)} data-testid={`interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Checkbox checked={data.interests.includes(interest)} onCheckedChange={() => toggleInterest(interest)} />
                  <Label className="cursor-pointer flex-1">{interest}</Label>
                </div>
              ))}
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button>
                <Button onClick={handleComplete} disabled={data.interests.length === 0} className="flex-1" data-testid="complete-onboarding">Complete</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-2 mt-6">
          <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
          <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;