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
import { Flame, Target, Calendar, TrendingUp, CheckCircle, ArrowLeft, Star, Award, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/lib/config';

const HabitDetail = ({ user, onLogout }) => {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationDialog, setValidationDialog] = useState(false);
  const [validationData, setValidationData] = useState({ 
    questions: [], 
    currentQuestionIndex: 0, 
    answers: [], 
    currentAnswer: '', 
    logId: '' 
  });
  const [validationResult, setValidationResult] = useState(null);
  const [showValidationResult, setShowValidationResult] = useState(false);

  // Check if habit was completed today
  const isCompletedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return logs.some(log => {
      const logDate = new Date(log.completed_at);
      return log.validated && logDate >= today && logDate < tomorrow;
    });
  };

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
      const response = await axios.post(`/habits/${habitId}/complete`);
      setValidationData({
        questions: response.data.validation_questions || [response.data.validation_question],
        currentQuestionIndex: 0,
        answers: [],
        currentAnswer: '',
        logId: response.data.log_id
      });
      setValidationDialog(true);
    } catch (error) {
      if (error.response?.data?.alreadyCompleted) {
        toast.info(error.response.data.message || 'Habit already completed today!');
      } else {
        toast.error('Failed to mark as complete');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    try {
      const response = await axios.post(`/habits/validate-answer`, {
        log_id: validationData.logId,
        answer: validationData.currentAnswer,
        question_index: validationData.currentQuestionIndex,
        all_questions: validationData.questions
      });

      // Update answers array
      const newAnswers = [...validationData.answers];
      newAnswers[validationData.currentQuestionIndex] = validationData.currentAnswer;

      if (response.data.completed) {
        // All questions answered - show results
        setValidationResult(response.data);
        setValidationDialog(false);
        setShowValidationResult(true);
        
        if (response.data.completion_status === 'completed') {
          toast.success(`🎉 Habit Completed! +${response.data.xp_earned} XP! Streak: ${response.data.new_streak} days`);
        } else {
          toast.info(`💪 Good effort! +${response.data.xp_earned} XP. Keep improving!`);
        }
        
        fetchHabitData();
      } else {
        // More questions to go
        setValidationData(prev => ({
          ...prev,
          answers: newAnswers,
          currentQuestionIndex: response.data.next_question_index,
          currentAnswer: ''
        }));
        
        toast.info(`Question ${response.data.next_question_index + 1} of ${validationData.questions.length}`);
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      toast.error('Failed to submit answer');
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
          {isCompletedToday() ? (
            <Button disabled className="gap-2 bg-emerald-100 text-emerald-700 border-emerald-300" data-testid="completed-today-btn">
              <CheckCircle className="w-4 h-4" />
              Completed Today! ✨
            </Button>
          ) : (
            <Button onClick={handleComplete} className="gap-2" data-testid="complete-habit-btn">
              <CheckCircle className="w-4 h-4" />
              Mark as Done
            </Button>
          )}
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
                      <div className="flex items-center gap-2">
                        {log.completion_status === 'completed' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                              <Brain className="w-4 h-4" />
                              Completed ({log.ai_confidence}%)
                            </span>
                          </>
                        ) : (
                          <>
                            <Star className="w-5 h-5 text-orange-500" />
                            <span className="flex items-center gap-1 text-sm text-orange-600 font-medium">
                              <Brain className="w-4 h-4" />
                              Attempted ({log.ai_confidence}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {log.validation_question && (
                      <div className="mt-2 text-sm text-slate-600">
                        <p className="font-medium">Q: {log.validation_question}</p>
                        {log.validation_answer && (
                          <p className="mt-1">A: {log.validation_answer}</p>
                        )}
                        {log.ai_reasoning && (
                          <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                            <span className="font-medium">AI Analysis: </span>
                            {log.ai_reasoning}
                          </div>
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
              <DialogDescription>
                Question {validationData.currentQuestionIndex + 1} of {validationData.questions.length}
                {validationData.questions.length > 1 && " - Answer each question thoroughly"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Progress indicator for multiple questions */}
              {validationData.questions.length > 1 && (
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((validationData.currentQuestionIndex) / validationData.questions.length) * 100}%` 
                    }}
                  ></div>
                </div>
              )}
              
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-800 font-medium">
                  {validationData.questions[validationData.currentQuestionIndex]}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="validation-answer">Your Answer</Label>
                <Textarea
                  id="validation-answer"
                  placeholder="Type your answer here..."
                  value={validationData.currentAnswer}
                  onChange={(e) => setValidationData(prev => ({...prev, currentAnswer: e.target.value}))}
                  data-testid="validation-answer-input"
                  className="bg-white dark:bg-slate-800 text-slate-900 caret-emerald-600 dark:caret-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-500"
                />
              </div>
              
              <Button 
                onClick={handleSubmitAnswer} 
                className="w-full" 
                disabled={!validationData.currentAnswer} 
                data-testid="submit-validation-btn"
              >
                {validationData.currentQuestionIndex === validationData.questions.length - 1 
                  ? 'Complete Validation & Earn XP' 
                  : 'Next Question'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Validation Result Dialog */}
        <Dialog open={showValidationResult} onOpenChange={setShowValidationResult}>
          <DialogContent
            data-testid="validation-result-dialog"
            className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 max-w-lg mx-auto"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-emerald-600" />
                AI Validation Result
              </DialogTitle>
            </DialogHeader>
            
            {validationResult && (
              <div className="space-y-6">
                {/* Validation Status */}
                <div className={`p-4 rounded-lg border-2 ${
                  validationResult.completion_status === 'completed'
                    ? 'bg-emerald-50 border-emerald-200' 
                    : validationResult.confidence >= 60
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {validationResult.completion_status === 'completed' ? (
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    ) : validationResult.confidence >= 60 ? (
                      <Star className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <Star className="w-6 h-6 text-orange-500" />
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {validationResult.completion_status === 'completed' 
                          ? 'Habit Successfully Completed!' 
                          : validationResult.confidence >= 60
                          ? 'Good Effort - Keep Improving!'
                          : 'Attempt Recorded - Try Again!'
                        }
                      </h3>
                      <p className="text-sm text-slate-600">
                        AI Confidence: {validationResult.confidence}% 
                        {validationResult.confidence < 80 && ' (Need 80+ to mark as complete)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* XP and Streak Info */}
                <div className="flex gap-4">
                  <div className="flex-1 p-3 bg-blue-50 rounded-lg text-center">
                    <Award className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-blue-600">+{validationResult.xp_earned}</div>
                    <div className="text-sm text-blue-700">XP Earned</div>
                  </div>
                  <div className="flex-1 p-3 bg-orange-50 rounded-lg text-center">
                    <Flame className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-orange-600">{validationResult.new_streak}</div>
                    <div className="text-sm text-orange-700">Day Streak</div>
                  </div>
                </div>

                {/* AI Reasoning */}
                {validationResult.reasoning && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">AI Analysis:</h4>
                    <p className="text-sm text-slate-600">{validationResult.reasoning}</p>
                  </div>
                )}

                {/* Encouragement Message */}
                {validationResult.encouragement && (
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                    <p className="text-center text-slate-800 font-medium">
                      {validationResult.encouragement}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => setShowValidationResult(false)} 
                  className="w-full"
                >
                  Continue Building Habits!
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default HabitDetail;