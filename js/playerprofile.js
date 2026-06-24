// ===============================
// PLAYER PROFILE SYSTEM
// ===============================
// Integrates the front-end with the backend API.
// Uses localStorage as a fallback for deployments without persistent storage.

const ALL_WORLDS = ["hub", "movie", "tv", "game", "music", "anime"];

const playerNameInput = document.querySelector("#playerNameInput");
const loadPlayerBtn = document.querySelector("#loadPlayerBtn");
const playerProfileMessage = document.querySelector("#playerProfileMessage");
const playerStatsPreview = document.querySelector("#playerStatsPreview");
const playerHud = document.querySelector("#playerHud");
const playerHudName = document.querySelector("#playerHudName");
const playerHudStats = document.querySelector("#playerHudStats");

let currentProfile = null;
let sessionStartTime = null;

function cleanName(name) {
  return String(name || "").trim().replace(/\s+/g, " ");
}

function getStorageKey(name) {
  return `ved_player_${name.toLowerCase()}`;
}

function getTodayText() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function createNewProfile(name, selectedCar = "redBlock", totalCoins = 0) {
  return {
    name,
    selectedCar,
    coinsCollected: 0,
    totalCoins,
    visitedWorlds: ["hub"],
    unvisitedWorlds: ["movie", "tv", "game", "music", "anime"],
    currentPlayTimeSeconds: 0,
    bestCompletionTimeSeconds: null,
    bestCompletionTime: "Not completed yet",
    lastPlayed: getTodayText(),
    hasFinishedCoinHunt: false
  };
}

