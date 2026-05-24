import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { diff, prTitle, prBody } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are a senior software engineer doing a code review.

PR Title: ${prTitle}
PR Description: ${prBody || "No description provided."}

Diff:
${diff}

Review this PR and provide:

## Summary
One paragraph overview of what this PR does.

## 🐛 Bugs & Issues
List any bugs, logic errors, or edge cases (bullet points). Say "None found" if clean.

## 🔒 Security
Any security vulnerabilities, auth issues, exposed secrets. Say "None found" if clean.

## ⚡ Performance
Any inefficient queries, memory leaks, unnecessary re-renders.

## 📝 Code Quality Score
Give a score from 1-10 with a one-line reason.

Be direct and specific. Reference exact line numbers or variable names where possible.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}