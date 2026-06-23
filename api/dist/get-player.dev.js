"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handler;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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

function handler(request, response) {
  var name = String(request.query.name || "").trim().toLowerCase();

  if (!name) {
    return response.status(400).json({
      error: "Player name is required."
    });
  }

  var players = readPlayers();
  var player = players[name] || null;
  return response.status(200).json({
    player: player
  });
}
//# sourceMappingURL=get-player.dev.js.map
