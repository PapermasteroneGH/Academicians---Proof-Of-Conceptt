import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Camera, MessageSquare, GraduationCap, Play, CheckCircle2, AlertCircle, HelpCircle, Eye, Sparkles } from 'lucide-react';
import { Lesson, StudentProfile, ExerciseQuestion } from '../types';

interface ClassroomProps {
  student: StudentProfile;
  cohort: any;
  onUpdateScores: (academicDelta: number, attitudeDelta: number) => void;
}

export default function Classroom({ student, cohort, onUpdateScores }: ClassroomProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedTextHighlight, setSelectedTextHighlight] = useState('');
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Sentiment camera state
  const [isCamActive, setIsCamActive] = useState(false);
  const [sentiment, setSentiment] = useState<'focused' | 'confused' | 'curious' | 'fatigued'>('focused');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Chat states
  const [messages, setMessages] = useState<Array<{ id: string; sender: 'user' | 'tutor'; text: string; timestamp: string }>>([
    {
      id: 'init',
      sender: 'tutor',
      text: "Greetings pathfinder! I am your Academicians AI Tutor. I calibrate lessons to your psychological rhythm and Cambridge standards. Ask me anything from our forces & congruence syllabus!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch lessons on mount
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch('/api/lessons');
        if (res.ok) {
          const data = await res.json();
          setLessons(data.lessons);
          if (data.lessons.length > 0) {
            setSelectedLesson(data.lessons[0]);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchLessons();
  }, []);

  // 2. Clear highlight or set highlight on mouse up
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString().trim();
      // Only set if selection is meaningful word length (less than 100 characters)
      if (selectedText.length > 1 && selectedText.length < 150) {
        setSelectedTextHighlight(selectedText);
      }
    }
  };

  // 3. Simulated/Real camera toggle
  const toggleCamera = async () => {
    if (isCamActive) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      mediaStreamRef.current = null;
      setIsCamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCamActive(true);
      } catch (error) {
        // Fallback for iFrame container sandboxes (standard in preview models)
        console.warn("Camera hardware access restricted inside iframe playground. Launching simulation scan feed instead.");
        setIsCamActive(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 4. Submit Chat to Express proxy
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage('');
    
    // Add user message to UI
    const newUserMsgObj = {
      id: Math.random().toString(),
      sender: 'user' as const,
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, newUserMsgObj];
    setMessages(updatedMessages);
    setLoadingAI(true);

    try {
      const res = await fetch('/api/gemini/tutoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMsg,
          sentiment,
          chatHistory: updatedMessages.slice(-5), // last 5 logs
          chapterContext: selectedLesson ? `${selectedLesson.chapter}: ${selectedLesson.title}` : "Forces & Motion"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'tutor' as const,
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        // Enhance attitude points momentarily for AI-guided collaboration
        onUpdateScores(0, 2);
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'tutor' as const,
        text: "My terminal node reports slight lag connecting with Dubai server. Nonetheless, remember: balanced force ($F_{net}=0$) signifies that current acceleration is absolutely zero!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setLoadingAI(false);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingAI]);

  // 5. Submit chapters exercises
  const handleQuizSubmit = () => {
    if (!selectedLesson) return;
    let score = 0;
    const qs = selectedLesson.exerciseQuestions;
    qs.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        score += q.marks;
      }
    });

    const maxMarks = qs.reduce((acc, current) => acc + current.marks, 0);
    const successPercentage = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;
    
    setQuizScore(successPercentage);
    setQuizSubmitted(true);

    // Update parent academic logs
    onUpdateScores(Math.round(successPercentage / 10), 0);
  };

  // Quick dictionary definition mapping local database (Singapore - English Helper)
  const getDefinition = (word: string) => {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    const dictionary: { [key: string]: { eng: string; idn: string } } = {
      velocity: { eng: "The rate of change of displacement with time. Measured in m/s.", idn: "Kecepatan - Laju perubahan perpindahan terhadap waktu." },
      terminal: { eng: "Concluding or bound state, stable velocity reached when total forces equal zero.", idn: "Kecepatan Akhir - Kondisi seimbang gaya berat & hambat udara." },
      congruence: { eng: "State of agreement, modulus equivalence of remainder partitions.", idn: "Kongruensi - Kesetaraan sisa pembagian bilangan bulat." },
      constant: { eng: "A value or quantity that does not alter under changing conditions.", idn: "Konstan - Nilai tetap yang tidak berubah." },
      acceleration: { eng: "The rate of change of velocity per unit of time.", idn: "Percepatan - Laju perubahan kecepatan per satuan waktu." },
      resultant: { eng: "The overall force acting on an object after combining all forces.", idn: "Gaya Resultan - Total keseluruhan gaya yang bekerja pada suatu benda." },
      elastic: { eng: "The ability of a deformed material body to return to its original shape.", idn: "Elastisitas - Kemampuan benda untuk kembali ke bentuk aslinya." },
      modular: { eng: "A mathematical framework partitioning integers into remaining cyclic fields.", idn: "Aritmetika Modular - Cabang matematika yang membagi bilangan bulat." }
    };

    return dictionary[w] || {
      eng: "A technical Cambridge instruction term. Ask your AI tutor on the right panel for further context.",
      idn: "Silakan pilih kata teknik lainnya seperti 'velocity' atau tanyakan AI Tutor."
    };
  };

  const getSimulatedOverlayColor = () => {
    switch (sentiment) {
      case 'focused': return 'border-emerald-500/60 shadow-emerald-50/50';
      case 'confused': return 'border-amber-500/60 shadow-amber-50/50';
      case 'curious': return 'border-sky-500/60 shadow-sky-50/50';
      case 'fatigued': return 'border-rose-500/60 shadow-rose-50/50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="classroom-workspace">
      {/* LEFT COLUMN: CHAPTERS & CONTENT (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Coursebook Index Selector */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Cambridge Accredited Courseware</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lessons.map(l => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedLesson(l);
                  setQuizAnswers({});
                  setQuizSubmitted(false);
                  setQuizScore(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold font-sans transition ${
                  selectedLesson?.id === l.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 text-gray-600 hover:bg-slate-100 border border-gray-100'
                }`}
              >
                {l.chapter}
              </button>
            ))}
          </div>
        </div>

        {/* Lesson markdown reader */}
        {selectedLesson && (
          <div className="bg-white rounded-3xl border border-gray-200/85 overflow-hidden shadow-sm">
            <div className="bg-indigo-950 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-indigo-300 uppercase">{selectedLesson.subject}</span>
                <h2 className="text-xl font-bold font-sans mt-0.5">{selectedLesson.title}</h2>
              </div>
              <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-xs font-mono select-none">
                {selectedLesson.chapter.split(":")[0]}
              </span>
            </div>

            {/* Markdown Text Body */}
            <div 
              className="p-8 prose prose-slate max-w-none text-gray-700 leading-relaxed font-sans cursor-text space-y-5"
              onMouseUp={handleTextSelection}
              id="lesson-text-body"
            >
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100/60 mb-5 flex gap-2 items-center">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-800 leading-tight select-none font-medium">
                  <strong>English Adapting Feature:</strong> Having trouble reading? Select/highlight any word (e.g. <em>congruence</em>, <em>velocity</em>, <em>elastic</em>) with your mouse to view live definition overlays immediately on the side block.
                </p>
              </div>

              {selectedLesson.contentMarkdown.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('###')) {
                  return <h3 key={idx} className="text-lg font-bold text-gray-900 mt-6 mb-2 border-b border-gray-100 pb-1">{paragraph.replace('###', '').trim()}</h3>;
                }
                const formatted = paragraph.replace(/\$\$(.*?)\$\$/g, '$1').replace(/\$(.*?)\$/g, '$1');
                return <p key={idx} className="text-sm font-sans">{formatted}</p>;
              })}
            </div>

            {/* Lesson Exercises (Section 1.1.3 Assessment guidelines) */}
            <div className="bg-slate-50 p-8 border-t border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                End of Chapter Practice Set
              </h3>
              <p className="text-xs text-gray-500 mb-5">Answer these exam-style questions UNITARILY to gauge your cohort's performance rating and claim tuition reduction margin.</p>

              <div className="space-y-6">
                {selectedLesson.exerciseQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="text-xs font-semibold text-gray-800 leading-relaxed">
                        <span className="font-mono text-indigo-600 mr-2">Question {idx + 1}:</span>
                        {q.questionText}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded">
                        [{q.marks} marks]
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      {q.options?.map(opt => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer text-xs transition ${
                            quizAnswers[q.id] === opt
                              ? 'border-indigo-500 bg-indigo-50/20 text-indigo-800 font-medium'
                              : 'border-gray-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${q.id}`}
                            value={opt}
                            checked={quizAnswers[q.id] === opt}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className="text-indigo-600 focus:ring-indigo-500"
                            disabled={quizSubmitted}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Score panel */}
                {quizSubmitted && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    (quizScore || 0) >= 70 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
                  }`}>
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                      <p className="text-sm font-bold">Answers registered!</p>
                      <p className="text-xs">Your Subject Mastery Score: <strong className="font-mono text-sm">{quizScore}%</strong> (Directly mapped to 60% of your progress metric).</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < selectedLesson.exerciseQuestions.length}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 hover:shadow text-white text-xs font-semibold transition disabled:opacity-50"
                    >
                      Verify Answers unitarily
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizAnswers({});
                        setQuizSubmitted(false);
                        setQuizScore(null);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold transition"
                    >
                      Re-attempt Chapter Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: RECOGNITION PANEL / DUAL SIDE PANEL (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* English Highlight Translate Overlay Block */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm" id="language-adapter-block">
          <div className="flex items-center gap-2 mb-3.5">
            <span className="p-1 px-2 rounded bg-indigo-100 text-indigo-600 text-xs font-mono font-bold select-none">IDN</span>
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Singapore-English Adapter</h4>
          </div>
          
          {selectedTextHighlight ? (
            <div className="space-y-3 font-sans animate-fade-in">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <span className="text-[10px] font-mono text-indigo-500 uppercase">Selected phrase</span>
                <p className="text-xs font-bold text-gray-800 mt-1">"{selectedTextHighlight}"</p>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-mono text-gray-400 block uppercase">Technical Definition (English)</span>
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{getDefinition(selectedTextHighlight).eng}</p>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[9px] font-mono text-gray-400 block uppercase font-medium">Indonesian Equivalent</span>
                  <p className="text-xs text-indigo-700 leading-relaxed mt-0.5">{getDefinition(selectedTextHighlight).idn}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedTextHighlight('')}
                className="w-full mt-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition text-[10px] font-medium"
              >
                Clear highlight block
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed py-4 text-center select-none font-sans">
              Highlight phrase blocks inside the course book text to activate instant dictionary adaptation cards.
            </p>
          )}
        </div>

        {/* Realtime AI Sentiment Camera Overlay */}
        <div className="bg-white rounded-3xl p-5 border border-gray-150 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-rose-500" />
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Affective Sentiment Cam</h4>
            </div>
            <button
              onClick={toggleCamera}
              className={`px-3 py-1 text-[10px] font-medium rounded-lg transition ${
                isCamActive ? 'bg-rose-500 text-white' : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {isCamActive ? 'Deactivate Cam' : 'Activate Scan'}
            </button>
          </div>

          {isCamActive ? (
            <div className="space-y-4">
              <div className={`relative aspect-video rounded-2xl overflow-hidden border-2 bg-slate-900 ${getSimulatedOverlayColor()} shadow-md transition-all duration-300`}>
                
                {/* Simulated frame telemetry overlay */}
                <div className="absolute inset-0 bg-transparent pointer-events-none flex flex-col justify-between p-3 select-none">
                  <div className="flex justify-between text-[10px] font-mono text-white/80 bg-black/35 rounded-md p-1 backdrop-blur-xs">
                    <span>FEED: STU-CAM-01</span>
                    <span>FPS: 24</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold bg-black/40 px-2 py-0.5 rounded">SENTIMENT: {sentiment.toUpperCase()}</span>
                    <span className="text-[9px] font-mono text-white/50">DUBAI ACCREDITED</span>
                  </div>
                </div>

                {/* Webcam placeholder (due to platform sandboxing) */}
                <div className="w-full h-full flex flex-col items-center justify-center text-center text-white p-4">
                  <span className="text-4xl animate-pulse mb-1">
                    {sentiment === 'focused' ? '⚡' : sentiment === 'confused' ? '🤔' : sentiment === 'curious' ? '😮' : '😫'}
                  </span>
                  <p className="text-xs font-mono font-medium tracking-wide">STUDENT FACIAL SCANNING...</p>
                  <p className="text-[9px] text-gray-400 mt-1 px-4 leading-normal font-sans">Computer vision scanning coordinates emotional tension vs learning resistance coefficient.</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 block font-medium">Force Affective state to Tutor prompt:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['focused', 'confused', 'curious', 'fatigued'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSentiment(s)}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold capitalize transition ${
                        sentiment === s
                          ? 'bg-igo bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-gray-500 border border-gray-150'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-amber-600 leading-normal font-sans pt-1">
                  💡 <em>Your simulated sentiment updates the prompt payload dynamically, letting the AI adapt vocabulary and break sequences constructively.</em>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed text-center py-6 select-none font-sans">
              Enable the sentiment camera to initiate computer-vision feedback with the AI Chatbot Teacher.
            </p>
          )}
        </div>

        {/* AI Tutor Chat Container */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
          <div className="bg-slate-50 px-4 py-3 border-b border-gray-150 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Interactive AI Coach</h4>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Securely connected to server side Gemini engine"></span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto items-end animate-fade-in' : 'mr-auto items-start animate-fade-in'
                }`}
              >
                <span className="text-[9px] text-gray-400 mb-0.5">{m.sender === 'user' ? 'You' : 'Academicians AI'} • {m.timestamp}</span>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs font-medium'
                      : 'bg-slate-100 text-gray-800 rounded-tl-none border border-gray-200/50'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loadingAI && (
              <div className="flex flex-col items-start mr-auto max-w-[85%] animate-pulse">
                <span className="text-[9px] text-gray-400 mb-0.5">AI Tutor is thinking...</span>
                <div className="p-3 rounded-2xl bg-slate-50 text-gray-500 text-xs border border-gray-150 rounded-tl-none font-mono">
                  Translating physics tensor indexes securely...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-150 flex gap-2 shrink-0 bg-slate-50/50">
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask for kinematics formulas or math congruence helper..."
              className="flex-1 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-gray-200 bg-white"
            />
            <button
              type="submit"
              disabled={loadingAI}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 transition shadow-sm"
              title="Send to server proxy model"
            >
              <Play className="w-3 h-3 fill-current" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
