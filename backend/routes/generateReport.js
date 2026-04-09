import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

let groq;

router.post("/generate-report", async (req, res) => {
  try {
    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    const { internship, tasks, reflections } = req.body;

    if (!internship) {
      return res.status(400).json({ error: "Internship details are required." });
    }

    const prompt = `
You are an expert internship report writer.

Using the internship details, tasks logged, and weekly reflections provided below, write ONE polished, professional, submission-ready internship report.

IMPORTANT INSTRUCTIONS:
- Write in first person using "I", "my", and "me", but maintain a formal, academic tone suitable for college submission.
- Use professional vocabulary — avoid casual, conversational, or AI-sounding phrases like "This report details...", "In conclusion...", "I had the opportunity to...".
- Do not simply repeat raw bullet data — synthesize it into a cohesive, polished narrative.
- The final_report MUST be exactly 2-3 well-developed paragraphs, separated by "\\n\\n". Each paragraph should be 4-6 sentences long.
- Make it suitable for official college submission, academic review, or portfolio use.
- It should read like a real student wrote it for their university internship report.
- Return STRICT JSON only. No markdown fences. No extra text before or after JSON.

Return JSON in exactly this format:
{
  "overall_summary": "A 2-3 sentence executive summary of the internship.",
  "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"],
  "challenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
  "skills_gained": ["Skill 1", "Skill 2", "Skill 3"],
  "reflection_summary": "A 2-3 sentence summary of reflections and personal growth.",
  "final_report": "First paragraph covering introduction and work done...\\n\\nSecond paragraph covering skills, challenges, and reflections...\\n\\nOptional third paragraph with conclusion."
}

INTERNSHIP DETAILS:
${JSON.stringify(internship, null, 2)}

TASKS:
${JSON.stringify(tasks, null, 2)}

REFLECTIONS:
${JSON.stringify(reflections, null, 2)}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    const text = result.choices[0].message.content.trim();

    // Strip markdown code fences if the LLM wraps its response
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse error. Raw LLM output:", text);
      return res.status(500).json({
        error: "LLM returned invalid JSON.",
        raw: text,
      });
    }

    return res.json({
      overall_summary: parsed.overall_summary || "",
      achievements: parsed.achievements || [],
      challenges: parsed.challenges || [],
      skills_gained: parsed.skills_gained || [],
      reflection_summary: parsed.reflection_summary || "",
      final_report: parsed.final_report || "",
    });
  } catch (error) {
    console.error("Generate report error:", error);
    return res.status(500).json({
      error: "Failed to generate report.",
      details: error.message,
    });
  }
});

export default router;