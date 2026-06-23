import fs from "fs";
import path from "path";

const dataPath = path.join(process.cwd(), "data", "players.json");

function readPlayers() {
  try {
    if (!fs.existsSync(dataPath)) {
      return {};
    }

    const fileContent = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(fileContent || "{}");
  } catch (error) {
    console.log("Could not read players.json", error);
    return {};
  }
}

export default function handler(request, response) {
  const name = String(request.query.name || "").trim().toLowerCase();

  if (!name) {
    return response.status(400).json({ error: "Player name is required." });
  }

  const players = readPlayers();
  const player = players[name] || null;

  return response.status(200).json({ player });
}