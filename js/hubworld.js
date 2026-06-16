import * as THREE from "three";

// ===============================
// CREATE CENTRAL HUB
// ===============================

export function createHubWorld(scene, createFloatingText, position) {
  const hubGroup = new THREE.Group();
  hubGroup.position.set(position.x, 0, position.z);

  const hubGround = new THREE.Mesh(
    new THREE.CircleGeometry(position.radius, 90),
    new THREE.MeshStandardMaterial({
      color: "#171717",
      roughness: 0.8
    })
  );
  hubGround.rotation.x = -Math.PI / 2;
  hubGroup.add(hubGround);

  const hubRoad = new THREE.Mesh(
    new THREE.RingGeometry(18, 24, 100),
    new THREE.MeshStandardMaterial({
      color: "#0d0d0d",
      roughness: 0.7
    })
  );
  hubRoad.rotation.x = -Math.PI / 2;
  hubRoad.position.y = 0.03;
  hubGroup.add(hubRoad);

  const centerPlatform = new THREE.Mesh(
    new THREE.CircleGeometry(12, 60),
    new THREE.MeshStandardMaterial({
      color: "#263238",
      emissive: "#263238",
      emissiveIntensity: 0.35
    })
  );
  centerPlatform.rotation.x = -Math.PI / 2;
  centerPlatform.position.y = 0.06;
  hubGroup.add(centerPlatform);

  const title = createFloatingText("WORLD OF ENTERTAINMENT", "#ffffff");
  title.position.set(-13, 13, 0);
  hubGroup.add(title);

  const subtitle = createFloatingText("CENTRAL HUB", "#ffcc66");
  subtitle.position.set(-6, 9, 8);
  hubGroup.add(subtitle);

  addHubDecorations(hubGroup);

  scene.add(hubGroup);

  return {
    hubGroup
  };
}

// ===============================
// HUB DECORATIONS
// ===============================

function addHubDecorations(group) {
  const colors = ["#ffcc66", "#7cc7ff", "#ff8ee8", "#80ed99", "#ff6b6b"];

  for (let i = 0; i < 18; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 32 + Math.random() * 18;
    const color = colors[i % colors.length];

    const pillar = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 4 + Math.random() * 4, 1.1),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.25
      })
    );

    pillar.position.set(
      Math.cos(angle) * radius,
      pillar.geometry.parameters.height / 2,
      Math.sin(angle) * radius
    );

    group.add(pillar);
  }
}