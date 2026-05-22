import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API
const hasGeminiKey = !!process.env.GEMINI_API_KEY;
let aiClient: any = null;

if (hasGeminiKey) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ GEMINI_API_KEY is not defined in the environment variables!");
}

// In-Memory Database for Academicians Platform
const initialClubs = [
  {
    id: "science-pioneers",
    name: "🚀 Science Pioneers",
    description: "The official physics and chemistry cohort club. Exploring advanced relativity, quantum mechanics, and Cambridge syllabus end-of-year challenge topics.",
    creator: "Iftitah Ranjana Ahtikiszi",
    memberCount: 8,
    tags: ["Physics", "IGCSE", "Aerodynamics"],
    channels: [
      { id: "general", name: "general", type: "text" as const },
      { id: "homework-help", name: "homework-help", type: "text" as const },
      { id: "voice-lounge", name: "voice-lounge", type: "voice" as const }
    ],
    activeVoiceUsers: ["Alif Kenzie Wibiyoso", "Muhammad Hafidz Akemi Pasha"],
    messages: {
      "general": [
        { id: "m1", studentId: "iftitah", studentName: "Iftitah Ranjana Ahtikiszi", avatar: "👨‍🔬", content: "Welcome pathfinders! Use this club to share notes on Cambridge Chapter 3 Kinematics.", timestamp: "08:12 AM", upvotes: 4 },
        { id: "m2", studentId: "alif", studentName: "Alif Kenzie Wibiyoso", avatar: "📐", content: "Finished the formula set for Hooke's Law practice. The angular velocity calculations match up!", timestamp: "08:14 AM", upvotes: 3 }
      ],
      "homework-help": [
        { id: "m3", studentId: "hafidz", studentName: "Muhammad Hafidz Akemi Pasha", avatar: "🎖️", content: "Does anyone understand why terminal velocity of a falling object remains constant? Is force balanced?", timestamp: "08:18 AM", upvotes: 5 }
      ]
    }
  },
  {
    id: "olympiad-math",
    name: "📐 Olympiad Math Squad",
    description: "Rigorous Euler problem solving and competitive math prep. We train for Indonesian KSN and regional olympiads.",
    creator: "Alif Kenzie Wibiyoso",
    memberCount: 5,
    tags: ["Math", "Olympiads", "Logic"],
    channels: [
      { id: "general", name: "general", type: "text" as const },
      { id: "primes-and-congruence", name: "primes-and-congruence", type: "text" as const },
      { id: "math-study-circle", name: "math-study-circle", type: "voice" as const }
    ],
    activeVoiceUsers: ["Iftitah Ranjana Ahtikiszi"],
    messages: {
      "general": [
        { id: "mq1", studentId: "alif", studentName: "Alif Kenzie Wibiyoso", avatar: "📐", content: "Today we are looking at modular arithmetic and Fermat's Little Theorem. Absolute beauties of mathematics.", timestamp: "07:30 AM", upvotes: 6 }
      ]
    }
  },
  {
    id: "clique-philosophers",
    name: "🏛️ Homeschool Philosophers",
    description: "Reframing Nietzsche's Master/Slave Morality in school contexts and understanding Zone of Proximal Development.",
    creator: "Iftitah Ranjana Ahtikiszi",
    memberCount: 12,
    tags: ["Philosophy", "Nietzsche", "ZPD", "Psychology"],
    channels: [
      { id: "general", name: "general", type: "text" as const },
      { id: "piaget-discussion", name: "piaget-discussion", type: "text" as const },
      { id: "voice-room", name: "voice-room", type: "voice" as const }
    ],
    messages: {
      "general": [
        { id: "mph1", studentId: "iftitah", studentName: "Iftitah Ranjana Ahtikiszi", avatar: "👨‍🔬", content: "Nietzsche argues that envy (resentment) halts individual success. In our placement algorithm, we solve this by grouping students with similar cognitive ability to maintain peer respect, while using the Big Five to drive character development through structured tension.", timestamp: "Yesterday", upvotes: 8 }
      ]
    }
  }
];

let dbClubs = [...initialClubs];

