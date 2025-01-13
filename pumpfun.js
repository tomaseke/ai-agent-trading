import WebSocket from "ws";
import _ from "lodash";
import logger from "./logger.js";
import dotenv from "dotenv";
import fs from "fs";
import db from "./db.js";
import analyzeToken from "./analyze.js";
import { hasTokenBeenDone, isDevHolding } from "./utils.js";

dotenv.config();

export async function open() {
  const ws = new WebSocket("wss://pumpportal.fun/api/data");
  logger.info("Opening Websocket...");

  async function saveToken(token) {
    let detail, isWebsiteLegit, isTwitterLegit;
    try {
      detail = await (await fetch(token.uri)).json();
      isWebsiteLegit = detail?.website && !["https://x.com", "https://t.me"].some((e) => new RegExp(e).test(detail.website)) && (await fetch(detail.website))?.ok;
      isTwitterLegit = new RegExp("https://x.com").test(detail?.twitter);
    } finally {
      const data = { ...token, detail, isWebsiteLegit, isTwitterLegit };
      db.getCollection("tokens").insert(data);
      return data;
    }
  }

  ws.on("open", async () => {
    ws.send(JSON.stringify({ method: "subscribeNewToken" }));
  });

  ws.on("error", (e) => logger.info("WebSocket error:", e));
  ws.on("close", () => logger.info("WebSocket closed, reconnecting...") ?? setTimeout(open, 1000));
  ws.on("message", async (data) => {
    const parsed = { ...JSON.parse(data), timestamp: new Date().toISOString() };
    // logger.info(parsed);
    if (parsed.message) return;
    if (parsed.txType === "create") {
      ws.send(JSON.stringify({ method: "subscribeTokenTrade", keys: [parsed.mint] }));
      const token = await saveToken(parsed);
      const isCopy = await hasTokenBeenDone(token);
      if (token.isWebsiteLegit && token.isTwitterLegit && !isCopy) {
        logger.info(`Token ${token.name} website and twitter is legit`);
        const analysis = await analyzeToken(token);
        if (analysis) {
          logger.info(`Token ${token.name} is a good buy`);
          const isDevStillHolding = await isDevHolding(token);
          if (isDevStillHolding) {
            // buy
          }
        }
      }
    }
  });
}
