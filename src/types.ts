export interface BigFiveTraits {
  openness: number; // 0 - 10
  conscientiousness: number; // 0 - 10
  extraversion: number; // 0 - 10
  agreeableness: number; // 0 - 10
  neuroticism: number; // 0 - 10
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'moderator' | 'admin';
  satLiteracyScore: number; // 400 - 800
  satMathScore: number; // 400 - 800
  totalSat: number;
  traits: BigFiveTraits;
  cohortId?: string;
  grade: 'IGCSE Grade 9' | 'IGCSE Grade 10' | 'AS/A Level Grade 11' | 'AS/A Level Grade 12';
  academicScore: number; // average weekly score (0-100)
  attitudeScore: number; // classroom dynamic score (0-100)
  peerPoints: number; // peer-teaching points
}

export interface PeerClassmate {
  id: string;
  name: string;
  avatar: string;
  traits: BigFiveTraits;
  satScore: number;
  roleDescription: string; // e.g. "Growth Catalyst", "Social Glue", "Challenger"
}

export interface Cohort {
  id: string;
  name: string;
  description: string;
  studentsCount: number;
  averageAge: number;
  traitCompatibilityRating: number; // 1-100%
  members: PeerClassmate[];
}

export interface Lesson {
  id: string;
  subject: string;
  chapter: string;
  title: string;
  contentMarkdown: string;
  exerciseQuestions: ExerciseQuestion[];
}

export interface ExerciseQuestion {
  id: string;
  questionText: string;
  marks: number;
  options?: string[];
  correctAnswer: string;
}

export interface ClubMessage {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  content: string;
  timestamp: string;
  upvotes: number;
}

export interface ClubChannel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

export interface Club {
  id: string;
  name: string;
  description: string;
  creator: string;
  memberCount: number;
  tags: string[];
  channels: ClubChannel[];
  messages: { [channelId: string]: ClubMessage[] };
  activeVoiceUsers?: string[];
}