// Mock database for placement students
let dbStudents: any[] = [
  {
    id: "iftitah",
    name: "Iftitah Ranjana Ahtikiszi",
    email: "iftitahranjana@gmail.com",
    role: "student",
    satLiteracyScore: 780,
    satMathScore: 790,
    totalSat: 1570,
    traits: { openness: 9, conscientiousness: 7, extraversion: 6, agreeableness: 5, neuroticism: 4 },
    grade: "AS/A Level Grade 11",
    academicScore: 92,
    attitudeScore: 88,
    peerPoints: 450,
    cohortId: "cohort-alpha"
  },
  {
    id: "alif",
    name: "Alif Kenzie Wibiyoso",
    email: "alifkenzie77@gmail.com",
    role: "student",
    satLiteracyScore: 750,
    satMathScore: 800,
    totalSat: 1550,
    traits: { openness: 8, conscientiousness: 9, extraversion: 7, agreeableness: 4, neuroticism: 3 },
    grade: "AS/A Level Grade 11",
    academicScore: 96,
    attitudeScore: 85,
    peerPoints: 500,
    cohortId: "cohort-alpha"
  },
  {
    id: "hafidz",
    name: "Muhammad Hafidz Akemi Pasha",
    email: "pashaaneh@gmail.com",
    role: "student",
    satLiteracyScore: 720,
    satMathScore: 740,
    totalSat: 1460,
    traits: { openness: 7, conscientiousness: 6, extraversion: 9, agreeableness: 8, neuroticism: 5 },
    grade: "AS/A Level Grade 11",
    academicScore: 88,
    attitudeScore: 94,
    peerPoints: 320,
    cohortId: "cohort-alpha"
  }
];

// Seeded lessons
const lessonsData = [
  {
    id: "physics-ch3",
    subject: "Physics (IGCSE/A-Level)",
    chapter: "Chapter 3: Forces and Motion",
    title: "Terminal Velocity, Hooke's Law, and Resultant Forces",
    contentMarkdown: `### 1. Newton's Laws & Resultant Forces
The motion of an object is always governed by Newton's law of motion. If forces representing action are balanced, the resultant force ($F$) is zero. If $F = 0$, an object either remains at rest or travels at a constant velocity.

### 2. Hooke's Law
Deformation is proportional to tension force, expressed by:
$$F = k \\cdot x$$
Where:
- $F$ is the tension applied force (Newtons)
- $k$ is the spring constant ($N/m$)
- $x$ is the extension or change in shape ($m$)

Beyond the elastic limit, deformation becomes permanent and non-linear.

### 3. Understanding Terminal Velocity
When a skydiver leaps from an airplane, they accelerate because gravity pulls them down ($W = mg$). As velocity increases, air resistance (fluid friction) acting in the opposite direction increases. 
Ultimately, air resistance grows to exactly oppose weight. When this occurs, resultant force becomes:
$$F_{net} = W - R = 0$$
Since acceleration $a = F/m = 0$, the body reaches a constant speed known as **terminal velocity**.`,
    exerciseQuestions: [
      {
        id: "q1",
        questionText: "A skydiver falls through the air. Initially, they accelerate. At terminal velocity, which statement is mathematically correct?",
        marks: 4,
        options: [
          "Air resistance is larger than gravity",
          "Air resistance is exactly equal to gravity, and resultant force is zero",
          "Acceleration is 9.8 m/s²",
          "The skydiver decelerates steadily to a stop"
        ],
        correctAnswer: "Air resistance is exactly equal to gravity, and resultant force is zero"
      },
      {
        id: "q2",
        questionText: "A spring of original length 10cm is stretched to 14cm under a force of 12N. What is the spring constant (k) of this spring in N/cm?",
        marks: 5,
        options: [
          "1.2 N/cm",
          "3.0 N/cm",
          "0.83 N/cm",
          "4.8 N/cm"
        ],
        correctAnswer: "3.0 N/cm"
      }
    ]
  },
  {
    id: "math-alg1",
    subject: "Advanced Mathematics",
    chapter: "Chapter 1: Modular Congruences",
    title: "Introduction to Modular Arithmetic & Fermat's Little Theorem",
    contentMarkdown: `### 1. Congruence Relations
A number $a$ is congruent to $b$ modulo $n$ if their difference $(a - b)$ is divisible by $n$:
$$a \\equiv b \\pmod{n}$$
For example, $17 \\equiv 2 \\pmod{5}$ because $17 - 2 = 15$, which is $3 \\times 5$.

### 2. Fermat's Little Theorem (FLT)
An essential catalyst of modern cryptography (RSA). If $p$ is a prime number, then for any integer $a$ not divisible by $p$:
$$a^{p-1} \\equiv 1 \\pmod{p}$$
Alternatively, we can express it as:
$$a^p \\equiv a \\pmod{p}$$ for all integers $a$.`,
    exerciseQuestions: [
      {
        id: "mq1",
        questionText: "Calculate the remainder of 3^100 when divided by the prime number 101.",
        marks: 6,
        options: [
          "3",
          "1",
          "99",
          "100"
        ],
        correctAnswer: "1"
      }
    ]
  }
];

