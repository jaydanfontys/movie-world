"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var dataPath = _path["default"].join(process.cwd(), "data", "players.json");

function readPlayers() {
  try {
    if (!_fs["default"].existsSync(dataPath)) {
      return {};
    }

    var fileContent = _fs["default"].readFileSync(dataPath, "utf-8");

    return JSON.parse(fileContent || "{}");
  } catch (error) {
    console.log("Could not read players.json", error);
    return {};
  }
}

function writePlayers(players) {
  try {
    _fs["default"].mkdirSync(_path["default"].dirname(dataPath), {
      recursive: true
    });

    _fs["default"].writeFileSync(dataPath, JSON.stringify(players, null, 2));
  } catch (error) {
    // On Vercel deployments, writes may not persist.
    // LocalStorage fallback remains available for session recovery.
    console.log("Could not write players.json. This is normal on some deployments.", error);
  }
}

function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  var player = request.body;

  if (!player || !player.name) {
    return response.status(400).json({
      error: "Player profile with name is required."
    });
  }

  var key = String(player.name).trim().toLowerCase();
  var players = readPlayers();
  players[key] = _objectSpread({}, player, {
    updatedAt: new Date().toISOString()
  });
  writePlayers(players);
  return response.status(200).json({
    success: true,
    player: players[key]
  });
}
//# sourceMappingURL=save-player.dev.js.map
