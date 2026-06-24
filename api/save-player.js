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

function writePlayers(players) {
  try {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(players, null, 2));
  } catch (error) {
    // On Vercel deployments, writes may not persist.
    // LocalStorage fallback remains available for session recovery.
    console.log("Could not write players.json. This is normal on some deployments.", error);
  }
}

export default function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Only POST requests are allowed." });
  }

  const player = request.body;

  if (!player || !player.name) {
    return response.status(400).json({ error: "Player profile with name is required." });
  }

  const key = String(player.name).trim().toLowerCase();
  const players = readPlayers();

  players[key] = {
    ...player,
    updatedAt: new Date().toISOString()
  };

  writePlayers(players);

  return response.status(200).json({
    success: true,
    player: players[key]
  });
}