import '@/index.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Flame, Target, Calendar, TrendingUp, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const HabitDetail = ({ user, onLogout }) => {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationDialog, setValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState({ question: '', logId: '', answer: '' });

  useEffect(() => {
    fetchHabitData();
  }, [habitId]);

  const fetchHabitData = async () => {
    try {
      const [habitRes, logsRes] = await Promise.all([
        axios.get(`${API}/habits/${habitId}`),
        axios.get(`${API}/habits/${habitId}/logs`)
      ]);
      setHabit(habitRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      toast.error('Failed to load habit details');
      navigate('/user/habits');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await axios.post(`${API}/habits/${habitId}/complete`);
      setValidationData({
        question: response.data.validation_question,
        logId: response.data.log_id,
        answer: ''
      });
      setValidationDialog(true);
    } catch (error) {
      toast.error('Failed to mark as complete');
    }
  };

  const handleValidation = async () => {
    try {
      const response = await axios.post(`${API}/habits/validate`, {
        habit_id: habitId,
        answer: validationData.answer
      });
      toast.success(`+${response.data.xp_earned} XP! Streak: ${response.data.new_streak} days`);
      setValidationDialog(false);
      fetchHabitData();
    } catch (error) {
      toast.error('Failed to validate completion');
    }
  };

  if (loading || !habit) {
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
      <div className="space-y-6" data-testid="habit-detail-page">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/user/habits')} data-testid="back-to-habits">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800" style={{fontFamily: 'Space Grotesk'}}>{habit.title}</h1>
            <p className="text-slate-600 mt-1">{habit.category} • {habit.frequency}</p>
          </div>
          <Button onClick={handleComplete} className="gap-2" data-testid="complete-habit-btn">
            <CheckCircle className="w-4 h-4" />
            Mark as Done
          </Button>
        </div>

        {habit.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-slate-700">{habit.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-4 gap-6">
          <Card data-testid="stat-current-streak">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
              <Flame className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold streak-fire">{habit.streak}</div>
              <p className="text-xs text-slate-500 mt-1">days</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-longest-streak">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Longest Streak</CardTitle>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{habit.longest_streak}</div>
              <p className="text-xs text-slate-500 mt-1">days</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-completions">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Completions</CardTitle>
              <Target className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{habit.total_completions}</div>
              <p className="text-xs text-slate-500 mt-1">times</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-frequency">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Frequency</CardTitle>
              <Calendar className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 capitalize">{habit.frequency}</div>
              <p className="text-xs text-slate-500 mt-1">tracking</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Completion History</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No completions yet. Mark your first one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg" data-testid={`log-entry-${log.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-slate-800">
                          {new Date(log.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                      {log.validated && (
                        <span className="text-sm text-emerald-600 font-medium">Validated</span>
                      )}
                    </div>
                    {log.validation_question && (
                      <div className="mt-2 text-sm text-slate-600">
                        <p className="font-medium">Q: {log.validation_question}</p>
                        {log.validation_answer && (
                          <p className="mt-1">A: {log.validation_answer}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={validationDialog} onOpenChange={setValidationDialog}>
          <DialogContent
            data-testid="validation-dialog"
            className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200  dark:border-slate-800 max-w-md mx-auto backdrop-blur-md"
          >
            <DialogHeader>
              <DialogTitle>Validate Your Completion</DialogTitle>
              <DialogDescription>Answer this quick question to confirm you completed the habit</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50  rounded-lg">
                <p className="text-slate-800  font-medium">{validationData.question}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validation-answer">Your Answer</Label>
                <Textarea
                  id="validation-answer"
                  placeholder="Type your answer here..."
                  value={validationData.answer}
                  onChange={(e) => setValidationData({...validationData, answer: e.target.value})}
                  data-testid="validation-answer-input"
                  className="bg-white dark:bg-slate-800 text-slate-900  caret-emerald-600 dark:caret-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-500"
                />
              </div>
              <Button onClick={handleValidation} className="w-full" disabled={!validationData.answer} data-testid="submit-validation-btn">
                Submit & Earn XP
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default HabitDetail;