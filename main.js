import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ScreenShake } from "./ScreenShake";

let chaosRatio = 1;
let startTime = Date.now();
let chaosMonkeyStartTime = 0;
let timeElapsed = 0;
let chaosMonkeyState = 1;
let spinDirection = 1;
let lastZoom = 0;

const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var camera = new THREE.OrthographicCamera(-innerWidth / 2, innerWidth / 2, innerHeight / 2, -innerHeight / 2, -1000, 1000);
camera.position.set(20, 50, 100);
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
});

renderer.setPixelRatio(window.devicePixelRatio / 2);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(300);

const spaceTexture = new THREE.TextureLoader().load("space.jpg");
const stainedGlassTexture = new THREE.TextureLoader().load("stainedglass.jpg");
const glassMap = new THREE.TextureLoader().load("glassmap.jpg");

const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: glassMap });

glassMap.wrapS = THREE.RepeatWrapping;
glassMap.wrapT = THREE.RepeatWrapping;
glassMap.repeat.set(1, 1);

const torusKnot = new THREE.Mesh(geometry, material);
scene.add(torusKnot);

scene.add(torusKnot);
scene.background = spaceTexture;

const pointLight = new THREE.PointLight(0xff0000);
pointLight.position.set(5, 5, 5);

scene.add(pointLight);

const controls = new OrbitControls(camera, renderer.domElement);
var screenShake = ScreenShake();

function chaosMonkey() {
  // if (chaosMonkeyState && Date.now() > chaosMonkeyStartTime + LENGTH_MAX) {
  //   chaosMonkeyStartTime = 0;
  //   chaosMonkeyState = 0;
  //   return 1;
  // }

  if (chaosMonkeyState || Math.random() >= 0.99999) {
    chaosMonkeyStartTime = Date.now();
    chaosMonkeyState = 1;
    const chaos = Math.min(Math.random() * chaosRatio, Math.random() * chaosRatio);
    console.log(`chaos: ${chaos}`);
    return chaos;
  }

  chaosMonkeyState = 0;
  return 1;
}

function animate() {
  // if (lastZoom < 100 && camera.zoom >= 100) {
  //   screenShake.shake(camera, new THREE.Vector3(0.5, 0, 0), 3000 /* ms */);
  // }
  // screenShake.update(camera);

  controls.update();
  // lastZoom = camera.zoom;
  timeElapsed = Date.now() - startTime;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (torusKnot.rotation.x > 10 || torusKnot.rotation.x < -10) {
    spinDirection *= -1;
  }
  torusKnot.rotation.x += 0.1 / camera.zoom;
  torusKnot.rotation.y += 0.2 / camera.zoom;
  torusKnot.rotation.z += 0.3 / camera.zoom;
  const zoomxRatio = camera.zoom > 1000 ? camera.zoom / 1000 : camera.zoom > 500 ? camera.zoom / 500 : timeElapsed / 2;
  const zoomyRatio = camera.zoom > 100 ? 5 : camera.zoom > 50 ? (timeElapsed * startTime) / Date.now() : (timeElapsed * startTime) / Date.now() / 10;
  glassMap.repeat.set(
    (torusKnot.rotation.x * torusKnot.rotation.y) / (chaosMonkey() + zoomxRatio),
    (torusKnot.rotation.z * torusKnot.rotation.y) / (chaosMonkey() + torusKnot.rotation.x * zoomyRatio)
  );

  if (camera.zoom < 8) {
    chaosRatio = 500;
    chaosMonkeyState = 1;
    chaosMonkeyStartTime = Date.now();
  } else if (camera.zoom > 4000) {
    chaosRatio = camera.zoom / 2000000;
    chaosMonkeyState = 1;
    chaosMonkeyStartTime = Date.now();
  } else {
    chaosMonkeyState = 0;
    chaosMonkeyStartTime = 0;
  }

  console.log(`
  chaosMonkeyState: ${chaosMonkeyState}
  camera : ${JSON.stringify(camera)}
  torusKnot.rotation: ${JSON.stringify(torusKnot.rotation)}
  `);
}

animate();
