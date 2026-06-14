import * as THREE from "three";

// Select the canvas element where the 3D scene will be drawn
const canvas = document.querySelector("#world");

// Create the main Three.js scene and set the background color
const scene = new THREE.Scene();
scene.background = new THREE.Color("#080812");

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Add ambient and directional lighting for the scene
const ambientLight = new THREE.AmbientLight("#ffffff", 0.55);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight("#ffffff", 1.4);
moonLight.position.set(15, 30, 10);
scene.add(moonLight);

// Create the large circular ground, road ring, and center island
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(70, 80),
  new THREE.MeshStandardMaterial({
    color: "#202020",
    roughness: 0.85
  })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const road = new THREE.Mesh(
  new THREE.RingGeometry(18, 23, 100),
  new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.7
  })
);
road.rotation.x = -Math.PI / 2;
road.position.y = 0.02;
scene.add(road);

const centerIsland = new THREE.Mesh(
  new THREE.CircleGeometry(13, 60),
  new THREE.MeshStandardMaterial({
    color: "#14351f"
  })
);
centerIsland.rotation.x = -Math.PI / 2;
centerIsland.position.y = 0.03;
scene.add(centerIsland);

createGlobe();

// Create the player car and add it to the scene
const car = createCar();
scene.add(car);
car.position.set(0, 0.45, 24);

const keys = {};
let speed = 0;
let rotationSpeed = 0;
let currentTheater = null;
let gameStarted = false;

const genreData = [
  {
    name: "Action",
    color: "#ff3333",
    angle: 0,
    description: "Fast, intense movies with fights, danger, heroes, and big set pieces.",
    movies: [
      {
        title: "Mad Max: Fury Road",
        note: "Chaotic action and amazing practical stunts.",
        trailer: "https://www.youtube.com/embed/hEJnMQG9ev8"
      },
      {
        title: "John Wick",
        note: "Stylish action with clean choreography.",
        trailer: "https://www.youtube.com/embed/C0BMx-qxsP4"
      },
      {
        title: "Top Gun: Maverick",
        note: "Aerial action with emotional moments.",
        trailer: "https://www.youtube.com/embed/qSqVVswa420"
      }
    ]
  },
  {
    name: "Romance",
    color: "#ff7eb6",
    angle: Math.PI / 3,
    description: "Stories focused on love, connection, heartbreak, and emotions.",
    movies: [
      {
        title: "La La Land",
        note: "Romance, music, dreams, and sacrifice.",
        trailer: "https://www.youtube.com/embed/0pdqf4P9MB8"
      },
      {
        title: "The Notebook",
        note: "Classic emotional romance story.",
        trailer: "https://www.youtube.com/embed/BjJcYdEOI0k"
      },
      {
        title: "Before Sunrise",
        note: "Simple, realistic, dialogue-heavy romance.",
        trailer: "https://www.youtube.com/embed/25v7N34d5HE"
      }
    ]
  },
  {
    name: "Comedy / Rom-Com",
    color: "#ffd166",
    angle: (Math.PI / 3) * 2,
    description: "Light, funny stories that mix jokes, relationships, awkward moments, and comfort.",
    movies: [
      {
        title: "Crazy Rich Asians",
        note: "Rom-com with family drama and style.",
        trailer: "https://www.youtube.com/embed/ZQ-YX-5bAs0"
      },
      {
        title: "10 Things I Hate About You",
        note: "Funny high-school rom-com classic.",
        trailer: "https://www.youtube.com/embed/AWmjzCZr0Jw"
      },
      {
        title: "The Grand Budapest Hotel",
        note: "Quirky comedy with a strong visual style.",
        trailer: "https://www.youtube.com/embed/1Fg5iWmQjwk"
      }
    ]
  },
  {
    name: "Horror",
    color: "#9d4edd",
    angle: Math.PI,
    description: "Dark movies made to create tension, fear, mystery, and suspense.",
    movies: [
      {
        title: "Get Out",
        note: "Psychological horror with social commentary.",
        trailer: "https://www.youtube.com/embed/DzfpyUB60YY"
      },
      {
        title: "A Quiet Place",
        note: "Tense horror built around silence.",
        trailer: "https://www.youtube.com/embed/WR7cc5t7tv8"
      },
      {
        title: "The Conjuring",
        note: "Supernatural horror and haunted-house tension.",
        trailer: "https://www.youtube.com/embed/k10ETZ41q5o"
      }
    ]
  },
  {
    name: "Sci-Fi",
    color: "#4cc9f0",
    angle: (Math.PI / 3) * 4,
    description: "Movies about future worlds, space, technology, time, and big ideas.",
    movies: [
      {
        title: "Interstellar",
        note: "Space, time, family, and survival.",
        trailer: "https://www.youtube.com/embed/zSWdZVtXT7E"
      },
      {
        title: "Blade Runner 2049",
        note: "Slow, beautiful futuristic sci-fi.",
        trailer: "https://www.youtube.com/embed/gCcx85zbxz4"
      },
      {
        title: "Arrival",
        note: "Alien contact with emotional storytelling.",
        trailer: "https://www.youtube.com/embed/tFMo3UJ4B4g"
      }
    ]
  },
  {
    name: "Animation / Family",
    color: "#80ed99",
    angle: (Math.PI / 3) * 5,
    description: "Creative animated movies with emotional stories, adventure, and strong visuals.",
    movies: [
      {
        title: "Spider-Man: Into the Spider-Verse",
        note: "Comic-book animation with a unique style.",
        trailer: "https://www.youtube.com/embed/g4Hbz2jLxvQ"
      },
      {
        title: "Coco",
        note: "Family, music, memory, and culture.",
        trailer: "https://www.youtube.com/embed/Ga6RYejo6Hk"
      },
      {
        title: "How to Train Your Dragon",
        note: "Adventure, friendship, and fantasy.",
        trailer: "https://www.youtube.com/embed/oKiYuIsPxYk"
      }
    ]
  }
];

