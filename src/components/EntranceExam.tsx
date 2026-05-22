import React, { useState } from 'react';
import { Sparkles, Trophy, BookOpen, BrainCircuit, ArrowRight, UserCheck, ShieldCheck, RefreshCw } from 'lucide-react';
import { StudentProfile, BigFiveTraits, Cohort } from '../types';

interface OnboardProps {
  onOnboardComplete: (student: StudentProfile, cohort: any) => void;
}

export default function EntranceExam({ onOnboardComplete }: OnboardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState<'IGCSE Grade 9' | 'IGCSE Grade 10' | 'AS/A Level Grade 11' | 'AS/A Level Grade 12'>('IGCSE Grade 10');

  // SAT Mock Answers State
  const [satAnswers, setSatAnswers] = useState({
    lit1: '',
    lit2: '',
    math1: '',
    math2: '',
  });

  // Big Five State (1-10)
  const [traits, setTraits] = useState<BigFiveTraits>({
    openness: 7,
    conscientiousness: 6,
    extraversion: 5,
    agreeableness: 8,
    neuroticism: 4
  });

  // Result state
  const [placementResult, setPlacementResult] = useState<{ student: StudentProfile; cohort: any } | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSatAnswers(prev => ({ ...prev, [name]: value }));
  };

  const handleTraitChange = (key: keyof BigFiveTraits, val: number) => {
    setTraits(prev => ({ ...prev, [key]: val }));
  };

  const proceedToExams = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setStep(2);
  };

  const proceedToTraits = () => {
    setStep(3);
  };

  const submitPlacementTest = async () => {
    setLoading(true);
    setStep(4);

    // Score evaluation:
    // Simple mock SAT scoring
    let satLit = 500;
    let satMath = 500;

    // Lit 1: Reading Context. Option B is correct
    if (satAnswers.lit1 === 'B' || satAnswers.lit1.toLowerCase().includes('empirical')) satLit += 150;
    // Lit 2: Synonyms. Option A is correct
    if (satAnswers.lit2 === 'A' || satAnswers.lit2.toLowerCase().includes('stagnant')) satLit += 150;
    // Math 1: Quadratic. Option C is correct
    if (satAnswers.math1 === 'C' || satAnswers.math1.includes('9')) satMath += 150;
    // Math 2: Sequence. Option D is correct
    if (satAnswers.math2 === 'D' || satAnswers.math2.includes('27')) satMath += 150;

    try {
      const response = await fetch('/api/onboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          grade,
          satLiteracy: satLit,
          satMath: satMath,
          bigFive: traits,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlacementResult(data);
      } else {
        // Fallback simulation
        const fallbackStudent: StudentProfile = {
          id: 'user-' + Date.now(),
          name,
          email,
          role: 'student',
          satLiteracyScore: satLit,
          satMathScore: satMath,
          totalSat: satLit + satMath,
          traits,
          grade,
          academicScore: 82,
          attitudeScore: 85,
          peerPoints: 20,
          cohortId: 'Cohort Omega'
        };
        const fallbackCohort = {
          name: '🌌 Cohort Omega (Synergistic Thinkers)',
          description: 'Designed for intellectual synthesis. Blends analytical discipline with creative openness to create a stable high-achiever workspace.',
          traitCompatibilityRating: 88,
          members: [
            { id: "peer1", name: "Siti Rahma", avatar: "👩‍💻", traits: { openness: 6, conscientiousness: 9, extraversion: 5, agreeableness: 8, neuroticism: 3 }, satScore: 1480, roleDescription: "Logistics Anchor" },
            { id: "peer2", name: "Farhan Malik", avatar: "🧑‍🏫", traits: { openness: 8, conscientiousness: 5, extraversion: 7, agreeableness: 5, neuroticism: 7 }, satScore: 1430, roleDescription: "Dynamic Catalyst" }
          ]
        };
        setPlacementResult({ student: fallbackStudent, cohort: fallbackCohort });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="entrance-exam-main">
      {/* Header Panel */}
      <div className="text-center mb-10">
        <span className="px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
          AL-WILDAN 3 BSD CITY Research Project
        </span>
        <h1 className="text-4xl font-sans tracking-tight font-bold text-gray-900 mt-4" id="platform-title">
          Academicians
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto font-sans leading-relaxed">
          Affordable, formal homeschool cohorting combining high-frequency SAT standards, Cambridge AS/A licensing, and Vygotskian Zone of Proximal Development metrics.
        </p>
      </div>

      {/* Progress Wizard */}
      <div className="grid grid-cols-4 gap-4 mb-8 bg-gray-50 p-2.5 rounded-2xl border border-gray-100/80">
        <button
          onClick={() => step >= 1 && setStep(1)}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs transition ${
            step === 1 ? 'bg-white shadow-sm text-indigo-600 border border-gray-200/50' : 'text-gray-400 hover:text-gray-600'
          }`}
          disabled={step === 4}
        >
          <UserCheck className="w-4 h-4" />
          <span className="hidden md:inline">1. Registration</span>
        </button>
        <button
          onClick={() => step >= 2 && setStep(2)}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs transition ${
            step === 2 ? 'bg-white shadow-sm text-indigo-600 border border-gray-200/50' : 'text-gray-400 hover:text-gray-600'
          }`}
          disabled={step === 4 || !name || !email}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden md:inline">2. Diagnostic SAT</span>
        </button>
        <button
          onClick={() => step >= 3 && setStep(3)}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs transition ${
            step === 3 ? 'bg-white shadow-sm text-indigo-600 border border-gray-200/50' : 'text-gray-400 hover:text-gray-600'
          }`}
          disabled={step === 4 || !name || !email}
        >
          <BrainCircuit className="w-4 h-4" />
          <span className="hidden md:inline">3. Psychometric</span>
        </button>
        <div
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs transition ${
            step === 4 ? 'bg-white shadow-sm text-indigo-600 border border-gray-200/50' : 'text-gray-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="hidden md:inline">4. Placement</span>
        </div>
      </div>

      {/* STEP 1: PERSONAL ID DESIGN */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm" id="step1-card">
          <div className="flex items-start gap-4 mb-6">
            <span className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-sans font-semibold text-gray-900">Student Enrollment Registry</h2>
              <p className="text-sm text-gray-500 mt-0.5">Please provide basic credentials to initialize your psychometric and SAT curriculum mapping databases.</p>
            </div>
          </div>

          <form onSubmit={proceedToExams} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alif Kenzie Wibiyoso"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder-gray-400 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alifkenzie77@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm placeholder-gray-400 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Target Cambridge Curriculum Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {(['IGCSE Grade 9', 'IGCSE Grade 10', 'AS/A Level Grade 11', 'AS/A Level Grade 12'] as const).map(g => (
                  <label
                    key={g}
                    className={`flex flex-col p-3 border rounded-xl cursor-pointer text-center transition hover:bg-slate-50 ${
                      grade === g ? 'border-indigo-500 bg-indigo-50/20 text-indigo-700 font-medium' : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <span className="text-xs">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm"
              >
                Proceed to Diagnostic Examen
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: DIAGNOSTIC SAT EXAM */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm" id="step2-card">
          <div className="flex items-start gap-4 mb-6">
            <span className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-sans font-semibold text-gray-900">Academic Scholastic Diagnostic</h2>
              <p className="text-sm text-gray-500 mt-0.5 mt-0.5">We measure scholastic level against official SAT math & English frameworks (scoring range: 800-1600 cumulative) to align your cohort intellectual dynamic accurately.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-100">
              <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-teal-100 text-teal-800 font-medium tracking-wide uppercase">
                Section I: Academic English Literacy
              </span>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  <strong>Question 1:</strong> Researchers studying atmospheric dispersion coefficients have noted that while initial projections relied heavily on hypothetical fluid dynamics, modern assessments utilize ________ evidence to construct reliable microclimatic models.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {['A) speculative', 'B) empirical', 'C) subjective', 'D) intuitive'].map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer text-xs transition ${
                        satAnswers.lit1 === opt[0] ? 'border-teal-500 bg-teal-50/20 text-teal-800' : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lit1"
                        value={opt[0]}
                        checked={satAnswers.lit1 === opt[0]}
                        onChange={() => setSatAnswers(p => ({ ...p, lit1: opt[0] }))}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/60">
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  <strong>Question 2:</strong> In the text, the term "lethargic" is closest in synonymity to which of the following expressions?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {['A) stagnant', 'B) buoyant', 'C) competitive', 'D) dynamic'].map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer text-xs transition ${
                        satAnswers.lit2 === opt[0] ? 'border-teal-500 bg-teal-50/20 text-teal-800' : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lit2"
                        value={opt[0]}
                        checked={satAnswers.lit2 === opt[0]}
                        onChange={() => setSatAnswers(p => ({ ...p, lit2: opt[0] }))}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-100">
              <span className="px-2.5 py-1 text-[10px] font-mono rounded bg-amber-100 text-amber-800 font-medium tracking-wide uppercase">
                Section II: Scholastic Math & Logic
              </span>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  <strong>Question 3:</strong> Solve for $y$: If $3 \cdot y - 12 = 15$. What is $y$?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {['A) 3', 'B) 6', 'C) 9', 'D) 12'].map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer text-xs transition ${
                        satAnswers.math1 === opt[0] ? 'border-amber-500 bg-amber-50/20 text-amber-800' : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="math1"
                        value={opt[0]}
                        checked={satAnswers.math1 === opt[0]}
                        onChange={() => setSatAnswers(p => ({ ...p, math1: opt[0] }))}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/60">
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                  <strong>Question 4:</strong> What is the next term in the geometric sequence: $1, 3, 9, \dots$?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {['A) 12', 'B) 18', 'C) 21', 'D) 27'].map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer text-xs transition ${
                        satAnswers.math2 === opt[0] ? 'border-amber-500 bg-amber-50/20 text-amber-800' : 'border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="math2"
                        value={opt[0]}
                        checked={satAnswers.math2 === opt[0]}
                        onChange={() => setSatAnswers(p => ({ ...p, math2: opt[0] }))}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                Back to registry
              </button>
              
              <button
                onClick={proceedToTraits}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
              >
                Continue to Personality Form
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: BIG FIVE PERSONALITY SYSTEM */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm" id="step3-card">
          <div className="flex items-start gap-4 mb-6">
            <span className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <BrainCircuit className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-sans font-semibold text-gray-900">Big Five Psychometric Analysis</h2>
              <p className="text-sm text-gray-500 mt-0.5">We map your emotional and cognitive framework to configure healthy cohort tension (Conflict Axis & Social Glue) under Dubai KHDA guidelines.</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Trait Slider 1 */}
            <div className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Openness to Experience</span>
                <span className="text-xs font-mono font-bold text-purple-600 px-2 py-0.5 bg-purple-100 rounded">{traits.openness}/10</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Imaginative, curious, and experimental vs. structured, traditional, and routine-oriented.</p>
              <input
                type="range"
                min="1"
                max="10"
                value={traits.openness}
                onChange={e => handleTraitChange('openness', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            {/* Trait Slider 2 */}
            <div className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Conscientiousness</span>
                <span className="text-xs font-mono font-bold text-indigo-600 px-2 py-0.5 bg-indigo-100 rounded">{traits.conscientiousness}/10</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Goal-directed, self-disciplined, rule-governed vs. spontaneous, causal, and flexible.</p>
              <input
                type="range"
                min="1"
                max="10"
                value={traits.conscientiousness}
                onChange={e => handleTraitChange('conscientiousness', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[10px] text-amber-600 font-medium block mt-1">⚠️ Sits directly opposite Openness as the core Group Conflict Axis</span>
            </div>

            {/* Trait Slider 3 */}
            <div className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Extraversion</span>
                <span className="text-xs font-mono font-bold text-teal-600 px-2 py-0.5 bg-teal-100 rounded">{traits.extraversion}/10</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Vocal, outgoing, energetic and competitive vs. reserved, quiet, and highly focused.</p>
              <input
                type="range"
                min="1"
                max="10"
                value={traits.extraversion}
                onChange={e => handleTraitChange('extraversion', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            {/* Trait Slider 4 */}
            <div className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Agreeableness</span>
                <span className="text-xs font-mono font-bold text-emerald-600 px-2 py-0.5 bg-emerald-100 rounded">{traits.agreeableness}/10</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Empathetic, trusting, helpful mediator vs. challenging, skeptical, and fiercely competitive.</p>
              <input
                type="range"
                min="1"
                max="10"
                value={traits.agreeableness}
                onChange={e => handleTraitChange('agreeableness', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Trait Slider 5 */}
            <div className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Neuroticism</span>
                <span className="text-xs font-mono font-bold text-rose-600 px-2 py-0.5 bg-rose-100 rounded">{traits.neuroticism}/10</span>
              </div>
              <p className="text-[11px] text-gray-500 mb-3">Emotional sensitivity and stress catalyst vs. stable, secure, and confident.</p>
              <input
                type="range"
                min="1"
                max="10"
                value={traits.neuroticism}
                onChange={e => handleTraitChange('neuroticism', Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <span className="text-[10px] text-gray-500 block mt-1">💡 Optimal Group Catalyst points are between 4 and 7 to inspire healthy empathy.</span>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium"
              >
                Back to SAT exams
              </button>
              
              <button
                onClick={submitPlacementTest}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-sm font-semibold"
              >
                Analyze & Align Cohort
                <Sparkles className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: INTENSIVE MATCHING PORTAL */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm text-center min-h-[400px] flex flex-col justify-center items-center">
          {loading ? (
            <div className="space-y-4 animate-fade-in" id="loading-spinner">
              <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
              <h3 className="text-xl font-sans font-semibold text-gray-900">Calculating Social Compatibility Matrix</h3>
              <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed font-mono">
                Running cluster algorithm against active classroom databases...<br/>
                Mapping SAT scores ({800 + Math.floor(Math.random() * 400)}) against Big Five peer profiles...
              </p>
            </div>
          ) : (
            placementResult && (
              <div className="w-full max-w-2xl text-left space-y-6">
                <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                  <span className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <ShieldCheck className="w-6 h-6" />
                  </span>
                  <div>
                    <h3 className="text-lg font-sans font-bold text-gray-900">Assessment Complete! Profile Configured successfully.</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Your diagnostics successfully computed: **SAT Score: {placementResult.student.totalSat}/1600** (English: {placementResult.student.satLiteracyScore} | Math: {placementResult.student.satMathScore}). Group limits maintained under 12.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white">
                  <div className="bg-indigo-900 px-6 py-4 text-white">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300">ZPD Placement Result</span>
                    <h4 className="text-lg font-sans font-bold mt-1 text-white">{placementResult.cohort.name}</h4>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{placementResult.cohort.description}</p>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Cohort Trait Compatibility</span>
                        <span className="text-xs font-bold text-indigo-600 font-mono">{placementResult.cohort.traitCompatibilityRating}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${placementResult.cohort.traitCompatibilityRating}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">Seeded Classmates (Optimal Dynamics):</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {placementResult.cohort.members.map((member: any) => (
                          <div key={member.id} className="p-3.5 rounded-xl border border-gray-100 bg-slate-50 flex items-start gap-3">
                            <span className="text-2xl">{member.avatar}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{member.name}</p>
                              <p className="text-[10px] text-indigo-600 mt-0.5 select-none">{member.roleDescription}</p>
                              <p className="text-[9px] text-gray-400 font-mono mt-1">SAT: {member.satScore}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400 max-w-xs block leading-normal">
                    Proceed as certified independent pupil. Complete homework helper modules and chat with AI teacher inside the Classroom tab.
                  </p>
                  
                  <button
                    onClick={() => onOnboardComplete(placementResult.student, placementResult.cohort)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition font-semibold"
                  >
                    Enter Platform Workspace
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