// ------ API ENDPOINTS ------

// 1. Get List of Clubs
app.get("/api/clubs", (req, res) => {
  res.json({ clubs: dbClubs });
});

// 2. Create Club
app.post("/api/clubs", (req, res) => {
  const { name, description, tags, creator } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }
  const newClub = {
    id: name.toLowerCase().replace(/[^a-z0-t]/g, "-"),
    name,
    description,
    creator: creator || "Anonymous Student",
    memberCount: 1,
    tags: tags || [],
    channels: [
      { id: "general", name: "general", type: "text" as const },
      { id: "voice-room", name: "voice-room", type: "voice" as const }
    ],
    messages: {
      "general": [
        { id: Math.random().toString(), studentId: "sys", studentName: "System", avatar: "🤖", content: `Welcome to ${name}! Establish structural hierarchy and support peer-teaching rules here.`, timestamp: "Just now", upvotes: 0 }
      ]
    },
    activeVoiceUsers: []
  };
  dbClubs.push(newClub);
  res.json({ success: true, club: newClub });
});

// 3. Post Message to Club Channel
app.post("/api/clubs/:clubId/channels/:channelId/messages", (req, res) => {
  const { clubId, channelId } = req.params;
  const { studentName, avatar, content, studentId } = req.body;
  
  const club = dbClubs.find(c => c.id === clubId);
  if (!club) {
    return res.status(404).json({ error: "Club not found" });
  }

  if (!club.messages[channelId]) {
    club.messages[channelId] = [];
  }

  const newMessage = {
    id: Math.random().toString(36).substring(2, 9),
    studentId: studentId || "anonymous",
    studentName: studentName || "Guest",
    avatar: avatar || "👤",
    content: content || "",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    upvotes: 0
  };

  club.messages[channelId].push(newMessage);
  res.json({ success: true, message: newMessage });
});

// 4. Lessons API
app.get("/api/lessons", (req, res) => {
  res.json({ lessons: lessonsData });
});

// 5. Tuition Fee Reduction Calculator API
// Formula from paper details: takes attitude score (40%) + weekly exams score (60%) averages,
// calculates improvement percentage month-over-month.
app.post("/api/fee-reduction", (req, res) => {
  const { initialExam, finalExam, initialAttitude, finalAttitude, sessions } = req.body;

  const initExam = Number(initialExam) || 60;
  const finExam = Number(finalExam) || 80;
  const initAtt = Number(initialAttitude) || 70;
  const finAtt = Number(finalAttitude) || 85;
  const sess = Number(sessions) || 12;

  // Derive composite scores: 60% Exam, 40% Attitude
  const initialComposite = (initExam * 0.6) + (initAtt * 0.4);
  const finalComposite = (finExam * 0.6) + (finAtt * 0.4);

  // Compute delta progress
  const improvementDelta = finalComposite - initialComposite;
  
  // Calculate average improvement per session
  const improvementPerSession = improvementDelta / sess;

  // Let's generate a beautiful Tuition Fee Reduction percentage (normally 0 - 50% discount)
  // Max base tuition fee 100,000 IDR. Full 50% discount brings it to 50,000 IDR.
  let discountPercentage = 0;
  if (improvementDelta > 0) {
    // Angular/Slope growth coefficient: every 1 point average improvement per session gives 4.5% tuition discount
    discountPercentage = Math.min(50, Math.round(improvementDelta * 1.5 + (improvementPerSession * 5)));
  }

  // Graceful guard
  discountPercentage = Math.max(0, discountPercentage);

  const baseTuition = 100000; // IDR per month
  const actualTuition = baseTuition * (1 - (discountPercentage / 100));

  res.json({
    initialComposite,
    finalComposite,
    improvementDelta,
    improvementPerSession,
    discountPercentage,
    actualTuitionIDR: actualTuition
  });
});

