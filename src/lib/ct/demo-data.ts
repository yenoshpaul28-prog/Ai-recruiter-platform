import type {
  AppData,
  Candidate,
  CandidateSkill,
  Confidence,
  Evidence,
  EvidenceType,
  Job,
} from "./types";

let seq = 0;
const eid = () => `ev-${++seq}`;

function ev(
  type: EvidenceType,
  description: string,
  confidence: Confidence,
  source: string,
): Evidence {
  return { id: eid(), type, description, confidence, source };
}

function skill(name: string, level: number, evidence: Evidence[]): CandidateSkill {
  return { name, level, evidence };
}

export const DEMO_JOBS: Job[] = [
  {
    id: "job-python",
    title: "Python Developer",
    location: "Pune, India",
    jobType: "Full-time",
    experience: "0–2 years",
    description:
      "We are hiring a Python developer to build and maintain backend services and data tooling. You will work with REST APIs, relational databases and version control in a small product team.",
    requiredSkills: ["Python", "SQL", "REST APIs", "Git"],
    mustHaveSkills: ["Python"],
    optionalSkills: ["Docker", "AWS"],
    evidencePreferences: ["Project", "Assessment", "Work Experience", "Certification"],
    rubric: [
      { skill: "Python", weight: 30 },
      { skill: "SQL", weight: 25 },
      { skill: "REST APIs", weight: 20 },
      { skill: "Problem Solving", weight: 15 },
      { skill: "Communication", weight: 10 },
    ],
    status: "Active",
    createdAt: "2026-07-28T09:00:00.000Z",
    isDemo: true,
  },
  {
    id: "job-fullstack",
    title: "Full Stack Developer",
    location: "Hyderabad, India",
    jobType: "Full-time",
    experience: "1–3 years",
    description:
      "Build user-facing features end to end with React on the front end and Node.js services on the back end, supported by SQL databases.",
    requiredSkills: ["JavaScript", "React", "Node.js", "SQL"],
    mustHaveSkills: ["React"],
    optionalSkills: ["Docker", "TypeScript"],
    evidencePreferences: ["Project", "Portfolio", "Work Experience", "Assessment"],
    rubric: [
      { skill: "React", weight: 30 },
      { skill: "JavaScript", weight: 25 },
      { skill: "Node.js", weight: 20 },
      { skill: "SQL", weight: 15 },
      { skill: "Communication", weight: 10 },
    ],
    status: "Active",
    createdAt: "2026-07-20T09:00:00.000Z",
    isDemo: true,
  },
  {
    id: "job-analyst",
    title: "Data Analyst",
    location: "Bengaluru, India",
    jobType: "Full-time",
    experience: "0–2 years",
    description:
      "Turn business questions into analysis. You will write SQL, build dashboards and communicate findings to non-technical stakeholders.",
    requiredSkills: ["SQL", "Excel", "Data Visualization", "Python"],
    mustHaveSkills: ["SQL"],
    optionalSkills: ["Power BI", "Statistics"],
    evidencePreferences: ["Project", "Assessment", "Certification", "Portfolio"],
    rubric: [
      { skill: "SQL", weight: 30 },
      { skill: "Data Visualization", weight: 25 },
      { skill: "Python", weight: 20 },
      { skill: "Problem Solving", weight: 15 },
      { skill: "Communication", weight: 10 },
    ],
    status: "Active",
    createdAt: "2026-08-02T09:00:00.000Z",
    isDemo: true,
  },
  {
    id: "job-qa",
    title: "QA Automation Engineer",
    location: "Remote, India",
    jobType: "Full-time",
    experience: "1–3 years",
    description: "Draft role. Automate regression suites for our web platform.",
    requiredSkills: ["Python", "Selenium", "REST APIs"],
    mustHaveSkills: ["Selenium"],
    optionalSkills: ["CI/CD"],
    evidencePreferences: ["Project", "Assessment"],
    rubric: [
      { skill: "Selenium", weight: 40 },
      { skill: "Python", weight: 35 },
      { skill: "REST APIs", weight: 25 },
    ],
    status: "Draft",
    createdAt: "2026-08-10T09:00:00.000Z",
    isDemo: true,
  },
];

