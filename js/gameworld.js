import * as THREE from "three";

// ===============================
// GAME WORLD DATA
// ===============================

export const gameWorldData = [
  {
    name: "PlayStation",
    color: "#3b82f6",
    angle: 0,
    description: "Console games known for cinematic single-player stories, exclusives, and action adventures.",
    games: [
      {
        title: "God of War Ragnarök",
        note: "Cinematic action-adventure with mythology.",
        trailer: "https://www.youtube.com/embed/EE-4GvjKcfs"
      },
      {
        title: "Spider-Man 2",
        note: "Superhero action game with fast movement.",
        trailer: "https://www.youtube.com/embed/qIQ3xNqkVC4"
      }
    ]
  },
  {
    name: "Xbox",
    color: "#22c55e",
    angle: Math.PI / 3,
    description: "Console gaming focused on action, racing, shooters, and Game Pass-style discovery.",
    games: [
      {
        title: "Forza Horizon 5",
        note: "Open-world racing with cars and festivals.",
        trailer: "https://www.youtube.com/embed/FYH9n37B7Yw"
      },
      {
        title: "Halo Infinite",
        note: "Sci-fi shooter with classic Xbox identity.",
        trailer: "https://www.youtube.com/embed/PyMlV5_HRWk"
      }
    ]
  },
  {
    name: "PC / Steam",
    color: "#60a5fa",
    angle: (Math.PI / 3) * 2,
    description: "PC gaming with Steam, mods, indie games, high performance, and many genres.",
    games: [
      {
        title: "Baldur's Gate 3",
        note: "Fantasy RPG with deep choices.",
        trailer: "https://www.youtube.com/embed/1T22wNvoNiU"
      },
      {
        title: "Counter-Strike 2",
        note: "Competitive PC shooter.",
        trailer: "https://www.youtube.com/embed/c80dVYcL69E"
      }
    ]
  },
  {
    name: "Racing",
    color: "#facc15",
    angle: Math.PI,
    description: "Fast car games focused on driving, speed, tracks, and open-world racing.",
    games: [
      {
        title: "Gran Turismo 7",
        note: "Realistic racing for car fans.",
        trailer: "https://www.youtube.com/embed/1tBUsXIkG1A"
      },
      {
        title: "Need for Speed Unbound",
        note: "Arcade street racing with style.",
        trailer: "https://www.youtube.com/embed/H2Y8XCe7F9E"
      }
    ]
  },
  {
    name: "Horror Games",
    color: "#c084fc",
    angle: (Math.PI / 3) * 4,
    description: "Scary games focused on tension, survival, darkness, and atmosphere.",
    games: [
      {
        title: "Resident Evil 4 Remake",
        note: "Action horror with survival gameplay.",
        trailer: "https://www.youtube.com/embed/E69tKrfEQag"
      },
      {
        title: "Alan Wake 2",
        note: "Psychological horror with cinematic style.",
        trailer: "https://www.youtube.com/embed/dlQ3FeNu5Yw"
      }
    ]
  },
  {
    name: "Cozy / Indie",
    color: "#80ed99",
    angle: (Math.PI / 3) * 5,
    description: "Smaller, creative games with relaxing, emotional, or unique gameplay ideas.",
    games: [
      {
        title: "Stardew Valley",
        note: "Relaxing farming and life sim.",
        trailer: "https://www.youtube.com/embed/ot7uXNQskhs"
      },
      {
        title: "Hades",
        note: "Indie action game with mythology.",
        trailer: "https://www.youtube.com/embed/mD8x5xLHRho"
      }
    ]
  }
];

// ===============================
// CREATE GAME WORLD
// ===============================

export function createGameWorld(scene, createFloatingText, position) {
  const gameWorldGroup = new THREE.Group();
  gameWorldGroup.position.set(position.x, 0, position.z);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(position.radius, 80),
    new THREE.MeshStandardMaterial({
      color: "#07140e",
      roughness: 0.8
    })
  );
  ground.rotation.x = -Math.PI / 2;
  gameWorldGroup.add(ground);

  const road = new THREE.Mesh(
    new THREE.RingGeometry(16, 21, 100),
    new THREE.MeshStandardMaterial({
      color: "#06100a",
      roughness: 0.7
    })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.03;
  gameWorldGroup.add(road);

  const sign = createFloatingText("GAME WORLD", "#80ed99");
  sign.position.set(-8, 9, 0);
  gameWorldGroup.add(sign);

  const gameStations = [];

  gameWorldData.forEach((genre) => {
    const radius = 31;
    const x = Math.cos(genre.angle) * radius;
    const z = Math.sin(genre.angle) * radius;

    const station = createGameStation(genre, x, z, createFloatingText);

    gameStations.push({
      group: station.group,
      genre,
      trigger: new THREE.Vector3(x + position.x, 0, z + position.z)
    });

    gameWorldGroup.add(station.group);
  });

  addGameDecorations(gameWorldGroup);

  scene.add(gameWorldGroup);

  return {
    gameWorldGroup,
    gameStations
  };
}

// ===============================
// CREATE GAME STATION
// ===============================

function createGameStation(genre, x, z, createFloatingText) {
  const group = new THREE.Group();

  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(9, 0.5, 5),
    new THREE.MeshStandardMaterial({
      color: "#101010"
    })
  );
  base.position.y = 0.25;
  group.add(base);

  const monitor = new THREE.Mesh(
    new THREE.BoxGeometry(6.5, 3.5, 0.4),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.45
    })
  );
  monitor.position.set(0, 3, -2);
  group.add(monitor);

  const pcTower = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.5, 1.2),
    new THREE.MeshStandardMaterial({
      color: "#050505"
    })
  );
  pcTower.position.set(-4, 1.5, -1.4);
  group.add(pcTower);

  const consoleBox = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.45, 1.2),
    new THREE.MeshStandardMaterial({
      color: "#111111"
    })
  );
  consoleBox.position.set(2.7, 0.9, -1.2);
  group.add(consoleBox);

  const controller = createControllerShape(genre.color);
  controller.position.set(0, 0.85, 0.4);
  group.add(controller);

  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.6, -2.1);
  group.add(sign);

  return {
    group
  };
}

// ===============================
// CONTROLLER SHAPE
// ===============================

function createControllerShape(color) {
  const controller = new THREE.Group();

  const middle = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.25, 0.65),
    new THREE.MeshStandardMaterial({
      color: "#050505"
    })
  );
  controller.add(middle);

  const leftGrip = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 16),
    new THREE.MeshStandardMaterial({
      color: "#050505"
    })
  );
  leftGrip.scale.set(1, 0.55, 0.8);
  leftGrip.position.set(-0.8, 0, 0);
  controller.add(leftGrip);

  const rightGrip = leftGrip.clone();
  rightGrip.position.x = 0.8;
  controller.add(rightGrip);

  const button = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8
    })
  );
  button.position.set(0.45, 0.18, -0.15);
  controller.add(button);

  return controller;
}

// ===============================
// GAME DECORATIONS
// ===============================

function addGameDecorations(group) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 38 + Math.random() * 10;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 1.5, 1.5),
      new THREE.MeshStandardMaterial({
        color: "#80ed99",
        emissive: "#80ed99",
        emissiveIntensity: 0.25
      })
    );

    cube.position.set(
      Math.cos(angle) * radius,
      0.75,
      Math.sin(angle) * radius
    );

    cube.rotation.y = Math.random() * Math.PI * 2;

    group.add(cube);
  }
}