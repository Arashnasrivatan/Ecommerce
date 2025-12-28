import { MongoClient, Db } from "mongodb";
import configs from "./configs";

let db: Db;
let client: MongoClient;

export const connectToMongo = async (): Promise<Db> => {
  if (db) return db;

  const uri = configs.mongoURI;
  client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    db = client.db();
    return db;
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

export const disconnectFromMongo = async (): Promise<void> => {
  try {
    if (client) {
      await client.close();
      console.log("🔌 Disconnected from MongoDB");
      db = undefined as unknown as Db;
    }
  } catch (err) {
    console.error("❌ Failed to disconnect MongoDB", err);
  }
};
