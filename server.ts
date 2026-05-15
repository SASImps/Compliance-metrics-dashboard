import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Mitigation Intelligence API
  app.post("/api/mitigation", async (req, res) => {
    try {
      const { finding } = req.body;
      if (!finding) {
        return res.status(400).json({ error: "No finding provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ 
          error: "Gemini API key not configured. Please add it in Settings > Secrets." 
        });
      }

      const prompt = `
        You are a GRC (Governance, Risk, and Compliance) expert. 
        Analyze the following audit finding and provide specific, actionable remediation steps.
        
        Finding ID: ${finding.id}
        Title: ${finding.title}
        Severity: ${finding.severity}
        Framework: ${finding.framework}
        
        Provide your response in a clear, professional style suitable for a corporate compliance report.
        Focus on:
        1. Immediate containment/mitigation.
        2. Long-term systemic fixes.
        3. Specific evidence required to close the finding.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      res.json({ remediation: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate remediation guidance" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
