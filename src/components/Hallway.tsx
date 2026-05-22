import React, { useState, useEffect, useRef } from 'react';
import { Users, Hash, Volume2, ArrowRight, Compass, Shield, Plus, MessageCircle, Heart, Award, Star } from 'lucide-react';
import { Club, ClubMessage, StudentProfile } from '../types';

interface HallwayProps {
  student: StudentProfile;
  onUpdateScores: (academicDelta: number, attitudeDelta: number) => void;
}

export default function Hallway({ student, onUpdateScores }: HallwayProps) {
  // Database States
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('general');
  const [messages, setMessages] = useState<ClubMessage[]>([]);
  const [leaderboardCohort, setLeaderboardCohort] = useState<any[]>([]);
  const [leaderboardGlobal, setLeaderboardGlobal] = useState<any[]>([]);

  // Local interactive UI state
  const [inputText, setInputText] = useState('');
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubTags, setNewClubTags] = useState('');
  const [inVoice, setInVoice] = useState(false);

  // Fetch initial clubs and leaderboards
  const loadClubsAndScores = async () => {
    try {
      const clubsRes = await fetch('/api/clubs');
      if (clubsRes.ok) {
        const data = await clubsRes.json();
        setClubs(data.clubs);
        if (data.clubs.length > 0 && !selectedClub) {
          setSelectedClub(data.clubs[0]);
        } else if (selectedClub) {
          // Keep current selection matched
          const updated = data.clubs.find((c: Club) => c.id === selectedClub.id);
          if (updated) setSelectedClub(updated);
        }
      }

      const lRes = await fetch('/api/leaderboards');
      if (lRes.ok) {
        const scores = await lRes.json();
        setLeaderboardCohort(scores.cohortScores);
        setLeaderboardGlobal(scores.crossCohortScores);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadClubsAndScores();
  }, []);

  // Monitor selected channel messages updates
  useEffect(() => {
    if (selectedClub) {
      const msgs = selectedClub.messages[selectedChannelId] || [];
      setMessages(msgs);
    }
  }, [selectedClub, selectedChannelId]);

  // Submit chat channel message
  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedClub) return;

    try {
      const res = await fetch(`/api/clubs/${selectedClub.id}/channels/${selectedChannelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          avatar: "🎓",
          content: inputText,
          studentId: student.id
        })
      });

      if (res.ok) {
        setInputText('');
        // Trigger reload to show simulation synchronized immediately
        await loadClubsAndScores();
        // Give minor attitude point increment for peer collaboration
        onUpdateScores(0, 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create new club
  const handleCreateClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim() || !newClubDesc.trim()) return;

    try {
      const tagsArray = newClubTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClubName,
          description: newClubDesc,
          tags: tagsArray,
          creator: student.name
        })
      });

      if (res.ok) {
        setNewClubName('');
        setNewClubDesc('');
        setNewClubTags('');
        setShowCreateClub(false);
        await loadClubsAndScores();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Join Voice Node
  const handleToggleVoice = () => {
    onUpdateScores(0, !inVoice ? 3 : -3); // give points for active social audio participation, deduct when leaving
    setInVoice(prev => !prev);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="hallway-hub">
      {/* COLUMN I: CLIQUES/CLUBS DISCORD LIST (3 cols) */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Clique servers sidebar */}
        <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Your Societies</h4>
            <button
              onClick={() => setShowCreateClub(true)}
              className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition"
              title="Form a new clique server"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {clubs.map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedClub(c);
                  setSelectedChannelId('general');
                  setInVoice(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition ${
                  selectedClub?.id === c.id
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-transparent text-gray-650 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className="text-[10px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md font-mono select-none text-[8px] group-hover:bg-indigo-700">
                  {c.memberCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected server Channels Panel */}
        {selectedClub && (
          <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-sm space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-widest">Workspace</span>
              <h3 className="text-sm font-bold text-gray-800 mt-1 truncate">{selectedClub.name}</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider font-mono">💬 Text Channels</span>
                <div className="space-y-1 mt-1.5">
                  {selectedClub.channels.filter(ch => ch.type === 'text').map(ch => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannelId(ch.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs transition ${
                        selectedChannelId === ch.id
                          ? 'bg-indigo-50 text-indigo-750 font-bold border border-indigo-100'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
                      }`}
                    >
                      <Hash className="w-3.5 h-3.5" />
                      <span>{ch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider font-mono">🔊 Voice Lounges</span>
                <div className="space-y-1 mt-1.5">
                  {selectedClub.channels.filter(ch => ch.type === 'voice').map(ch => (
                    <button
                      key={ch.id}
                      onClick={handleToggleVoice}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition ${
                        inVoice
                          ? 'bg-rose-50 text-rose-750 font-bold border border-rose-100'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="truncate">{ch.name}</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full ${inVoice ? 'bg-rose-500 animate-ping' : 'bg-transparent'}`}></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COLUMN II: CHANNEL FEED / DISCOVERY CENTER (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        {selectedClub && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[550px] overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-gray-150 shrink-0 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-indigo-600 uppercase">Sociedad clique topic</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-bold text-gray-800">{selectedChannelId}</span>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedClub.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-[9px] font-semibold text-indigo-600 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-[10px] text-gray-400 text-center select-none py-1 block">
                🛡️ Moderated under UNICEF Child Safeguarding Rules & COPPA Standards.
              </p>

              {messages.map(msg => (
                <div key={msg.id} className="flex gap-3 text-xs items-start animate-fade-in text-gray-700">
                  <span className="text-2xl pt-0.5 select-none">{msg.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-gray-900">{msg.studentName}</span>
                      <span className="text-[9px] text-gray-400">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1 font-sans">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handlePostMessage} className="p-4 border-t border-gray-150 bg-slate-50/50 flex gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Post message block safely in #${selectedChannelId}...`}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 border border-gray-200 bg-white"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-xs whitespace-nowrap"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* Discovery Feed card of suggested clubs */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Platform Discovery</h3>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed mb-4">
            Collaborative assignments are issued randomly in week 2. Discover study cliques registered in Indonesia and claim peer study points!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-150 rounded-2xl space-y-2">
              <h5 className="text-xs font-bold text-gray-900">🧬 Bio-Tech CRISPR Lab</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">Exploring genetic splicing and molecular structures unitarily. Pre-recorded lecture summaries discussed in voice lounge.</p>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 py-0.5 px-2 rounded">Science</span>
                <button
                  onClick={() => onUpdateScores(0, 1)}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  Join Clique
                </button>
              </div>
            </div>

            <div className="p-4 border border-gray-150 rounded-2xl space-y-2">
              <h5 className="text-xs font-bold text-gray-900">🗣️ Debate Society (ASEAN)</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">Sharpening presentation skill sets and economic reframing. Supporting SAT essay prep structures weekly.</p>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-[9px] font-mono bg-purple-50 text-purple-600 py-0.5 px-2 rounded">Literacy</span>
                <button
                  onClick={() => onUpdateScores(0, 1)}
                  className="text-[10px] text-indigo-600 font-bold hover:underline"
                >
                  Join Clique
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMN III: INTELLECTUAL SCOREBOARDS (3 cols) */}
      <div className="lg:col-span-3 space-y-4">
        {/* Cohort private Mastery scoreboard (Section 1.1.2 Scoreboard list) */}
        <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-1 text-indigo-600">
              <Award className="w-4 h-4" />
              <span className="text-[10px] font-mono tracking-widest font-bold uppercase">Private Cohort Score</span>
            </div>
            <h3 className="text-xs font-bold text-gray-800 mt-1 uppercase">Mastery & Peer-teaching</h3>
          </div>

          <div className="space-y-2.5">
            {leaderboardCohort.map((student, idx) => (
              <div key={student.id} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold font-mono ${
                    idx === 0 ? 'bg-amber-100 text-amber-800' : idx === 1 ? 'bg-slate-100 text-slate-800' : 'bg-slate-50 text-gray-550'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className="text-gray-850 truncate font-sans">{student.name}</span>
                </div>
                <span className="font-mono text-[10px] font-bold text-indigo-600 shrink-0">
                  {student.peerPoints} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global recognition public leaderboard (Emphasizes Mastery & complete assessments) */}
        <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-sm space-y-4">
          <div>
            <div className="flex items-center gap-1 text-emerald-600">
              <Star className="w-4 h-4" />
              <span className="text-[10px] font-mono tracking-widest font-bold uppercase">Cross-Cohort Recognition</span>
            </div>
            <h3 className="text-xs font-bold text-gray-800 mt-1 uppercase">Overall Performance Index</h3>
          </div>

          <div className="space-y-2.5">
            {leaderboardGlobal.map((student, idx) => {
              const performanceIndex = Math.round(student.academicScore * 0.6 + student.attitudeScore * 0.4);
              return (
                <div key={student.id} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] select-none">🏆</span>
                    <span className="text-gray-850 truncate font-sans font-medium">{student.name}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-600 shrink-0">
                    {performanceIndex}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CREATE CLIQUE POPUP MODAL */}
      {showCreateClub && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="clique-creation-modal">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-2xl max-w-md w-full scale-in">
            <h3 className="text-lg font-sans font-bold text-gray-900 mb-1">Create Custom Clique Server</h3>
            <p className="text-xs text-gray-500 mb-4">Establish modular forums for Peer-Teaching standards and collaborative project reviews.</p>

            <form onSubmit={handleCreateClubSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1.5">Clique Server Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 🛠️ Aerodynamics Craft Club"
                  value={newClubName}
                  onChange={e => setNewClubName(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1.5">Description (Zone of Proximal focus)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Challenging each other relative to Singapore IGCSE standard forces equations..."
                  value={newClubDesc}
                  onChange={e => setNewClubDesc(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1.5">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Physics, IGCSE, Robotics"
                  value={newClubTags}
                  onChange={e => setNewClubTags(e.target.value)}
                  className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateClub(false)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-neutral-600 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  Launch Clique
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
