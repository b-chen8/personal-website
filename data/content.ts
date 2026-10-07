// All site content lives in this file.
// Edit the text here and the page updates; you should not need to touch
// anything in components/ to change what the site says.

export type Project = {
  title: string;
  /** Optional short label shown next to the title, e.g. a hackathon name. */
  note?: string;
  period: string;
  description: string;
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

export type SkillGroup = {
  group: string;
  items: string[];
};

export const profile = {
  name: "Benson Chen",
  tagline:
    "Computer science and applied mathematics student at Stony Brook University, looking for a software engineering internship for summer 2027.",
  about: [
    "I'm a junior at Stony Brook University, double majoring in computer science and applied mathematics and graduating in May 2028.",
    "I like building things end to end. Lately that has meant a nutrition logger that scans barcodes, a trading analytics tool built at YHack, and an Arduino robot that tells friend from enemy by sight. I also spent a semester as a Calculus II teaching assistant, which is where the plot at the top of this page comes from.",
  ],
  email: "bensonchen120@gmail.com",
  github: "https://github.com/b-chen8",
  linkedin: "https://www.linkedin.com/in/benson-chenn",
  // Served from public/anonResume.pdf. Replace that file to update the resume.
  // The path is case-sensitive once deployed, so match the file name exactly.
  resume: "/anonResume.pdf",
};

export const projects: Project[] = [
  {
    title: "Nutrition Logger",
    period: "Sept 2026 – Present",
    description:
      "A full-stack food logger. Scan a barcode, look the product up in Open Food Facts, and see daily nutrition totals. Row-level security in PostgreSQL keeps each user's logs private.",
    tech: [
      "Next.js",
      "TypeScript",
      "PostgreSQL",
      "Supabase",
      "Vercel",
      "Open Food Facts API",
    ],
    // Add github: "..." and demo: "..." here once the repo and site are public.
  },
  {
    title: "PolyLens",
    note: "YHack 2026",
    period: "Mar 2026",
    description:
      "A Polymarket trading analytics suite with P&L modeling, hedging, and portfolio tools. Live prices stream over WebSocket, with a polling fallback when the connection drops.",
    tech: ["React", "TypeScript", "Express", "WebSocket"],
    github: "https://github.com/b-chen8/Yhack2026",
  },
  {
    title: "Combat Toy",
    period: "Aug 2024 – Dec 2024",
    description:
      "An autonomous Arduino robot written in C/C++. It combines PIXY Cam image recognition with ultrasonic sensor data to classify objects as friend or enemy and decide how to move.",
    tech: ["C", "C++", "Arduino", "PIXY Cam", "Ultrasonic sensors"],
    github: "https://github.com/b-chen8/combat-robot",
    demo: "https://youtu.be/UbacsFBiEkQ",
  },
];

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
  {
    role: "Food Stall Manager",
    organization: "Japanfes",
    location: "New York, NY",
    period: "Jun 2025 – Apr 2026",
    highlights: [
      "Led a team of 3–4 staff at a high-traffic food stall, assigning roles and coordinating peak-hour service.",
      "Handled up to $10,000 in daily transactions and reconciled sales at close.",
      "Managed inventory and supply orders to prevent stockouts during multi-day festivals.",
    ],
  },
  {
    role: "Work Crew",
    organization: "Stony Brook University Campus Residences",
    location: "Stony Brook, NY",
    period: "May 2025 – May 2026",
    highlights: [
      "Completed 50+ resident work orders a month, including repairs, appliance fixes, and room adjustments.",
      "Contributed to housing renovations, facility upgrades, and ongoing maintenance across campus residences.",
    ],
  },
];

export const skills: SkillGroup[] = [
  {
    group: "Languages",
    items: [
      "Java",
      "Python",
      "C",
      "C++",
      "TypeScript",
      "JavaScript",
      "SQL",
      "R",
      "OCaml",
      "HTML/CSS",
    ],
  },
  {
    group: "Frameworks",
    items: ["React", "Next.js", "Node.js", "Express", "Tailwind CSS"],
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
