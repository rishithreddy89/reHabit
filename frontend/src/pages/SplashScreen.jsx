import React from 'react';
import { Zap } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="text-center animate-fade-in">
        <div className="flex items-center justify-center mb-6 animate-float">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Zap className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-slate-800 mb-3" style={{fontFamily: 'Space Grotesk'}}>Rehabit</h1>
        <p className="text-lg text-slate-600">Build habits that last</p>
        <div className="mt-8 flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;