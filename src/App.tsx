import React, { useState } from 'react';
import { Sparkles, GraduationCap, Compass, Landmark, LogOut, BookOpen, Clock, HeartHandshake } from 'lucide-react';
import EntranceExam from './components/EntranceExam';
import Classroom from './components/Classroom';
import Hallway from './components/Hallway';
import FinancialDashboard from './components/FinancialDashboard';
import { StudentProfile } from './types';

export default function App() {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [cohort, setCohort] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'classroom' | 'hallway' | 'financials'>('classroom');

  // Live score tracker callback
  const handleUpdateScores = (academicDelta: number, attitudeDelta: number) => {
    if (!student) return;
    setStudent(prev => {
      if (!prev) return null;
      const nextAcademic = Math.min(100, Math.max(0, prev.academicScore + academicDelta));
      const nextAttitude = Math.min(100, Math.max(0, prev.attitudeScore + attitudeDelta));
      // peer points increment whenever attitude score changes
      const nextPeerPoints = prev.peerPoints + (attitudeDelta > 0 ? attitudeDelta * 5 : 0);

      return {
        ...prev,
        academicScore: nextAcademic,
        attitudeScore: nextAttitude,
        peerPoints: nextPeerPoints
      };
    });
  };

  const handleOnboardComplete = (newStudent: StudentProfile, matchedCohort: any) => {
    setStudent(newStudent);
    setCohort(matchedCohort);
    setActiveTab('classroom');
  };

  const resetSession = () => {
    setStudent(null);
    setCohort(null);
    setActiveTab('classroom');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col justify-between" id="applet-root">
      
      {/* HEADER SECTION (Top Navigation bar) */}
      <header className="bg-indigo-950 text-white shadow-md select-none shrink-0 border-b border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
          
          {/* Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-indigo-350" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300 font-bold block">Homeschool Network</span>
              <h1 className="text-sm font-sans font-bold tracking-tight text-white hover:text-indigo-200 cursor-pointer">Academicians</h1>
            </div>
          </div>

          {/* Student mini summary HUD when enrolled */}
          {student && cohort && (
            <div className="hidden md:flex items-center gap-6 font-sans">
              <div className="text-xs">
                <span className="text-indigo-350 text-[10px] block font-mono">My Cohort</span>
                <span className="font-semibold text-white">{cohort.name.split(" (")[0]}</span>
              </div>
              <div className="h-6 w-px bg-white/15"></div>
              <div className="text-xs">
                <span className="text-indigo-350 text-[10px] block font-mono">Subject Mastery</span>
                <span className="font-semibold text-emerald-400 font-mono">{student.academicScore}%</span>
              </div>
              <div className="h-6 w-px bg-white/15"></div>
              <div className="text-xs">
                <span className="text-indigo-350 text-[10px] block font-mono">Peer-Teaching points</span>
                <span className="font-semibold text-amber-400 font-mono">{student.peerPoints} pts</span>
              </div>
            </div>
          )}

          {/* Tab Actions */}
          {student ? (
            <div className="flex items-center gap-2">
              <button
                onClick={resetSession}
                className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition text-xs flex items-center gap-1.5"
                title="Register a new custom profile"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline font-medium">Re-onboard</span>
              </button>
            </div>
          ) : (
            <span className="text-xs px-3 py-1 bg-white/10 text-indigo-250 border border-white/10 rounded-lg font-mono tracking-wide">
              ACCÉDÉ
            </span>
          )}
        </div>
      </header>

      {/* DASHBOARD TAB ACTION GRID BAR */}
      {student && (
        <div className="bg-white border-b border-gray-200 py-2.5 shrink-0 select-none shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2">
            <button
              onClick={() => setActiveTab('classroom')}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-semibold font-sans transition ${
                activeTab === 'classroom'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-650 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Classroom (Academy)
            </button>

            <button
              onClick={() => setActiveTab('hallway')}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-semibold font-sans transition ${
                activeTab === 'hallway'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-650 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Hallway (Society)
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-semibold font-sans transition ${
                activeTab === 'financials'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-gray-650 hover:bg-slate-50'
              }`}
            >
              <Landmark className="w-4 h-4" />
              Affordability Hub (Calculator)
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER WORKSPACE */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!student ? (
          <EntranceExam onOnboardComplete={handleOnboardComplete} />
        ) : (
          <div className="animate-fade-in">
            {activeTab === 'classroom' && (
              <Classroom
                student={student}
                cohort={cohort}
                onUpdateScores={handleUpdateScores}
              />
            )}
            {activeTab === 'hallway' && (
              <Hallway
                student={student}
                onUpdateScores={handleUpdateScores}
              />
            )}
            {activeTab === 'financials' && (
              <FinancialDashboard />
            )}
          </div>
        )}
      </main>

      {/* FOOTER ACCREDITATION LOGS (Section 1.4 Dubai Knowledge Park rules) */}
      <footer className="bg-slate-100 border-t border-gray-200 py-6 shrink-0 text-center select-none font-sans text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <div className="flex flex-wrap justify-center items-center gap-5 text-[10px] tracking-wide font-mono uppercase">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Dubai Knowledge Park
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1 font-medium">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
              KHDA Accredited Human Overviews
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span>Kurikulum Merdeka + Cambridge Standards</span>
          </div>
          <p className="text-[10px] text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Academicians homeschooling initiative. Formulated by the Accelerating Particles Research Department (Iftitah, Alif, Hafidz). All rights reserved © 2026. Certified under Dubai Free Zone Company creation number PP-17-2010.
          </p>
        </div>
      </footer>

    </div>
  );
}
