// All site content lives in this file.
// Edit the text here and the page updates; you should not need to touch
// anything in components/ to change what the site says.

// A box in a project's flow diagram. Columns run left to right and rows top to
// bottom, both counted from 1. On phones the diagram turns on its side, so
// columns stack top to bottom instead.
export type FlowNode = {
  id: string;
  label: string;
  detail?: string;
  col: number;
  /** Defaults to 1. */
  row?: number;
  /** How many rows the box covers. Defaults to 1. */
  rows?: number;
};

// An arrow between two boxes. The boxes must share at least one row, and
// `from` must be in an earlier column than `to`.
export type FlowEdge = {
  from: string;
  to: string;
  label?: string;
  /** Dashed, for a path that is only used some of the time. */
  dashed?: boolean;
};

export type Project = {
  title: string;
  /** Optional short label shown next to the title, e.g. a hackathon name. */
  note?: string;
  period: string;
  /** Shows an "In progress" label and introduces `details` as decisions. */
  inProgress?: boolean;
  summary: string;
  /** How it works, one point per entry. */
  details: string[];
  /** Optional diagram of how the parts connect. */
  flow?: { nodes: FlowNode[]; edges: FlowEdge[] };
  /**
   * Optional interactive demo under the summary. "robot" is Combat Toy's
   * simulator (RobotSimulator.tsx) and "feed" is PolyLens's live feed
   * (FeedSimulator.tsx); both light up the project's diagram as they run and
   * expect its ids. "schema" lets visitors flip Nutrition Scanner's design
   * decisions (SchemaExplorer.tsx) and needs no diagram.
   */
  simulator?: "robot" | "feed" | "schema";
  tech: string[];
  /** Leave out a link and its button is not shown. */
  github?: string;
  demo?: string;
};

export type Job = {
  role: string;
  organization: string;
  location: string;
  period: string;
  highlights: string[];
};

// A job outside software, shown as one short line under Experience.
export type OtherJob = {
  role: string;
  organization: string;
  period: string;
  summary: string;
};

export type SkillGroup = {
  group: string;
  items: string[];
};

export const profile = {
  name: "Benson Chen",
  // Used for the page description and the link-preview image.
  tagline:
    "Computer science and applied mathematics student at Stony Brook University, looking for a software engineering internship for summer 2027.",
  // The paragraph under the name at the top of the page.
  intro:
    "I study computer science and applied math at Stony Brook University. I build software end to end, from live market dashboards in React and Express to the C++ that runs a walking robot.",
  // The short list beside it, for anyone skimming.
  facts: [
    {
      label: "Looking for",
      value: "Software engineering internship, summer 2027",
    },
    {
      label: "Studying",
      value: "B.S. Computer Science and Applied Mathematics",
    },
    { label: "Graduating", value: "May 2028" },
  ],
  email: "bensonchen120@gmail.com",
  github: "https://github.com/b-chen8",
  linkedin: "https://www.linkedin.com/in/benson-chenn",
  // This site's own code, linked from the footer.
  source: "https://github.com/b-chen8/personal-website",
  // Served from public/anonResume.pdf. Replace that file to update the resume.
  // The path is case-sensitive once deployed, so match the file name exactly.
  resume: "/anonResume.pdf",
};

