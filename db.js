import loki from "lokijs";
import logger from "./logger.js";
import dotenv from "dotenv";
import LokiFsStructuredAdapter from "lokijs/src/loki-fs-structured-adapter.js";
import _ from "lodash";

dotenv.config();

let db;

if (!db) {
  db = new loki("db/trading.db", { persistenceMethod: "fs", adapter: new LokiFsStructuredAdapter(), autosave: true, autosaveInterval: 60000 });
  await new Promise((resolve, reject) => {
    db.loadDatabase({}, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  logger.info("Database loaded");
  const tokensCollection = db.getCollection("tokens") ?? db.addCollection("tokens");
  tokensCollection.ensureIndex("mint");
}

export default db;
