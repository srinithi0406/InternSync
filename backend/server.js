import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import generateReportRoute from "./routes/generateReport.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", generateReportRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Groq key exists:", !!process.env.GROQ_API_KEY);
  console.log("Groq key starts with:", process.env.GROQ_API_KEY?.slice(0, 10));
  const key = process.env.GROQ_API_KEY;
  console.log(`DEBUG: Key Length is ${key?.length}`);
  console.log(`DEBUG: Key ends with: ${key?.slice(-4)}`);
});