import * as THREE from "../build/three.module.js";

import Stats from "./utils/stats.module.js";

import { GUI } from "./utils/dat.gui.module.js";
import { OrbitControls } from "./utils/OrbitControls.js";
let vertexShader, fragmentShader;

var loader = new THREE.FileLoader();
var container, stats;
var camera, scene, renderer, light;
var controls, uniforms;
var points;
var parameters;
var instances;
var geometry;
var num_shaders = 2;

loadShaders();

function loadShaders() {
  loader.load("./src/shaders/particlesVert.glsl", (data) => {
    vertexShader = data;
    runInitIfDone();
  });

  loader.load("./src/shaders/particlesFrag.glsl", (data) => {
    fragmentShader = data;
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

function init() {
  container = document.getElementById("container");
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    20
  );
  camera.position.z = 2;
  scene = new THREE.Scene();

  // geometry
  var vector = new THREE.Vector4();
  instances = 50000;
  var positions = [];
  var offsets = [];
  var colors = [];
  //var lifeTimes = [];
  //var sizes = new Float32Array( instances );
  //sizes = 10;

  positions.push(0, 0, 0);

  // instanced attributes
  for (var i = 0; i < instances; i++) {
    // offsets
    offsets.push(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    //lifeTimes.push(Math.random() * 3);
  }

  geometry = new THREE.InstancedBufferGeometry();
  geometry.maxInstancedCount = instances; // set so its initalized for dat.GUI, will be set in first draw otherwise
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute(
    "offset",
    new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3)
  );
  /*
  geometry.setAttribute(
    "lifeTime",
    new THREE.InstancedBufferAttribute(
      new Float32Array(new Float32Array(lifeTimes)),
      1
    )
  );
  */
  //geometry.setAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

  // Material
  var material = new THREE.RawShaderMaterial({
    uniforms: {
      time: { value: 1.0 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

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

  // Params
  /*
				parameters = {
					size: 10.0
				};
				*/

  // GUI
  var gui = new GUI({ width: 350 });
  var folder = gui.addFolder("Smoke");
  folder.add(geometry, "maxInstancedCount", 0, instances);
  //folder.add( parameters, 'size', 5, 20, 10 ).onChange( changeSize );
  folder.open();

  stats = new Stats();
  container.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize, false);
}

/*
			function changeSize() {
				points.geometry.attributes.size = parameters.size;
			}
			*/

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
/*
function updateLifeTime() {
  var lifeTimes = geometry.attributes.lifeTime.array;

  for (let i = 0; i < instances; i++) {
    if (lifeTimes[i] > 3) {
      lifeTimes[i] = 0;
    }
    lifeTimes[i]++;
  }
}
*/
function animate() {
  requestAnimationFrame(animate);
  render();
  stats.update();
}

function render() {
  var time = performance.now();
  var object = scene.children[0]; // Select particle system
  //geometry.attributes.lifeTime.array.needsUpdate = true;
  //updateLifeTime();
  object.material.uniforms["time"].value = time * 0.005;
  renderer.render(scene, camera);
}
