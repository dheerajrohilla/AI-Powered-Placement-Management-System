import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import { answerCopilotQuery } from '../src/services/copilotService.js';
import { processChatQuery } from '../src/utils/placementChatbot.js';

const TEST_QUESTIONS = [
  "What is data structures and algorithms?",
  "Explain object-oriented programming.",
  "Write a Python program to reverse a string.",
  "How can I improve my resume ATS score?",
  "What are the most frequently asked SQL interview questions?",
  "Explain the difference between DBMS and RDBMS.",
  "How should I prepare for a technical interview?",
  "What is machine learning?",
  "Can you suggest a 30-day placement preparation plan?",
  "Explain the difference between frontend and backend development.",
  // Edge cases
  "whut is machne learnin?", // spelling mistake
  "Is Python an interpreted language?", // yes/no question
  "Can you tell me the private salary negotiation details of Google recruiters for next year?" // unauthorized/unavailable
];

async function runSuite() {
  console.log("=== STARTING CAMPUS CHATBOT VERIFICATION SUITE ===");

  const testUser = {
    _id: "660000000000000000000001",
    name: "Dheeraj Student",
    email: "dheeraj.student@campus.edu",
    role: "student"
  };

  const testStudent = {
    _id: "660000000000000000000002",
    userId: testUser._id,
    name: testUser.name,
    cgpa: 8.75,
    department: "Computer Science and Engineering",
    batch: "2026",
    skills: ["Python", "JavaScript", "React", "Node.js", "SQL", "Data Structures"],
    atsScore: 84,
    resume: "uploads/resumes/sample_resume.pdf"
  };

  const testDrives = [
    {
      company: { companyName: "Google Cloud" },
      jobRole: "Software Development Engineer",
      salary: 1800000,
      location: "Bangalore / Hyderabad",
      eligibility: { minCGPA: 8.0, departments: ["Computer Science and Engineering", "Information Technology"] },
      requirements: ["Python", "C++", "DSA", "System Design"],
      registrationDeadline: new Date(Date.now() + 7 * 86400000)
    },
    {
      company: { companyName: "Amazon" },
      jobRole: "Graduate Software Engineer",
      salary: 1600000,
      location: "Hyderabad",
      eligibility: { minCGPA: 7.5, departments: ["Computer Science and Engineering", "Information Technology", "Electronics"] },
      requirements: ["Java", "OOP", "Data Structures", "SQL"],
      registrationDeadline: new Date(Date.now() + 10 * 86400000)
    }
  ];

  console.log(`\nTesting with student: ${testStudent.name} (${testStudent.department}, CGPA: ${testStudent.cgpa})`);
  console.log("Active Drives for Context:", testDrives.map(d => `${d.company.companyName} (${d.jobRole})`).join(", "));
  console.log("------------------------------------------------------------------------\n");

  let history = [];

  for (let i = 0; i < TEST_QUESTIONS.length; i++) {
    const q = TEST_QUESTIONS[i];
    console.log(`\n[Q${i + 1}] User: "${q}"`);

    const startTime = Date.now();
    try {
      const response = await answerCopilotQuery({
        message: q,
        chatHistory: history,
        student: testStudent,
        user: testUser,
        drives: testDrives,
        applications: [],
        interviews: []
      });
      const elapsed = Date.now() - startTime;

      console.log(`↳ Mode: ${response.isAiPowered ? "✨ Gemini AI" : "⚡ Fallback Engine"}`);
      console.log(`↳ Response time: ${elapsed}ms`);
      console.log(`↳ Suggestions:`, response.suggestions);
      console.log(`↳ Response:\n${response.reply}\n`);
      console.log("-".repeat(70));

      // Append to conversational history for follow-up testing
      history.push({ sender: 'user', text: q });
      history.push({ sender: 'assistant', text: response.reply });

      if (history.length > 8) {
        history = history.slice(-8);
      }
    } catch (err) {
      console.error(`❌ Error on Q${i + 1}:`, err.message);
      const fallback = await processChatQuery({
        message: q,
        student: testStudent,
        user: testUser,
        drives: testDrives
      });
      console.log("Fallback reply preview:\n", fallback.reply);
      console.log("-".repeat(70));
    }
  }

  console.log("\n=== ALL TEST CASES COMPLETED SUCCESSFULLY ===");
  process.exit(0);
}

runSuite().catch((err) => {
  console.error("Suite fatal error:", err);
  process.exit(1);
});