const theaters = [];

// Create and place each theater around the central world
genreData.forEach((genre) => {
  const radius = 36;
  const x = Math.cos(genre.angle) * radius;
  const z = Math.sin(genre.angle) * radius;

  const theater = createTheater(genre, x, z);
  theaters.push(theater);
  scene.add(theater.group);
});

addTrees();
addStars();

camera.position.set(0, 16, 34);
camera.lookAt(car.position);

const startScreen = document.querySelector("#startScreen");
const startBtn = document.querySelector("#startBtn");
const moviePanel = document.querySelector("#moviePanel");
const closePanel = document.querySelector("#closePanel");
const panelTitle = document.querySelector("#panelTitle");
const panelDescription = document.querySelector("#panelDescription");
const movieList = document.querySelector("#movieList");
const trailerFrame = document.querySelector("#trailerFrame");
const currentGenreText = document.querySelector("#currentGenre");

// Start button begins the drive-in experience and hides the intro screen
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameStarted = true;
});

closePanel.addEventListener("click", closeMoviePanel);

window.addEventListener("keydown", (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

function createGlobe() {
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(7, 40, 40),
    new THREE.MeshStandardMaterial({
      color: "#234dff",
      roughness: 0.45,
      metalness: 0.05
    })
  );

  globe.position.set(0, 7.2, 0);
  scene.add(globe);

  const landMaterial = new THREE.MeshStandardMaterial({
    color: "#2ed573",
    roughness: 0.8
  });

  for (let i = 0; i < 9; i++) {
    const land = new THREE.Mesh(
      new THREE.SphereGeometry(1.1 + Math.random() * 1.4, 12, 12),
      landMaterial
    );

    const angle = Math.random() * Math.PI * 2;
    const height = -2 + Math.random() * 4;
    land.position.set(
      Math.cos(angle) * 6.7,
      7.2 + height,
      Math.sin(angle) * 6.7
    );
    land.scale.set(1.5, 0.35, 0.8);
    land.lookAt(globe.position);
    scene.add(land);
  }

  const text = createFloatingText("MOVIE WORLD", "#ffffff");
  text.position.set(-6.8, 15.2, 0);
  scene.add(text);
}

function createCar() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.7, 4),
    new THREE.MeshStandardMaterial({
      color: "#d62828",
      roughness: 0.5
    })
  );
  body.position.y = 0.55;
  group.add(body);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.65, 1.8),
    new THREE.MeshStandardMaterial({
      color: "#f77f00",
      roughness: 0.45
    })
  );
  top.position.set(0, 1.15, -0.35);
  group.add(top);

  const wheelMaterial = new THREE.MeshStandardMaterial({ color: "#050505" });

  const wheelPositions = [
    [-1.25, 0.35, 1.35],
    [1.25, 0.35, 1.35],
    [-1.25, 0.35, -1.35],
    [1.25, 0.35, -1.35]
  ];

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.28, 20),
      wheelMaterial
    );

    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(pos[0], pos[1], pos[2]);
    group.add(wheel);
  });

  const lightMaterial = new THREE.MeshStandardMaterial({
    color: "#fff3b0",
    emissive: "#fff3b0",
    emissiveIntensity: 1.4
  });

  const leftLight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.08), lightMaterial);
  leftLight.position.set(-0.55, 0.75, 2.05);
  group.add(leftLight);

  const rightLight = leftLight.clone();
  rightLight.position.x = 0.55;
  group.add(rightLight);

  return group;
}

function createTheater(genre, x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.lookAt(0, 0, 0);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.5, 5),
    new THREE.MeshStandardMaterial({
      color: "#151515"
    })
  );
  base.position.y = 0.25;
  group.add(base);

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(7, 4, 0.35),
    new THREE.MeshStandardMaterial({
      color: genre.color,
      emissive: genre.color,
      emissiveIntensity: 0.45
    })
  );
  screen.position.set(0, 3.2, -2);
  group.add(screen);

  const screenInner = new THREE.Mesh(
    new THREE.PlaneGeometry(6.1, 3.1),
    new THREE.MeshBasicMaterial({
      color: "#050505"
    })
  );
  screenInner.position.set(0, 3.2, -2.19);
  group.add(screenInner);

  const sign = createFloatingText(genre.name, genre.color);
  sign.position.set(-3.2, 5.7, -2.1);
  group.add(sign);

  const leftPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 3, 12),
    new THREE.MeshStandardMaterial({ color: "#555555" })
  );
  leftPole.position.set(-3, 1.55, -2);
  group.add(leftPole);

  const rightPole = leftPole.clone();
  rightPole.position.x = 3;
  group.add(rightPole);

  const trigger = new THREE.Vector3(x, 0, z);

  return {
    group,
    genre,
    trigger
  };
}

