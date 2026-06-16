"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHubWorld = createHubWorld;

var THREE = _interopRequireWildcard(require("three"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// ===============================
// CREATE CENTRAL HUB
// ===============================
function createHubWorld(scene, createFloatingText, position) {
  var hubGroup = new THREE.Group();
  hubGroup.position.set(position.x, 0, position.z);
  var hubGround = new THREE.Mesh(new THREE.CircleGeometry(position.radius, 90), new THREE.MeshStandardMaterial({
    color: "#171717",
    roughness: 0.8
  }));
  hubGround.rotation.x = -Math.PI / 2;
  hubGroup.add(hubGround);
  var hubRoad = new THREE.Mesh(new THREE.RingGeometry(18, 24, 100), new THREE.MeshStandardMaterial({
    color: "#0d0d0d",
    roughness: 0.7
  }));
  hubRoad.rotation.x = -Math.PI / 2;
  hubRoad.position.y = 0.03;
  hubGroup.add(hubRoad);
  var centerPlatform = new THREE.Mesh(new THREE.CircleGeometry(12, 60), new THREE.MeshStandardMaterial({
    color: "#263238",
    emissive: "#263238",
    emissiveIntensity: 0.35
  }));
  centerPlatform.rotation.x = -Math.PI / 2;
  centerPlatform.position.y = 0.06;
  hubGroup.add(centerPlatform);
  var title = createFloatingText("WORLD OF ENTERTAINMENT", "#ffffff");
  title.position.set(-13, 13, 0);
  hubGroup.add(title);
  var subtitle = createFloatingText("CENTRAL HUB", "#ffcc66");
  subtitle.position.set(-6, 9, 8);
  hubGroup.add(subtitle);
  addHubDecorations(hubGroup);
  scene.add(hubGroup);
  return {
    hubGroup: hubGroup
  };
} // ===============================
// HUB DECORATIONS
// ===============================


function addHubDecorations(group) {
  var colors = ["#ffcc66", "#7cc7ff", "#ff8ee8", "#80ed99", "#ff6b6b"];

  for (var i = 0; i < 18; i++) {
    var angle = Math.random() * Math.PI * 2;
    var radius = 32 + Math.random() * 18;
    var color = colors[i % colors.length];
    var pillar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 4 + Math.random() * 4, 1.1), new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.25
    }));
    pillar.position.set(Math.cos(angle) * radius, pillar.geometry.parameters.height / 2, Math.sin(angle) * radius);
    group.add(pillar);
  }
}
//# sourceMappingURL=hubworld.dev.js.map