// 6. Registration with Custom SAT Diagnostic & Big Five Cohort Setup
app.post("/api/onboard", (req, res) => {
  const { name, email, satLiteracy, satMath, bigFive, grade } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const satLitScore = Math.min(800, Math.max(400, Number(satLiteracy) || 500));
  const satMathScore = Math.min(800, Math.max(400, Number(satMath) || 500));
  const totalSat = satLitScore + satMathScore;

  const traits = {
    openness: Math.min(10, Math.max(1, Number(bigFive?.openness) || 5)),
    conscientiousness: Math.min(10, Math.max(1, Number(bigFive?.conscientiousness) || 5)),
    extraversion: Math.min(10, Math.max(1, Number(bigFive?.extraversion) || 5)),
    agreeableness: Math.min(10, Math.max(1, Number(bigFive?.agreeableness) || 5)),
    neuroticism: Math.min(10, Math.max(1, Number(bigFive?.neuroticism) || 5))
  };

  // Run the grouping and suitability mechanics described in paper Section 1.1.1
  // Groups with contrasting trait scores provoke productive friction or character growth.
  // Conflict axis: high conscientiousness (rigid, bound) vs openness (flighty, creative).
  // Social glue: high extraversion, low agreeableness = competitors/challengers; low extraversion, high agreeableness = peacemakers/bridges.
  // Growth Catalysts: Neuroticism in moderation (6-8) forces empathy.
  
  let cohortName = "";
  let cohortDescription = "";
  let matchedGroupMembers: any[] = [];

  // Custom cohort clustering based on the traits:
  if (traits.conscientiousness > 7 && traits.openness < 5) {
    cohortName = "🛡️ Cohort Delta (Structured Builders)";
    cohortDescription = "A highly organised, process-oriented cohort. Balanced with Openness mentors to force intellectual expansion and challenge pure rigid compliance.";
    matchedGroupMembers = [
      { id: "peer1", name: "Raka Wirasena", avatar: "🧑‍💻", traits: { openness: 9, conscientiousness: 3, extraversion: 6, agreeableness: 8, neuroticism: 4 }, satScore: 1420, roleDescription: "Openness Challenger" },
      { id: "peer2", name: "Dinda Kirana", avatar: "👩‍🎨", traits: { openness: 8, conscientiousness: 4, extraversion: 5, agreeableness: 9, neuroticism: 7 }, satScore: 1380, roleDescription: "Emotional Growth Catalyst" },
      { id: "peer3", name: "Zidan Fahrezi", avatar: "🧑‍🔬", traits: { openness: 5, conscientiousness: 9, extraversion: 4, agreeableness: 7, neuroticism: 3 }, satScore: 1490, roleDescription: "Structured Anchor" }
    ];
  } else if (traits.extraversion > 7 && traits.agreeableness < 5) {
    cohortName = "⚔️ Cohort Ares (Competitive Challengers)";
    cohortDescription = "Formed by highly energetic, vocal leaders. Tension is buffered with supreme peacemakers (agreeableness > 8) to convert disputes into collaborative design breakthroughs.";
    matchedGroupMembers = [
      { id: "peer1", name: "Laras Savitri", avatar: "👩‍🏫", traits: { openness: 7, conscientiousness: 8, extraversion: 3, agreeableness: 9, neuroticism: 4 }, satScore: 1510, roleDescription: "Aesthetic Mediator" },
      { id: "peer2", name: "Reza Mahendra", avatar: "🧑‍🚀", traits: { openness: 8, conscientiousness: 5, extraversion: 8, agreeableness: 4, neuroticism: 5 }, satScore: 1440, roleDescription: "Debate Facilitator" },
      { id: "peer3", name: "Aria Wijaya", avatar: "🧑‍🎨", traits: { openness: 9, conscientiousness: 6, extraversion: 4, agreeableness: 8, neuroticism: 7 }, satScore: 1390, roleDescription: "Creative Glue" }
    ];
  } else {
    cohortName = "🌌 Cohort Omega (Synergistic Thinkers)";
    cohortDescription = "Designed for highly reflective and imaginative students. Features balanced conscientiousness tension to ensure regular exam delivery and study rhythms.";
    matchedGroupMembers = [
      { id: "peer1", name: "Siti Rahma", avatar: "👩‍💻", traits: { openness: 5, conscientiousness: 9, extraversion: 5, agreeableness: 8, neuroticism: 3 }, satScore: 1480, roleDescription: "Logistics Anchor" },
      { id: "peer2", name: "Farhan Malik", avatar: "🧑‍🏫", traits: { openness: 8, conscientiousness: 5, extraversion: 7, agreeableness: 5, neuroticism: 8 }, satScore: 1430, roleDescription: "Dynamic Catalyst" },
      { id: "peer3", name: "Kartika Sari", avatar: "👩‍🔬", traits: { openness: 7, conscientiousness: 8, extraversion: 4, agreeableness: 9, neuroticism: 4 }, satScore: 1520, roleDescription: "Harmony Guardian" }
    ];
  }

  // Add the student to database with calculated attributes
  const newStudent = {
    id: name.toLowerCase().replace(/[^a-z]/g, "-") + Math.floor(Math.random() * 100),
    name,
    email,
    role: "student",
    satLiteracyScore: satLitScore,
    satMathScore: satMathScore,
    totalSat,
    traits,
    grade: grade || "IGCSE Grade 10",
    academicScore: 75,
    attitudeScore: 80,
    peerPoints: 10,
    cohortId: cohortName
  };

  dbStudents.push(newStudent);

  res.json({
    success: true,
    student: newStudent,
    cohort: {
      name: cohortName,
      description: cohortDescription,
      members: matchedGroupMembers,
      traitCompatibilityRating: Math.round(75 + Math.random() * 20)
    }
  });
});

