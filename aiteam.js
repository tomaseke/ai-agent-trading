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
    goal: "Use the tool available to provide accurate analysis of a website (the tool already knows what url it should access)",
    background: "Website analysis expert that specializes in analyzing websites for crypto projects",
    tools: [ragTool],
  });

  const websiteAnalysis = new Task({
    title: "Website Analysis and Summary",
    description: "Analyze a website and provide a summary of the most important information for given crypto project (idea, team, uniqueness, etc.)",
    expectedOutput: "Website Analysis and Summary that include the most important information about the project to analyze its potential",
    agent: websiteAnalyst,
  });

  const team = new Team({
    name: "Crypto project analysis team",
    agents: [websiteAnalyst],
    tasks: [websiteAnalysis],
    env: { OPENAI_API_KEY: process.env.OPENAI_API_KEY },
    logLevel: "debug",
  });

  return team;
}

export default createTeam;