interface Seed {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experienceYears: number;
  targetRole: string;
  education: string;
  college: string;
  collegeTier: 1 | 2 | 3;
  jobIds: string[];
  portfolio: string;
  certifications: string[];
  assessments: { name: string; score: number; status: "Completed" | "Pending" }[];
  projects: { name: string; description: string; skills: string[] }[];
  workExperience: { company: string; role: string; duration: string; summary: string }[];
  skills: CandidateSkill[];
}

const seeds: Seed[] = [
  {
    id: "cand-anjali",
    name: "Anjali Rathod",
    email: "anjali.rathod@example.com",
    phone: "+91 98230 41122",
    location: "Pune, India",
    experienceYears: 2,
    targetRole: "Python Developer",
    education: "B.E. Computer Engineering, 2024",
    college: "Vishwakarma Institute of Technology",
    collegeTier: 2,
    jobIds: ["job-python", "job-analyst"],
    portfolio: "github.com/anjali-rathod",
    certifications: ["Python for Everybody (Coursera)"],
    assessments: [
      { name: "Python Coding Assessment", score: 82, status: "Completed" },
      { name: "SQL Assessment", score: 78, status: "Completed" },
    ],
    projects: [
      {
        name: "Inventory Management System",
        description: "Inventory management system built using Python, Flask and PostgreSQL.",
        skills: ["Python", "SQL", "REST APIs"],
      },
      {
        name: "Expense Tracker API",
        description: "REST API with token authentication and reporting endpoints.",
        skills: ["REST APIs", "Python"],
      },
    ],
    workExperience: [
      {
        company: "Nexlogic Systems",
        role: "Junior Backend Developer",
        duration: "Jul 2024 – Present",
        summary: "Maintained Python services and internal reporting queries.",
      },
    ],
    skills: [
      skill("Python", 82, [
        ev("Project", "Inventory Management System built using Python and Flask.", "HIGH", "Resume / Project"),
        ev("Assessment", "Python coding assessment score: 82/100.", "HIGH", "Platform assessment"),
      ]),
      skill("SQL", 76, [
        ev("Assessment", "SQL assessment score: 78/100 with joins and aggregation questions.", "HIGH", "Platform assessment"),
        ev("Work Experience", "Wrote reporting queries against PostgreSQL at Nexlogic Systems.", "MEDIUM", "Resume / Work history"),
      ]),
      skill("REST APIs", 62, [
        ev("Project", "Expense Tracker API with authentication endpoints.", "MEDIUM", "Resume / Project"),
      ]),
      skill("Problem Solving", 74, [
        ev("Assessment", "Algorithmic section score: 74/100.", "MEDIUM", "Platform assessment"),
      ]),
      skill("Communication", 60, [
        ev("Assessment", "Written communication exercise: 60/100.", "MEDIUM", "Platform assessment"),
      ]),
      skill("Git", 70, [ev("Project", "Version-controlled project repositories.", "MEDIUM", "Portfolio")]),
      skill("Data Visualization", 40, [ev("Self-reported", "Listed Matplotlib on resume.", "LOW", "Resume")]),
    ],
  },
  {
    id: "cand-priya",
    name: "Priya Deshmukh",
    email: "priya.deshmukh@example.com",
    phone: "+91 90045 77812",
    location: "Pune, India",
    experienceYears: 1,
    targetRole: "Python Developer",
    education: "B.Tech Information Technology, 2025",
    college: "Government College of Engineering, Amravati",
    collegeTier: 3,
    jobIds: ["job-python"],
    portfolio: "priyadeshmukh.dev",
    certifications: ["Database Design (NPTEL)"],
    assessments: [{ name: "Python Coding Assessment", score: 74, status: "Completed" }],
    projects: [
      {
        name: "Library Analytics Tool",
        description: "Python scripts and SQL views to analyse library circulation data.",
        skills: ["Python", "SQL"],
      },
    ],
    workExperience: [
      {
        company: "Freelance",
        role: "Python Automation Freelancer",
        duration: "2025 – Present",
        summary: "Automated data cleanup tasks for two small businesses.",
      },
    ],
    skills: [
      skill("Python", 78, [
        ev("Project", "Library Analytics Tool written in Python.", "HIGH", "Resume / Project"),
        ev("Assessment", "Python coding assessment score: 74/100.", "MEDIUM", "Platform assessment"),
      ]),
      skill("SQL", 80, [
        ev("Certification", "Database Design certification (NPTEL).", "HIGH", "Verified certificate"),
        ev("Project", "Built SQL views for circulation analytics.", "HIGH", "Resume / Project"),
      ]),
      skill("REST APIs", 45, [ev("Self-reported", "Mentions Flask basics on resume.", "LOW", "Resume")]),
      skill("Problem Solving", 70, [ev("Assessment", "Algorithmic section score: 70/100.", "MEDIUM", "Platform assessment")]),
      skill("Communication", 72, [
        ev("Portfolio", "Writes clear technical blog posts on personal site.", "MEDIUM", "Portfolio"),
      ]),
      skill("Git", 55, [ev("Self-reported", "Git listed in skills section.", "LOW", "Resume")]),
    ],
  },
  {
    id: "cand-sandeep",
    name: "Sandeep Kumar",
    email: "sandeep.kumar@example.com",
    phone: "+91 87990 21567",
    location: "Nagpur, India",
    experienceYears: 2,
    targetRole: "Python Developer",
    education: "BCA, 2023",
    college: "RTM Nagpur University",
    collegeTier: 3,
    jobIds: ["job-python"],
    portfolio: "—",
    certifications: [],
    assessments: [{ name: "Python Coding Assessment", score: 61, status: "Completed" }],
    projects: [
      {
        name: "Attendance Automation Script",
        description: "Python script that generated monthly attendance summaries.",
        skills: ["Python"],
      },
    ],
    workExperience: [
      {
        company: "Sahyog IT Services",
        role: "Support Engineer",
        duration: "2023 – Present",
        summary: "Supported internal tools and wrote small automation scripts.",
      },
    ],
    skills: [
      skill("Python", 64, [
        ev("Assessment", "Python coding assessment score: 61/100.", "MEDIUM", "Platform assessment"),
        ev("Project", "Attendance automation script.", "MEDIUM", "Resume / Project"),
      ]),
      skill("SQL", 58, [ev("Work Experience", "Ran basic SELECT queries in support role.", "MEDIUM", "Resume / Work history")]),
      skill("REST APIs", 35, [ev("Self-reported", "Listed API knowledge without supporting detail.", "NOT_VERIFIED", "Resume")]),
      skill("Problem Solving", 66, [ev("Work Experience", "Resolved production support tickets.", "MEDIUM", "Resume / Work history")]),
      skill("Communication", 74, [
        ev("Work Experience", "Customer-facing support role for two years.", "HIGH", "Resume / Work history"),
      ]),
    ],
  },
  {
    id: "cand-rahul",
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    phone: "+91 99870 33421",
    location: "Hyderabad, India",
    experienceYears: 3,
    targetRole: "Full Stack Developer",
    education: "B.Tech Computer Science, 2022",
    college: "IIIT Hyderabad",
    collegeTier: 1,
    jobIds: ["job-fullstack"],
    portfolio: "rahulverma.io",
    certifications: ["Meta Front-End Developer"],
    assessments: [
      { name: "JavaScript Assessment", score: 88, status: "Completed" },
      { name: "React Assessment", score: 84, status: "Completed" },
    ],
    projects: [
      {
        name: "Clinic Booking Platform",
        description: "React + Node.js appointment platform with PostgreSQL backend.",
        skills: ["React", "Node.js", "SQL"],
      },
    ],
    workExperience: [
      {
        company: "Trellis Labs",
        role: "Software Engineer",
        duration: "2022 – Present",
        summary: "Owned React feature delivery and Node.js API endpoints.",
      },
    ],
    skills: [
      skill("React", 88, [
        ev("Project", "Clinic Booking Platform front end built in React.", "HIGH", "Resume / Project"),
        ev("Assessment", "React assessment score: 84/100.", "HIGH", "Platform assessment"),
      ]),
      skill("JavaScript", 86, [ev("Assessment", "JavaScript assessment score: 88/100.", "HIGH", "Platform assessment")]),
      skill("Node.js", 74, [ev("Work Experience", "Built Node.js API endpoints at Trellis Labs.", "HIGH", "Resume / Work history")]),
      skill("SQL", 62, [ev("Project", "PostgreSQL schema for booking platform.", "MEDIUM", "Resume / Project")]),
      skill("Communication", 70, [ev("Portfolio", "Detailed case studies on personal site.", "MEDIUM", "Portfolio")]),
      skill("TypeScript", 60, [ev("Self-reported", "TypeScript listed in skills.", "LOW", "Resume")]),
    ],
  },
  {
    id: "cand-sneha",
    name: "Sneha Iyer",
    email: "sneha.iyer@example.com",
    phone: "+91 90876 55210",
    location: "Bengaluru, India",
    experienceYears: 2,
    targetRole: "Full Stack Developer",
    education: "B.E. Information Science, 2024",
    college: "BMS College of Engineering",
    collegeTier: 2,
    jobIds: ["job-fullstack", "job-analyst"],
    portfolio: "github.com/snehaiyer",
    certifications: ["Responsive Web Design (freeCodeCamp)"],
    assessments: [{ name: "React Assessment", score: 72, status: "Completed" }],
    projects: [
      {
        name: "Campus Marketplace",
        description: "React marketplace with Node.js services and MySQL storage.",
        skills: ["React", "Node.js", "SQL"],
      },
    ],
    workExperience: [
      {
        company: "Bytecraft Studio",
        role: "Frontend Developer",
        duration: "2024 – Present",
        summary: "Built React interfaces and design-system components.",
      },
    ],
    skills: [
      skill("React", 76, [
        ev("Work Experience", "Frontend developer working in React daily.", "HIGH", "Resume / Work history"),
        ev("Assessment", "React assessment score: 72/100.", "MEDIUM", "Platform assessment"),
      ]),
      skill("JavaScript", 72, [ev("Project", "Campus Marketplace front end.", "MEDIUM", "Resume / Project")]),
      skill("Node.js", 55, [ev("Project", "Node.js services for marketplace listings.", "MEDIUM", "Resume / Project")]),
      skill("SQL", 60, [ev("Project", "MySQL schema for marketplace.", "MEDIUM", "Resume / Project")]),
      skill("Communication", 80, [
        ev("Work Experience", "Ran weekly design and engineering sync meetings.", "HIGH", "Resume / Work history"),
      ]),
      skill("Data Visualization", 55, [ev("Project", "Built usage dashboards with Chart.js.", "MEDIUM", "Resume / Project")]),
    ],
  },
  {
    id: "cand-vikram",
    name: "Vikram Chauhan",
    email: "vikram.chauhan@example.com",
    phone: "+91 98111 20934",
    location: "Indore, India",
    experienceYears: 1,
    targetRole: "Full Stack Developer",
    education: "MCA, 2025",
    college: "Devi Ahilya Vishwavidyalaya",
    collegeTier: 3,
    jobIds: ["job-fullstack"],
    portfolio: "—",
    certifications: [],
    assessments: [{ name: "JavaScript Assessment", score: 58, status: "Completed" }],
    projects: [
      {
        name: "Blog CMS",
        description: "Simple content manager built with JavaScript and Express.",
        skills: ["JavaScript", "Node.js"],
      },
    ],
    workExperience: [],
    skills: [
      skill("React", 42, [ev("Self-reported", "React listed on resume, no project detail.", "LOW", "Resume")]),
      skill("JavaScript", 62, [ev("Assessment", "JavaScript assessment score: 58/100.", "MEDIUM", "Platform assessment")]),
      skill("Node.js", 58, [ev("Project", "Express backend for Blog CMS.", "MEDIUM", "Resume / Project")]),
      skill("SQL", 45, [ev("Self-reported", "MySQL listed without supporting evidence.", "NOT_VERIFIED", "Resume")]),
      skill("Communication", 55, [ev("Self-reported", "Resume mentions team collaboration.", "LOW", "Resume")]),
    ],
  },
  {
    id: "cand-meera",
    name: "Meera Nair",
    email: "meera.nair@example.com",
    phone: "+91 98450 77123",
    location: "Bengaluru, India",
    experienceYears: 2,
    targetRole: "Data Analyst",
    education: "B.Sc Statistics, 2024",
    college: "Christ University",
    collegeTier: 2,
    jobIds: ["job-analyst"],
    portfolio: "meeranair.works",
    certifications: ["Google Data Analytics Certificate"],
    assessments: [
      { name: "SQL Assessment", score: 86, status: "Completed" },
      { name: "Analytics Case Study", score: 80, status: "Completed" },
    ],
    projects: [
      {
        name: "Retail Sales Dashboard",
        description: "Power BI dashboard tracking regional sales performance.",
        skills: ["Data Visualization", "SQL"],
      },
    ],
    workExperience: [
      {
        company: "Metrics Ally",
        role: "Analyst",
        duration: "2024 – Present",
        summary: "Owned weekly reporting and ad-hoc SQL analysis.",
      },
    ],
    skills: [
      skill("SQL", 86, [
        ev("Assessment", "SQL assessment score: 86/100.", "HIGH", "Platform assessment"),
        ev("Work Experience", "Daily ad-hoc SQL analysis at Metrics Ally.", "HIGH", "Resume / Work history"),
      ]),
      skill("Data Visualization", 82, [
        ev("Project", "Retail Sales Dashboard built in Power BI.", "HIGH", "Resume / Project"),
        ev("Certification", "Google Data Analytics Certificate.", "HIGH", "Verified certificate"),
      ]),
      skill("Python", 55, [ev("Project", "Pandas scripts for data cleanup.", "MEDIUM", "Resume / Project")]),
      skill("Problem Solving", 78, [ev("Assessment", "Analytics case study score: 80/100.", "HIGH", "Platform assessment")]),
      skill("Communication", 82, [
        ev("Work Experience", "Presented weekly findings to business stakeholders.", "HIGH", "Resume / Work history"),
      ]),
      skill("Excel", 78, [ev("Work Experience", "Built recurring Excel models.", "MEDIUM", "Resume / Work history")]),
    ],
  },
  {
    id: "cand-arjun",
    name: "Arjun Pillai",
    email: "arjun.pillai@example.com",
    phone: "+91 97654 33091",
    location: "Kochi, India",
    experienceYears: 1,
    targetRole: "Data Analyst",
    education: "B.Com with Analytics, 2025",
    college: "Cochin College",
    collegeTier: 3,
    jobIds: ["job-analyst"],
    portfolio: "—",
    certifications: ["SQL Basics (HackerRank)"],
    assessments: [{ name: "SQL Assessment", score: 68, status: "Completed" }],
    projects: [
      {
        name: "Sales Trend Report",
        description: "Excel-based trend analysis for a retail store chain.",
        skills: ["Excel", "Data Visualization"],
      },
    ],
    workExperience: [],
    skills: [
      skill("SQL", 66, [ev("Assessment", "SQL assessment score: 68/100.", "MEDIUM", "Platform assessment")]),
      skill("Data Visualization", 58, [ev("Project", "Excel charts for sales trend report.", "MEDIUM", "Resume / Project")]),
      skill("Python", 30, [ev("Self-reported", "Python listed as beginner level.", "LOW", "Resume")]),
      skill("Problem Solving", 60, [ev("Project", "Structured trend analysis approach.", "MEDIUM", "Resume / Project")]),
      skill("Communication", 68, [ev("Self-reported", "Resume highlights presentation experience.", "LOW", "Resume")]),
      skill("Excel", 74, [ev("Certification", "SQL Basics certificate plus advanced Excel usage.", "MEDIUM", "Verified certificate")]),
    ],
  },
  {
    id: "cand-kavya",
    name: "Kavya Reddy",
    email: "kavya.reddy@example.com",
    phone: "+91 90000 45678",
    location: "Bengaluru, India",
    experienceYears: 3,
    targetRole: "Data Analyst",
    education: "M.Sc Data Science, 2023",
    college: "IIT Madras",
    collegeTier: 1,
    jobIds: ["job-analyst", "job-python"],
    portfolio: "kavyareddy.dev",
    certifications: ["Tableau Desktop Specialist"],
    assessments: [
      { name: "SQL Assessment", score: 91, status: "Completed" },
      { name: "Python Coding Assessment", score: 79, status: "Completed" },
    ],
    projects: [
      {
        name: "Churn Prediction Study",
        description: "Python and SQL analysis of subscription churn drivers.",
        skills: ["Python", "SQL"],
      },
      {
        name: "Executive KPI Dashboard",
        description: "Tableau dashboard used by the leadership team.",
        skills: ["Data Visualization"],
      },
    ],
    workExperience: [
      {
        company: "Insightloop",
        role: "Data Analyst",
        duration: "2023 – Present",
        summary: "Owned churn and retention reporting for two product lines.",
      },
    ],
    skills: [
      skill("SQL", 91, [
        ev("Assessment", "SQL assessment score: 91/100.", "HIGH", "Platform assessment"),
        ev("Work Experience", "Owned retention reporting pipelines.", "HIGH", "Resume / Work history"),
      ]),
      skill("Data Visualization", 84, [
        ev("Verified Credential", "Tableau Desktop Specialist credential verified.", "HIGH", "Credential issuer"),
        ev("Project", "Executive KPI dashboard in Tableau.", "HIGH", "Resume / Project"),
      ]),
      skill("Python", 79, [ev("Assessment", "Python coding assessment score: 79/100.", "HIGH", "Platform assessment")]),
      skill("Problem Solving", 82, [ev("Project", "Churn prediction study design.", "HIGH", "Resume / Project")]),
      skill("Communication", 76, [ev("Work Experience", "Presented churn findings to leadership.", "MEDIUM", "Resume / Work history")]),
      skill("REST APIs", 50, [ev("Self-reported", "Consumed APIs for data pulls.", "LOW", "Resume")]),
    ],
  },
  {
    id: "cand-imran",
    name: "Imran Sheikh",
    email: "imran.sheikh@example.com",
    phone: "+91 88991 22334",
    location: "Pune, India",
    experienceYears: 2,
    targetRole: "Python Developer",
    education: "B.E. Electronics, 2023",
    college: "Sinhgad College of Engineering",
    collegeTier: 3,
    jobIds: ["job-python"],
    portfolio: "github.com/imran-sheikh",
    certifications: ["AWS Cloud Practitioner"],
    assessments: [{ name: "Python Coding Assessment", score: 70, status: "Completed" }],
    projects: [
      {
        name: "IoT Data Collector",
        description: "Python service collecting sensor data and exposing REST endpoints.",
        skills: ["Python", "REST APIs"],
      },
    ],
    workExperience: [
      {
        company: "Volt Embedded",
        role: "Firmware Support Engineer",
        duration: "2023 – Present",
        summary: "Wrote Python tooling around embedded test benches.",
      },
    ],
    skills: [
      skill("Python", 72, [
        ev("Project", "IoT Data Collector service in Python.", "HIGH", "Resume / Project"),
        ev("Assessment", "Python coding assessment score: 70/100.", "MEDIUM", "Platform assessment"),
      ]),
      skill("SQL", 48, [ev("Self-reported", "SQLite usage mentioned briefly.", "LOW", "Resume")]),
      skill("REST APIs", 70, [ev("Project", "Exposed REST endpoints for sensor data.", "HIGH", "Resume / Project")]),
      skill("Problem Solving", 68, [ev("Work Experience", "Debugged embedded test failures.", "MEDIUM", "Resume / Work history")]),
      skill("Communication", 58, [ev("Self-reported", "Resume mentions cross-team coordination.", "LOW", "Resume")]),
      skill("AWS", 60, [ev("Certification", "AWS Cloud Practitioner certification.", "HIGH", "Verified certificate")]),
    ],
  },
  {
    id: "cand-neha",
    name: "Neha Bansal",
    email: "neha.bansal@example.com",
    phone: "+91 99112 87654",
    location: "Jaipur, India",
    experienceYears: 0,
    targetRole: "Python Developer",
    education: "B.Tech Computer Science, 2026",
    college: "Manipal University Jaipur",
    collegeTier: 2,
    jobIds: ["job-python"],
    portfolio: "nehabansal.dev",
    certifications: [],
    assessments: [{ name: "Python Coding Assessment", score: 66, status: "Pending" }],
    projects: [
      {
        name: "Study Planner App",
        description: "Flask app with SQLite storage built during final year.",
        skills: ["Python", "SQL"],
      },
    ],
    workExperience: [],
    skills: [
      skill("Python", 60, [ev("Project", "Flask study planner application.", "MEDIUM", "Resume / Project")]),
      skill("SQL", 52, [ev("Project", "SQLite schema for planner app.", "MEDIUM", "Resume / Project")]),
      skill("REST APIs", 40, [ev("Self-reported", "Basic Flask routing knowledge claimed.", "LOW", "Resume")]),
      skill("Problem Solving", 62, [ev("Portfolio", "Solved 200+ practice problems, profile linked.", "MEDIUM", "Portfolio")]),
      skill("Communication", 66, [ev("Portfolio", "Clear project write-ups on portfolio site.", "MEDIUM", "Portfolio")]),
    ],
  },
  {
    id: "cand-farhan",
    name: "Farhan Qureshi",
    email: "farhan.qureshi@example.com",
    phone: "+91 90909 12121",
    location: "Mumbai, India",
    experienceYears: 4,
    targetRole: "Full Stack Developer",
    education: "B.E. Computer Engineering, 2021",
    college: "VJTI Mumbai",
    collegeTier: 1,
    jobIds: ["job-fullstack"],
    portfolio: "farhanq.dev",
    certifications: ["Node.js Services Developer (verified)"],
    assessments: [{ name: "JavaScript Assessment", score: 80, status: "Completed" }],
    projects: [
      {
        name: "Logistics Console",
        description: "React dashboard plus Node.js microservices for a logistics firm.",
        skills: ["React", "Node.js", "SQL"],
      },
    ],
    workExperience: [
      {
        company: "Cargofy",
        role: "Senior Developer",
        duration: "2021 – Present",
        summary: "Led a three-person team building internal tooling.",
      },
    ],
    skills: [
      skill("React", 80, [ev("Work Experience", "Led React dashboard development at Cargofy.", "HIGH", "Resume / Work history")]),
      skill("JavaScript", 82, [ev("Assessment", "JavaScript assessment score: 80/100.", "HIGH", "Platform assessment")]),
      skill("Node.js", 86, [
        ev("Verified Credential", "Node.js Services Developer credential verified.", "HIGH", "Credential issuer"),
        ev("Project", "Node.js microservices for logistics console.", "HIGH", "Resume / Project"),
      ]),
      skill("SQL", 70, [ev("Work Experience", "Designed reporting tables for logistics data.", "MEDIUM", "Resume / Work history")]),
      skill("Communication", 84, [ev("Work Experience", "Led a three-person team and client demos.", "HIGH", "Resume / Work history")]),
    ],
  },
];