// 7. Get student base for Leaderboards (Section 1.1.2)
app.get("/api/leaderboards", (req, res) => {
  // classroom cohort leaderboards and cross-cohort reconocimiento leaderboards
  // emphasize mastery, peer-teaching points, and assessment scores
  const cohortLeaderboard = [...dbStudents].sort((a, b) => b.peerPoints - a.peerPoints);
  const recognitionLeaderboard = [...dbStudents].sort((a, b) => (b.academicScore * 0.7 + b.attitudeScore * 0.3) - (a.academicScore * 0.7 + a.attitudeScore * 0.3));

  res.json({
    cohortScores: cohortLeaderboard,
    crossCohortScores: recognitionLeaderboard
  });
});

// 8. Server-Side AI Tutor / Classroom chat with Gemini API integration
app.post("/api/gemini/tutoring", async (req, res) => {
  const { prompt, sentiment, chatHistory, chapterContext } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!hasGeminiKey || !aiClient) {
    // Elegant fallback simulation when key is missing to ensure app doesn't crash on startup and remains beautiful
    const mockTutorResponses = [
      `As your Academicians AI Teaching Assist, I detected some **${sentiment || "neutral"}** sentiment indications in your study rhythm. Let's study ${chapterContext || "Forces & Motion"}! In Cambridge standards, terminal velocity occurs because the dragging forces reach complete balance with down-gravitational forces ($F_{net}=0$). Do you have questions about Hooke's elastic constant coefficient?`,
      `Excellent inquiry regarding Hooke's spring constant ($k$). If original sprung metal length is 10cm, extending to 15cm under 20N tension gives $x = 5\\text{cm}$. The constant $k = F/x = 20/5 = 4\\text{N/cm}$. Keep your **${sentiment || "focused"}** momentum going!`,
      `We detected absolute **${sentiment || "confused"}** sentiment, which is totally normal when starting modular congruence arithmetic! Fermat's Little Theorem states $a^{p-1} \\equiv 1 \\pmod{p}$. This acts as an emotional and analytical bridge in modern computer networks.`
    ];

    const randomResponse = mockTutorResponses[Math.floor(Math.random() * mockTutorResponses.length)];
    // Simulate brief network lag
    await new Promise(r => setTimeout(r, 1000));
    return res.json({
      text: randomResponse + "\n\n*(Note: Running in offline tutorial mode. Add GEMINI_API_KEY to secrets to enable cloud-grade live AI scaffolding)*"
    });
  }

  try {
    const previousMessages = Array.isArray(chatHistory) 
      ? chatHistory.map((m: any) => `${m.sender === "user" ? "Student" : "AI Tutor"}: ${m.text}`).join("\n") 
      : "";

    const systemInstruction = `You are "Academicians Certified AI Tutor", a brilliant, supportive, and formal homeschooling coach based at Dubai Knowledge Park.
We follow Singapore & Cambridge IGCSE, AS/A level guidelines rigorously.
You receive the students' input, current chapter context: ${chapterContext || "Cambridge Science & Mathematics"}, and a sentiment indicator detected dynamically from their workspace cam: "${sentiment || "focused"}".
Incorporate the student's affective state:
- If frustrated/confused, give gentle structured explanations (scaffolded steps, simple vocabulary, reassuring tone).
- If focused/curious, stretch their intelligence with modular math challenges or Newton mechanics problems.
Keep your answer visually clean, utilizing standard Markdown style and mathematical equations where appropriate.`;

    const fullPrompt = `${previousMessages}\n\n[Current Workspace Sentiment: ${sentiment || "focused"}]\nStudent's question: ${prompt}`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.75,
      }
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Gemini tutoring error:", err);
    res.status(500).json({ error: "Failed to communicate with AI Tutor.", details: err.message });
  }
});

// ------ VITE DEV OR PROD MIDDLEWARE ------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Academicians Server running securely on http://localhost:${PORT}`);
  });
}

startServer();
