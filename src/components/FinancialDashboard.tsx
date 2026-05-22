import React, { useState, useEffect } from 'react';
import { Landmark, TrendingUp, DollarSign, Percent, HelpCircle, AlertCircle, Building, PiggyBank } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function FinancialDashboard() {
  // Calculator state variables
  const [initialExam, setInitialExam] = useState<number>(60);
  const [finalExam, setFinalExam] = useState<number>(85);
  const [initialAttitude, setInitialAttitude] = useState<number>(70);
  const [finalAttitude, setFinalAttitude] = useState<number>(90);
  const [sessions, setSessions] = useState<number>(12);

  const [reductionResult, setReductionResult] = useState<any>({
    initialComposite: 64,
    finalComposite: 87,
    improvementDelta: 23,
    improvementPerSession: 1.9,
    discountPercentage: 35,
    actualTuitionIDR: 65000
  });

  // Calculate whenever sliders alter
  useEffect(() => {
    const calculateReduction = async () => {
      try {
        const res = await fetch('/api/fee-reduction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            initialExam,
            finalExam,
            initialAttitude,
            finalAttitude,
            sessions
          })
        });

        if (res.ok) {
          const data = await res.json();
          setReductionResult(data);
        }
      } catch (err) {
        console.error("Tuition reduction evaluation failed.", err);
      }
    };

    calculateReduction();
  }, [initialExam, finalExam, initialAttitude, finalAttitude, sessions]);

  // Seeded Student learning trajectory data for Recharts Areas
  const trajectoryData = [
    { name: 'Sess 1', score: initialExam, tuitionRate: 100000 },
    { name: 'Sess 4', score: Math.round(initialExam + (finalExam - initialExam) * 0.25), tuitionRate: Math.round(100000 - (reductionResult.discountPercentage * 0.2) * 1000) },
    { name: 'Sess 8', score: Math.round(initialExam + (finalExam - initialExam) * 0.65), tuitionRate: Math.round(100000 - (reductionResult.discountPercentage * 0.6) * 1000) },
    { name: 'Sess 12', score: finalExam, tuitionRate: reductionResult.actualTuitionIDR }
  ];

  // Budget comparison data from Paper Section 1.4 & 1.5
  // Itemized in Millions IDR
  const budgetComparisonData = [
    {
      phase: 'Pilot (50 studs)',
      operatingCost: 996, // Average of 734M - 1258M
      securedFunding: 1020, // Average of 750M - 1290M
      counselors: 1,
      headmasterSalary: 585 // average 450M - 720M
    },
    {
      phase: 'Year 1 (50 studs)',
      operatingCost: 872, // Average of 651M - 1093M
      securedFunding: 910, // Average 700M - 1120M
      counselors: 1,
      headmasterSalary: 585
    },
    {
      phase: 'Yr 2 & 3 (300 studs)',
      operatingCost: 1275, // Average of 946M - 1605M
      securedFunding: 1595, // Average 1310M - 1880M
      counselors: 1,
      headmasterSalary: 585
    },
    {
      phase: 'Yr 4 & 5 (2500 studs)',
      operatingCost: 4862, // Average 3454M - 6270M
      securedFunding: 5075, // Average 3550M - 6600M
      counselors: 8,
      headmasterSalary: 585
    },
    {
      phase: 'Year 6 (10000 studs)',
      operatingCost: 19112, // Average 13.5B - 24.7B
      securedFunding: 19400, // Average 13.8B - 25B
      counselors: 33,
      headmasterSalary: 585
    }
  ];

  // Formatting currency helper
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="space-y-6" id="finance-dashboard-workspace">
      
      {/* Intro info bar */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-300">Financial Demands & Models</span>
          <h2 className="text-xl font-sans font-bold text-white">Academicians Fiscal Affordability & Support Matrix</h2>
          <p className="text-xs text-slate-400">Targeting low-income homeschool families. Maximizing tuition efficiency through performance-based discounts and global foundations.</p>
        </div>
        <div className="flex gap-4 shrink-0 font-sans">
          <div className="px-4 py-2 border border-slate-800 bg-slate-950/60 rounded-xl text-center">
            <span className="text-[9px] uppercase text-slate-400 block font-medium">Standard Tuition Fee</span>
            <span className="text-sm font-bold font-mono text-emerald-400">100.000 IDR / mo</span>
          </div>
          <div className="px-4 py-2 border border-slate-800 bg-slate-950/60 rounded-xl text-center">
            <span className="text-[9px] uppercase text-slate-400 block font-medium">Target Cost Limit</span>
            <span className="text-sm font-bold font-mono text-indigo-300">50.000 IDR / mo</span>
          </div>
        </div>
      </div>

      {/* BLOCK I: DUAL GRID CONTROLLER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tuition Fee percentage reduction controller (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-5" id="reduction-calculator">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Fee Reduction Calculator</h3>
          </div>

          <div className="space-y-4 font-sans">
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-700 font-medium">Baseline Weekly Exam Score</span>
                <span className="font-mono font-bold text-indigo-600">{initialExam}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={initialExam}
                onChange={e => setInitialExam(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-700 font-medium">Target/Final Exam Score (60% weight)</span>
                <span className="font-mono font-bold text-indigo-600">{finalExam}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={finalExam}
                onChange={e => setFinalExam(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-700 font-medium">Initial Classroom Attitude Dynamic</span>
                <span className="font-mono font-bold text-teal-600">{initialAttitude}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                value={initialAttitude}
                onChange={e => setInitialAttitude(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-700 font-medium">Final Attitude Improvement Score (40% weight)</span>
                <span className="font-mono font-bold text-teal-600">{finalAttitude}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={finalAttitude}
                onChange={e => setFinalAttitude(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="text-gray-700 font-medium">Active Classroom Seminars Attended</span>
                <span className="font-mono font-bold text-purple-600">{sessions} sessions</span>
              </div>
              <input
                type="range"
                min="4"
                max="24"
                value={sessions}
                onChange={e => setSessions(Number(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-[10px] text-gray-400 block mt-1.5 leading-normal">
                💡 Formula: Composite score improvement over sessions calculated month-over-month. Standard flat tuition of 100k IDR reduces by max 50%.
              </span>
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-3">
            <span className="text-[9px] tracking-wider uppercase text-indigo-500 font-mono font-medium">Composite Computation</span>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-gray-500 block">Reduction Margin</span>
                <span className="text-lg font-bold font-mono text-indigo-700">{reductionResult.discountPercentage}% rebate</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 block">Net Monthly Fee</span>
                <span className="text-base font-bold font-mono text-emerald-600">{formatIDR(reductionResult.actualTuitionIDR)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trajectory Recharts (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-gray-150 shadow-sm flex flex-col justify-between" id="trajectory-chart-container">
          <div>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-1.5">Learning Trajectory vs Scholarship Curve</h4>
            <p className="text-xs text-gray-400 leading-normal mb-4 font-sans">
              Visualizing the slope connection between average monthly student performance composite index (out of 100) and net families tuition costs index.
            </p>
          </div>

          <div className="w-full h-[260px] font-mono text-[9px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="costColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" name="Academic Rank Index" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                <Area type="monotone" name="Tuition cost (IDR)" dataKey="tuitionRate" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#costColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl border border-gray-100 bg-slate-50 flex gap-2 items-start mt-2">
            <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-500 leading-normal font-sans">
              <strong>ZPD Integration note:</strong> As progress continues linearly, tuition is reduced dynamically. Under Vygotskian guidelines, scaffolding translates continuous effort into accessible economic freedom.
            </p>
          </div>
        </div>

      </div>

      {/* BLOCK II: ACADEMICIANS BUDGET SCALING FORECASTER */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-4">
        <div>
          <h4 className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-1.5">6-Year Scaling Operating Costs & Foundations Support (Section 1.4 & 1.5)</h4>
          <p className="text-xs text-gray-405 leading-normal max-w-3xl font-sans">
            Academicians operates out of **Dubai Knowledge Park** using human certifiers for legal KHDA/Cambridge accreditation.
            Our finances combine organic families tuition with major Corporate Social Responsibility (CSR) backing (e.g. Ronald Foundation CSR & Naming Rights, Bakti BCA). Values represent approximate calculations in **Millions IDR (Rupiah)**.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Recharts Bar Compare Chart (8 cols) */}
          <div className="lg:col-span-8 w-full h-[320px] font-mono text-[9px]" id="budget-bar-compare">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="phase" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip formatter={(value) => `${value} Million IDR`} />
                <Legend />
                <Bar name="Annual Operating Cost" dataKey="operatingCost" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar name="Secured CSR & Tuition Funding" dataKey="securedFunding" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scale Metric Cards (4 cols) */}
          <div className="lg:col-span-4 space-y-4 font-sans">
            <div className="p-4 rounded-2xl border border-gray-100 bg-slate-50/70 space-y-2">
              <span className="text-[9px] uppercase font-bold text-indigo-500 font-mono tracking-widest">Active Staff Logistics</span>
              <div className="flex justify-between text-xs font-medium text-gray-700">
                <span>Headmaster salary scope:</span>
                <span className="font-mono text-gray-950">450M - 720M IDR</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-700 pt-1 border-t border-gray-100">
                <span>Counselor staffing ratio:</span>
                <span className="font-mono text-indigo-600">1:300 Students</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-100 bg-slate-50/70 space-y-2">
              <span className="text-[9px] uppercase font-bold text-emerald-500 font-mono tracking-widest">Key Philanthropists</span>
              <p className="text-[11px] text-gray-400 leading-normal">
                Primary funding secured securely from **Ronald Foundation** (aligned with technology quality & social impact in Indonesia) and **Bakti BCA** educational grants.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-indigo-150 bg-indigo-50/20 text-indigo-950 space-y-1">
              <span className="text-[10px] font-bold block uppercase font-mono tracking-wider">Pilot Safety Margin</span>
              <p className="text-[11px] text-indigo-805 leading-normal">
                Our pilot projects secure a solid net margin surplus of **15,675,000 IDR** to insulate low-bandwidth hosting infrastructures.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