async function apiGetPlayer(name) {
  try {
    const response = await fetch(`/api/get-player?name=${encodeURIComponent(name)}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.player || null;
  } catch (error) {
    console.log("Backend get-player failed, using localStorage instead.", error);
    return null;
  }
}

async function apiSavePlayer(profile) {
  try {
    await fetch("/api/save-player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    });
  } catch (error) {
    console.log("Backend save-player failed, localStorage still saved it.", error);
  }
}

function loadFromLocalStorage(name) {
  const saved = localStorage.getItem(getStorageKey(name));

  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch (error) {
    console.log("Saved player profile was broken, creating a new one.", error);
    return null;
  }
}

function saveToLocalStorage(profile) {
  localStorage.setItem(getStorageKey(profile.name), JSON.stringify(profile));
}

async function loadPlayerProfile(name, selectedCar = "redBlock", totalCoins = 0) {
  const cleanPlayerName = cleanName(name);

  if (!cleanPlayerName) {
    setMessage("Please enter your name first.", true);
    return null;
  }

  let profile = await apiGetPlayer(cleanPlayerName);

  if (!profile) {
    profile = loadFromLocalStorage(cleanPlayerName);
  }

  if (profile) {
    profile.totalCoins = profile.totalCoins || totalCoins;
    profile.unvisitedWorlds = ALL_WORLDS.filter((world) => !profile.visitedWorlds?.includes(world));
    setMessage(`Welcome back, ${profile.name}! Your progress has been loaded.`, false);
  } else {
    profile = createNewProfile(cleanPlayerName, selectedCar, totalCoins);
    setMessage(`Welcome, ${profile.name}! A new profile has been created.`, false);
  }

  currentProfile = profile;
  saveToLocalStorage(currentProfile);
  await apiSavePlayer(currentProfile);
  updateProfileUI();

  return currentProfile;
}

function setMessage(message, isError = false) {
  if (!playerProfileMessage) return;

  playerProfileMessage.textContent = message;
  playerProfileMessage.style.color = isError ? "#ff6b6b" : "#ffcc66";
}

function updateProfileUI() {
  if (!currentProfile) return;

  const visited = currentProfile.visitedWorlds?.length || 0;
  const totalWorlds = ALL_WORLDS.length;
  const coins = currentProfile.coinsCollected || 0;
  const totalCoins = currentProfile.totalCoins || 0;
  const car = currentProfile.selectedCar || "redBlock";
  const lastPlayed = currentProfile.lastPlayed || getTodayText();
  const bestTime = currentProfile.bestCompletionTime || "Not completed yet";

  if (playerStatsPreview) {
    playerStatsPreview.classList.remove("hidden");
    playerStatsPreview.innerHTML = `
      <span><strong>Name:</strong> ${currentProfile.name}</span>
      <span><strong>Last car:</strong> ${car}</span>
      <span><strong>Coins:</strong> ${coins}/${totalCoins}</span>
      <span><strong>Visited worlds:</strong> ${visited}/${totalWorlds}</span>
      <span><strong>Still need:</strong> ${currentProfile.unvisitedWorlds?.join(", ") || "None"}</span>
      <span><strong>Best time:</strong> ${bestTime}</span>
      <span><strong>Last played:</strong> ${lastPlayed}</span>
    `;
  }

  if (playerHud && playerHudName && playerHudStats) {
    playerHud.classList.remove("hidden");
    playerHudName.textContent = currentProfile.name;
    playerHudStats.textContent = `${coins}/${totalCoins} coins • ${visited}/${totalWorlds} worlds visited`;
  }
}

async function saveProgress(progress = {}) {
  if (!currentProfile) return;

  currentProfile = {
    ...currentProfile,
    ...progress,
    lastPlayed: getTodayText()
  };

  currentProfile.visitedWorlds = Array.from(new Set(currentProfile.visitedWorlds || ["hub"]));
  currentProfile.unvisitedWorlds = ALL_WORLDS.filter((world) => !currentProfile.visitedWorlds.includes(world));

  saveToLocalStorage(currentProfile);
  updateProfileUI();

  // Persist progress to the backend without delaying gameplay.
  apiSavePlayer(currentProfile);
}

async function startSession(options = {}) {
  const name = cleanName(playerNameInput?.value);

  if (!name) {
    setMessage("Please enter your name before starting.", true);
    playerNameInput?.focus();
    return null;
  }

  const profile = await loadPlayerProfile(
    name,
    options.selectedCar || "redBlock",
    options.totalCoins || 0
  );

  if (!profile) return null;

  sessionStartTime = performance.now();

  await saveProgress({
    selectedCar: profile.selectedCar || options.selectedCar || "redBlock",
    totalCoins: options.totalCoins || profile.totalCoins || 0,
    currentPlayTimeSeconds: 0
  });

  return currentProfile;
}

function getElapsedSeconds() {
  if (!sessionStartTime) return currentProfile?.currentPlayTimeSeconds || 0;

  return Math.floor((performance.now() - sessionStartTime) / 1000);
}

function markWorldVisited(worldKey) {
  if (!currentProfile || !worldKey || worldKey === "bridge") return;

  const visitedWorlds = Array.from(new Set([...(currentProfile.visitedWorlds || []), worldKey]));

  saveProgress({
    visitedWorlds,
    currentPlayTimeSeconds: getElapsedSeconds()
  });
}

function finishCoinHunt() {
  if (!currentProfile) return;

  const completionSeconds = getElapsedSeconds();
  const currentBest = currentProfile.bestCompletionTimeSeconds;
  const isNewBest = currentBest === null || currentBest === undefined || completionSeconds < currentBest;

  saveProgress({
    hasFinishedCoinHunt: true,
    currentPlayTimeSeconds: completionSeconds,
    bestCompletionTimeSeconds: isNewBest ? completionSeconds : currentBest,
    bestCompletionTime: isNewBest ? formatTime(completionSeconds) : currentProfile.bestCompletionTime
  });
}

if (loadPlayerBtn) {
  loadPlayerBtn.addEventListener("click", () => {
    loadPlayerProfile(playerNameInput?.value);
  });
}

if (playerNameInput) {
  playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadPlayerProfile(playerNameInput.value);
    }
  });
}

window.addEventListener("beforeunload", () => {
  if (!currentProfile) return;

  currentProfile.currentPlayTimeSeconds = getElapsedSeconds();
  currentProfile.lastPlayed = getTodayText();
  saveToLocalStorage(currentProfile);
});

window.PlayerProfile = {
  startSession,
  saveProgress,
  markWorldVisited,
  finishCoinHunt,
  getElapsedSeconds,
  getProfile() {
    return currentProfile;
  }
};