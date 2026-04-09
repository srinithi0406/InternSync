import { Zap, Target, FileText, Flame, BookOpen, Briefcase } from "lucide-react";

export const FEATURES = [
  {
    icon: Zap,
    title: "Weekly Task Tracker",
    desc: "Log tasks with difficulty, time spent, and skills. Notion-style cards that actually work for interns.",
    tag: "Core",
    color: "#00D4FF",
  },
  {
    icon: Target,
    title: "Skill Radar Chart",
    desc: "Visualise your growth across React, Git, APIs and more.",
    tag: "Analytics",
    color: "#00FF87",
  },
  {
    icon: FileText,
    title: "Report Generator",
    desc: "One click report export.",
    tag: "Unique",
    color: "#8B5CF6",
  },
  {
    icon: Flame,
    title: "Streak System",
    desc: "Stay consistent daily.",
    tag: "Gamified",
    color: "#F59E0B",
  },
  {
    icon: BookOpen,
    title: "Reflection Journal",
    desc: "Capture learnings weekly.",
    tag: "Journal",
    color: "#00D4FF",
  },
  {
    icon: Briefcase,
    title: "Resume Bullet Generator",
    desc: "Convert tasks to resume points.",
    tag: "Career",
    color: "#00FF87",
  },
];

export const STATS = [
  { value: "12+", label: "Features Built", mono: true },
  { value: "100%", label: "Free & Open Source", mono: false },
  { value: "∞", label: "Reports Generated", mono: true },
];

export const TIMELINE = [
  { week: "Week 1", title: "Learned React Basics", skill: "React" },
  { week: "Week 2", title: "Built API Integration", skill: "REST API" },
  { week: "Week 3", title: "Implemented Auth", skill: "Security" },
  { week: "Week 4", title: "UI Animations", skill: "Motion" },
];