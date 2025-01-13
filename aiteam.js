import { Agent, Task, Team } from "kaibanjs";
import dotenv from "dotenv";
import { WebRAGTool } from "./tools.js";
dotenv.config();

// 1. Generic
// 2. Idea uniqueness
// 3. Bundled
// 4. Price
// 5. Has team

function createTeam(token) {
  const ragTool = new WebRAGTool({ url: token.detail.website });

  const websiteAnalyst = new Agent({
    name: "Advanced Website Analyst",
    role: "Assistant",
    goal: "Use the tool available to provide accurate analysis of a website (the tool already knows what url it should access), just call the tool",
    background: "Website analysis expert that specializes in analyzing websites for crypto projects",
    tools: [ragTool],
  });

  const ideaEvaluator = new Agent({
    name: "Crypto project idea evaluator",
    role: "Assistant",
    goal: "Evaluate the uniqueness of the idea of crypto project",
    background: "Crypto expert that specializes in evaluating the uniqueness of crypto projects",
  });

  const uniquenessEvaluator = new Agent({
    name: "Crypto project uniqueness evaluator",
    role: "Assistant",
    goal: "Evaluate the uniqueness of the idea",
    background: "Crypto expert that specializes in evaluating the uniqueness of crypto projects",
  });

  const larpEvaluator = new Agent({
    name: "Crypto project LARP evaluator",
    role: "Assistant",
    goal: "Evaluate whether the idea has a real merit/use case or is most probably a scam",
    background: "Crypto expert that specializes in evaluating the real usecase of crypto projects, IMPORTANT: if the project descriptions are too vague and are using AI just as a buzzword, it's most probably a scam",
  });

  const summarizer = new Agent({
    name: "Summarization expert",
    role: "Assistant",
    goal: "Summarize the output of the previous agents",
    background: "Summarization expert that specializes in summarizing the output of other agents into a concise summary that doesn't leave out any important information",
  });

  const websiteAnalysis = new Task({
    title: "Website Analysis and Summary",
    description: "Analyze a website and provide a summary of the most important information for given crypto project (idea, team, uniqueness, etc.)",
    expectedOutput: "Website Analysis and Summary that include the most important information about the project to analyze its potential",
    agent: websiteAnalyst,
  });

  const ideaEvaluation = new Task({
    title: "Evaluation of the idea",
    description: "Analyze how good of an idea the project is",
    expectedOutput: "Overall summary evaluation of the idea",
    agent: ideaEvaluator,
  });

  const uniquenessEvaluation = new Task({
    title: "Uniqueness of the idea",
    description: "Analyzes how unique the idea is",
    expectedOutput: "From 1 to 10, how unique the idea is",
    agent: uniquenessEvaluator,
  });

  const larpEvaluation = new Task({
    title: "LARP evaluation",
    description: "Analyze whether the idea has a real merit/use case or is most probably a scam",
    expectedOutput: "From 1 to 10, how likely the project is a scam",
    agent: larpEvaluator,
  });

  const summary = new Task({
    title: "Summary of the analysis",
    description: "Analyze whether the idea has a real merit/use case or is most probably a scam",
    expectedOutput: "Return a JSON object with the summary of the analysis, larp evaluation, uniqueness evaluation, idea evaluation",
    agent: summarizer,
  });

  const team = new Team({
    name: "Crypto project analysis team",
    agents: [websiteAnalyst, ideaEvaluator, uniquenessEvaluator, larpEvaluator, summarizer],
    tasks: [websiteAnalysis, ideaEvaluation, uniquenessEvaluation, larpEvaluation, summary],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
    logLevel: "debug",
  });

  return team;
}

export default createTeam;