function createFloatingText(text, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = color;
  ctx.font = "bold 90px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  ctx.fillText(text, 30, 130);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(7, 1.8, 1);

  return sprite;
}

function addTrees() {
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 45 + Math.random() * 18;

    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: "#5c3d2e" })
    );
    trunk.position.y = 0.6;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 1.8, 10),
      new THREE.MeshStandardMaterial({ color: "#1b7f3a" })
    );
    leaves.position.y = 1.8;
    tree.add(leaves);

    tree.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius
    );

    scene.add(tree);
  }
}

function addStars() {
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 500;
  const positions = [];

  for (let i = 0; i < starCount; i++) {
    positions.push(
      (Math.random() - 0.5) * 220,
      Math.random() * 90 + 20,
      (Math.random() - 0.5) * 220
    );
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: "#ffffff",
      size: 0.25
    })
  );

  scene.add(stars);
}

function updateCarMovement() {
  if (!gameStarted) return;

  const forwardPressed = keys["w"] || keys["arrowup"];
  const backwardPressed = keys["s"] || keys["arrowdown"];
  const leftPressed = keys["a"] || keys["arrowleft"];
  const rightPressed = keys["d"] || keys["arrowright"];

  if (forwardPressed) {
    speed += 0.015;
  } else if (backwardPressed) {
    speed -= 0.012;
  } else {
    speed *= 0.94;
  }

  speed = THREE.MathUtils.clamp(speed, -0.18, 0.32);

  if (leftPressed) {
    rotationSpeed = 0.04;
  } else if (rightPressed) {
    rotationSpeed = -0.04;
  } else {
    rotationSpeed = 0;
  }

  if (Math.abs(speed) > 0.01) {
    car.rotation.y += rotationSpeed * Math.sign(speed);
  }

  car.position.x += Math.sin(car.rotation.y) * speed;
  car.position.z += Math.cos(car.rotation.y) * speed;

  const distanceFromCenter = Math.sqrt(
    car.position.x * car.position.x + car.position.z * car.position.z
  );

  if (distanceFromCenter > 62) {
    car.position.x *= 0.98;
    car.position.z *= 0.98;
    speed *= -0.2;
  }
}

function updateCamera() {
  const cameraOffset = new THREE.Vector3(
    -Math.sin(car.rotation.y) * 9,
    6,
    -Math.cos(car.rotation.y) * 9
  );

  const targetCameraPosition = car.position.clone().add(cameraOffset);

  camera.position.lerp(targetCameraPosition, 0.08);

  const lookTarget = car.position.clone();
  lookTarget.y += 1.2;
  camera.lookAt(lookTarget);
}

function checkTheaterDistance() {
  let nearest = null;
  let nearestDistance = Infinity;

  theaters.forEach((theater) => {
    const distance = car.position.distanceTo(theater.trigger);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = theater;
    }
  });

  if (nearest && nearestDistance < 8) {
    currentGenreText.textContent = `${nearest.genre.name} Theater`;

    if (currentTheater !== nearest) {
      openMoviePanel(nearest.genre);
      currentTheater = nearest;
    }
  } else {
    currentGenreText.textContent = "Explore the world";
    currentTheater = null;
  }
}

function openMoviePanel(genre) {
  panelTitle.textContent = `${genre.name} Drive-In`;
  panelDescription.textContent = genre.description;
  movieList.innerHTML = "";

  genre.movies.forEach((movie, index) => {
    const card = document.createElement("div");
    card.className = "movieCard";

    card.innerHTML = `
      <h3>${movie.title}</h3>
      <p>${movie.note}</p>
    `;

    card.addEventListener("mouseenter", () => {
      trailerFrame.src = movie.trailer;
    });

    card.addEventListener("click", () => {
      window.open(movie.trailer, "_blank");
    });

    movieList.appendChild(card);

    if (index === 0) {
      trailerFrame.src = movie.trailer;
    }
  });

  moviePanel.classList.remove("hidden");
}

function closeMoviePanel() {
  moviePanel.classList.add("hidden");
  trailerFrame.src = "";
}

function animate() {
  requestAnimationFrame(animate);

  // Update game state each frame
  updateCarMovement();
  updateCamera();
  checkTheaterDistance();

  // Highlight the theater screen nearest to the car
  theaters.forEach((theater) => {
    theater.group.children.forEach((child) => {
      if (child.material && child.material.emissive) {
        child.material.emissiveIntensity =
          currentTheater === theater ? 1.1 : 0.45;
      }
    });
  });

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});