// Listed in the order shown on the page.
export const projects: Project[] = [
  {
    title: "PolyLens",
    note: "YHack 2026",
    period: "Mar 2026",
    summary:
      "A Polymarket trading analytics suite with P&L modeling, hedging, and portfolio tools.",
    details: [
      "The browser subscribes to Polymarket's CLOB WebSocket for live prices and reconnects five seconds after a drop.",
      "While the socket is down, the client polls the Express API for prices every 12 seconds.",
      "The Express API wraps Polymarket's Gamma and CLOB REST APIs for markets, prices, and order books.",
      "Models binary-market payoffs, combining crypto spot and perpetual positions with prediction-market hedges.",
    ],
    flow: {
      nodes: [
        {
          id: "ws",
          label: "Polymarket WebSocket",
          detail: "CLOB market channel",
          col: 1,
          row: 1,
        },
        {
          id: "rest",
          label: "Polymarket REST APIs",
          detail: "Gamma and CLOB",
          col: 1,
          row: 2,
        },
        {
          id: "api",
          label: "Express API",
          detail: "Markets, prices, order books",
          col: 2,
          row: 2,
        },
        {
          id: "client",
          label: "React client",
          detail: "P&L, hedging, and portfolio tools",
          col: 3,
          row: 1,
          rows: 2,
        },
      ],
      edges: [
        { from: "ws", to: "client", label: "Live prices" },
        { from: "rest", to: "api" },
        {
          from: "api",
          to: "client",
          label: "Every 12 s while the socket is down",
          dashed: true,
        },
      ],
    },
    tech: ["React", "TypeScript", "Express", "WebSocket"],
    simulator: "feed",
    github: "https://github.com/b-chen8/Yhack2026",
  },
  {
    title: "Nutrition Scanner",
    period: "Sept 2026 – Present",
    inProgress: true,
    summary:
      "A full-stack food logger: scan or type a barcode, look the product up in Open Food Facts, and keep a log with daily nutrition totals.",
    details: [
      "Each log will keep a snapshot of the food's nutrition at the time it was eaten, like an order line that stores the price paid. Open Food Facts is crowd-edited, so joining to live product data would quietly change past totals.",
      "Queries will go through supabase-js with the signed-in user's token, so PostgreSQL row-level security decides whose logs a request can see. An ORM connected as a privileged role would bypass those policies.",
      "Missing nutrients will be stored as NULL, not 0, so a day's total can say it is incomplete instead of showing a false zero.",
    ],
    tech: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Supabase",
      "Vercel",
      "Open Food Facts API",
    ],
    simulator: "schema",
    // Add github: "..." and demo: "..." here once the repo and site are public.
  },
  {
    title: "Combat Toy",
    note: "MEC 101",
    period: "Aug 2024 – Dec 2024",
    summary:
      "A bipedal Arduino robot built with a team. It walks until its ultrasonic sensor finds something, then uses a PIXY Cam to decide whether it is a friend or an enemy.",
    details: [
      "Embedded C/C++ on an Arduino UNO runs the whole loop on board: walk, sense, classify, act.",
      "Four servos drive the legs and a fifth swings the sword. A 16×2 LCD shows what the robot found.",
    ],
    flow: {
      nodes: [
        {
          id: "sonar",
          label: "Ultrasonic sensor",
          detail: "Stops the robot at 18 cm",
          col: 1,
          rows: 2,
        },
        {
          id: "pixy",
          label: "PIXY Cam",
          detail: "Reads the object's color",
          col: 2,
          rows: 2,
        },
        {
          id: "enemy",
          label: "Enemy",
          detail: "Swings its sword, sounds the buzzer",
          col: 3,
          row: 1,
        },
        {
          id: "friend",
          label: "Friend",
          detail: "Shows FOUND FRIEND on the LCD",
          col: 3,
          row: 2,
        },
      ],
      edges: [
        { from: "sonar", to: "pixy", label: "Object ahead" },
        { from: "pixy", to: "enemy", label: "Red" },
        { from: "pixy", to: "friend", label: "Green" },
      ],
    },
    tech: ["C", "C++", "Arduino", "PIXY Cam", "Ultrasonic sensors"],
    simulator: "robot",
    github: "https://github.com/b-chen8/combat-robot",
    demo: "https://youtu.be/UbacsFBiEkQ",
  },
];

export const education = {
  school: "Stony Brook University",
  degree: "B.S. Computer Science and Applied Mathematics",
  period: "Expected May 2028",
  honors: "GPA 3.7. Dean's List, four semesters.",
  coursework: [
    "Analysis of Algorithms",
    "Data Structures",
    "Software Development",
    "Programming Languages",
    "Numerical Analysis",
    "Probability and Statistics",
    "Discrete Mathematics",
    "Finite Structures",
  ],
};

// Listed in the order shown on the page.
export const experience: Job[] = [
  {
    role: "Calculus II Teaching Assistant",
    organization:
      "Stony Brook University, College of Engineering and Applied Sciences",
    location: "Stony Brook, NY",
    period: "Aug 2025 – Dec 2025",
    highlights: [
      "Supported 150 Calculus II students with step-by-step explanations of integration and infinite series.",
      "Held regular office hours and graded homework and exams, giving feedback that helped students find and fix mistakes.",
    ],
  },
];

export const otherWork: OtherJob[] = [
  {
    role: "Food Stall Manager",
    organization: "Japanfes, New York, NY",
    period: "Jun 2025 – Apr 2026",
    summary:
      "Led a team of 3–4 staff through peak-hour service, handled up to $10,000 in daily transactions, and kept stock up across multi-day festivals.",
  },
  {
    role: "Work Crew",
    organization: "Stony Brook University Campus Residences",
    period: "May 2025 – May 2026",
    summary:
      "Completed 50+ resident work orders a month, from repairs and appliance fixes to renovation work across campus residences.",
  },
];

export const skills: SkillGroup[] = [
  {
    group: "Languages",
    items: [
      "TypeScript",
      "Python",
      "JavaScript",
      "Java",
      "C",
      "C++",
      "SQL",
      "R",
      "OCaml",
      "HTML/CSS",
    ],
  },
  {
    group: "Frameworks and libraries",
    items: [
      "React",
      "Next.js",
      "Node.js",
      "Express",
      "Tailwind CSS",
      "React Query",
      "Recharts",
      "NumPy",
      "Matplotlib",
    ],
  },
  {
    group: "Databases",
    items: ["PostgreSQL", "Supabase"],
  },
  {
    group: "Tools",
    items: ["Git", "GitHub", "Vercel", "Vite", "Arduino", "IntelliJ", "VS Code"],
  },
];