export const DEMO_CANDIDATES: Candidate[] = seeds.map((s) => ({
  ...s,
  isDemo: true,
  createdAt: "2026-08-05T09:00:00.000Z",
}));

export function buildDemoData(): AppData {
  return {
    jobs: DEMO_JOBS,
    candidates: DEMO_CANDIDATES,
    shortlists: [
      {
        id: "sl-1",
        jobId: "job-python",
        candidateId: "cand-anjali",
        score: 0,
        shortlistedAt: "2026-08-12T10:30:00.000Z",
        notes: "Strongest Python project evidence. Schedule a technical conversation.",
        status: "Interview planned",
      },
      {
        id: "sl-2",
        jobId: "job-python",
        candidateId: "cand-priya",
        score: 0,
        shortlistedAt: "2026-08-12T11:05:00.000Z",
        notes: "Excellent SQL evidence; probe REST API depth in interview.",
        status: "Under review",
      },
      {
        id: "sl-3",
        jobId: "job-fullstack",
        candidateId: "cand-rahul",
        score: 0,
        shortlistedAt: "2026-08-11T09:15:00.000Z",
        notes: "Verified React and Node.js signals across project and assessment.",
        status: "Interview planned",
      },
      {
        id: "sl-4",
        jobId: "job-analyst",
        candidateId: "cand-meera",
        score: 0,
        shortlistedAt: "2026-08-13T14:00:00.000Z",
        notes: "Dashboard portfolio is directly relevant to our reporting needs.",
        status: "Under review",
      },
      {
        id: "sl-5",
        jobId: "job-analyst",
        candidateId: "cand-kavya",
        score: 0,
        shortlistedAt: "2026-08-13T14:20:00.000Z",
        notes: "Deep SQL evidence. Confirm availability and notice period.",
        status: "On hold",
      },
    ],
    activity: [
      { id: "ac-1", message: "12 demo candidates added to Python Developer", at: "2026-08-14T08:12:00.000Z" },
      { id: "ac-2", message: "Anjali Rathod shortlisted for Python Developer", at: "2026-08-13T16:40:00.000Z" },
      { id: "ac-3", message: "Python Developer scoring rubric updated in Weight Studio", at: "2026-08-13T12:02:00.000Z" },
      { id: "ac-4", message: "Bias audit completed — 1 signal marked for review", at: "2026-08-12T18:20:00.000Z" },
    ],
    recruiter: {
      id: "rec-1",
      name: "Recruiter",
      email: "recruiter@cleartalent.ai",
      organization: "Clear Talent AI (Demo Org)",
    },
  };
}
