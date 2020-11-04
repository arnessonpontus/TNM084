import * as THREE from "../build/three.module.js";

import Stats from "./utils/stats.module.js";

import { GUI, gui } from "./utils/dat.gui.module.js";

import { OrbitControls } from "./utils/OrbitControls.js";

let snowVertexShader,
  snowFragmentShader,
  groundVertexShader,
  groundFragmentShader,
  treeTopVertexShader,
  treeTopFragmentShader;

var loader = new THREE.FileLoader();
var container, stats;
var camera, scene, renderer;
var controls;
var points;
var maxInstances;
var geometry; // Might remove
var snowReset = false;

var num_shaders = 6;
loadShaders();

function loadShaders() {
  loader.load("./src/shaders/particlesVert.glsl", (data) => {
    snowVertexShader = data;
    runInitIfDone();
  });

  loader.load("./src/shaders/particlesFrag.glsl", (data) => {
    snowFragmentShader = data;
    runInitIfDone();
  });

  loader.load("./src/shaders/groundVert.glsl", (data) => {
    groundVertexShader = data;
    runInitIfDone();
  });

  loader.load("./src/shaders/groundFrag.glsl", (data) => {
    groundFragmentShader = data;
    runInitIfDone();
  });

  loader.load("./src/shaders/treeTopVert.glsl", (data) => {
    treeTopVertexShader = data;
    runInitIfDone();
  });

  loader.load("./src/shaders/treeTopFrag.glsl", (data) => {
    treeTopFragmentShader = data;
    runInitIfDone();
  });

  function runInitIfDone() {
    --num_shaders;
    if (num_shaders === 0) {
      init();
      animate();
    }
  }
}

// controls for dat gui
var guiControls = new (function () {
  this.speed = 5;
  this.storm = 0;
  this.snowAmount = 10000;
  this.lowFreqGround = 0.5;
  this.highFreqGround = 0.5;
  this.resetSnowDepth = resetSnowDepth;
  this.snowIncrease = false;
})();

function resetSnowDepth() {
  snowReset = true;
}

function init() {
  container = document.getElementById("container");
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.2,
    20
  );
  camera.position.z = 2;
  scene = new THREE.Scene();

  // Point geometry
  maxInstances = 100000;
  var positions = [];
  var offsets = [];
  var lifeTimes = [];

  positions.push(0, 0, 0);

  // instanced attributes
  for (var i = 0; i < maxInstances; i++) {
    // offsets
    let x = Math.random() - 0.5;
    let y = Math.random() - 0.5;
    let z = Math.random() - 0.5;
    offsets.push(x, y, z);
    lifeTimes.push(Math.random());
  }

  geometry = new THREE.InstancedBufferGeometry();
  geometry.maxInstancedCount = maxInstances; // set so its initalized for dat.GUI, will be set in first draw otherwise
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "offset",
    new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3)
  );
  geometry.setAttribute(
    "lifeTime",
    new THREE.InstancedBufferAttribute(new Float32Array(lifeTimes), 1)
  );

  // Ground
  var groundGeometry = new THREE.SphereGeometry(0.49, 32, 32);
  var groundMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      lowFreqGround: { value: guiControls.lowFreqGround },
      highFreqGround: { value: guiControls.highFreqGround },
      increaseRate: { value: guiControls.snowAmount },
      snowIncrease: { value: guiControls.snowIncrease },
    },
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    side: THREE.DoubleSide,
  });
  var ground = new THREE.Mesh(groundGeometry, groundMaterial);
  scene.add(ground);

  // Falling snow
  var snowMaterial = new THREE.RawShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      storm: { value: guiControls.storm },
    },
    vertexShader: snowVertexShader,
    fragmentShader: snowFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });

  points = new THREE.Points(geometry, snowMaterial);
  scene.add(points);

  // Lights
  var ambLight = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(ambLight);

  var light = new THREE.PointLight("#fff", 0.2, 100);
  light.position.set(5, 5, 5);
  scene.add(light);

  // Plane
  var planeGeometry = new THREE.PlaneGeometry(3, 3, 1);
  var planeMaterial = new THREE.MeshBasicMaterial({
    color: "#80736e",
    side: THREE.DoubleSide,
  });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = Math.PI / 2;
  planeGeometry.translate(0, 0, 1);
  scene.add(plane);

  // Sphere
  var sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  var sphereMaterial = new THREE.MeshPhongMaterial({
    color: "#fff",
    opacity: 0.4,
    transparent: true,
  });
  var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  // Tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.22, 32);
  trunkGeometry.translate(0, -0.08, 0);
  const trunkMaterial = new THREE.MeshBasicMaterial({ color: "#5e483f" });
  const cylinder = new THREE.Mesh(trunkGeometry, trunkMaterial);
  scene.add(cylinder);

  // Tree top
  for (var i = 1; i < 5; ++i) {
    const geometry = new THREE.ConeGeometry(0.04 * Math.sqrt(i), 0.08, 32);
    geometry.translate(0, 0.1 + (i - 1) * -0.05, 0);
    var material = new THREE.RawShaderMaterial({
      vertexShader: treeTopVertexShader,
      fragmentShader: treeTopFragmentShader,
      side: THREE.DoubleSide,
    });
    const cone = new THREE.Mesh(geometry, material);
    scene.add(cone);
  }

  //Renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);
  if (renderer.extensions.get("ANGLE_instanced_arrays") === null) {
    console.log("not supported");
    document.getElementById("notSupported").style.display = "";
    return;
  }

  // Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 0, 0);
  controls.minDistance = 0.0;
  controls.maxDistance = 10.0;
  controls.update();

  // GUI
  var gui = new GUI({ width: 350 });
  var folder = gui.addFolder("Parameters");
  folder.add(guiControls, "snowAmount", 1000, maxInstances);
  folder.add(guiControls, "speed", 0.1, 10);
  folder.add(guiControls, "storm", 0, 1);
  folder.add(guiControls, "lowFreqGround", 0, 2.0);
  folder.add(guiControls, "highFreqGround", 0, 2.0);
  folder.add(guiControls, "resetSnowDepth");
  folder.add(guiControls, "snowIncrease");

  folder.open();

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize, false);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  var ground = scene.children[0]; // Select the ground
  var snowfall = scene.children[1]; // Select particle system

  snowfall.material.uniforms["storm"].value = guiControls.storm;
  snowfall.geometry.maxInstancedCount = guiControls.snowAmount;

  ground.material.uniforms["lowFreqGround"].value = guiControls.lowFreqGround;
  ground.material.uniforms["highFreqGround"].value = guiControls.highFreqGround;
  ground.material.uniforms["snowIncrease"].value = guiControls.snowIncrease;

  // Time updates
  var timeStep = 0.001 + 0.001 * guiControls.speed;
  snowfall.material.uniforms["time"].value += timeStep;
  ground.material.uniforms["time"].value += timeStep;

  // For resetting the snow level
  if (snowReset || guiControls.snowIncrease == false) {
    ground.material.uniforms["increaseRate"].value = 0;
    snowReset = false;
  } else {
    ground.material.uniforms["increaseRate"].value +=
      guiControls.snowAmount * guiControls.speed * 0.2;
  }
  renderer.render(scene, camera);
}
