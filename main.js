//Imports
import * as BABYLON from '@babylonjs/core'
import { Inspector } from '@babylonjs/inspector';
import { generateCars } from './cars.js';
import { generateLogs } from './logs.js';
import { generateTurtles } from './turtles.js';
import { constructGUI } from './gui.js';

//Global magic numbers/constants
export const MAP_WIDTH = 12.0
export const MAP_HEIGHT = 12.0
export const LOG_WIDTH = 3;
export const LOG_SPEED = [0.02, -0.04, 0.06, -0.03, 0.04];
export const LOG_PER_ROW = [2, 0, 1, 0, 1];
export const TURTLE_WIDTH = 2;
export const TURTLE_SPEED = [0.02, -0.04, 0.06, -0.03, 0.04];
export const TURTLE_PER_ROW = [0, 3, 0, 2, 0];
export const CAR_WIDTH = 1;
export const CAR_SPEED = [0.03, 0.04, -0.06, -0.03];
export const CAR_PER_ROW = [1, 3, 4, 2];
export const LILY_PAD_POSITIONS = [-4, -2, 1, 3]

//Condition variables
export let lives = 3;
export let winCondition = false;
export let myOwn = false;

//Meshes
let carMeshes;
let logMeshes;
let turtleMeshes;
let frog;
let camera;
let lilyPads = []
let initialLilyPads = [];
let playingMusic = false;
let isFrogMoving = false;
let isControlEnabled = true;


//Get canvas and engine
const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas);

//Create initial meshes, camera, load music
const createScene = function () {
  const scene = new BABYLON.Scene(engine);

  //Set conditions
  isFrogMoving = false;
  isControlEnabled = true;

  //Music
  document.addEventListener('click', function (e) {
    if (!playingMusic) {
      const music = new BABYLON.Sound("Music", "froggy.mp3", scene, null, { loop: true, autoplay: true });
      playingMusic = true;
    }
  })

  // Free camera
  camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(-0.5, MAP_HEIGHT, -MAP_WIDTH), scene);

  // Set target to plane origin
  camera.setTarget(new BABYLON.Vector3(-0.5, 0, -0.5));

  //Two lights, behind and above
  const light = new BABYLON.PointLight("light", new BABYLON.Vector3(0, 0, 0), scene)
  light.position = new BABYLON.Vector3(0, MAP_HEIGHT, 0);
  const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 0, 0), scene)
  light2.position = new BABYLON.Vector3(0, MAP_HEIGHT, -MAP_WIDTH);

  //Create the frog
  frog = createFrog(scene);

  //Create the lily pads
  for (let i = 0; i < 4; i++) {
    var lilyPad = new BABYLON.CreateCylinder(`pad${i}`, { height: 0.2, diameter: 0.8 }, scene)
    lilyPad.position = new BABYLON.Vector3(LILY_PAD_POSITIONS[i], 0, MAP_HEIGHT / 2 - 1);
    lilyPad.material = new BABYLON.StandardMaterial("lilyPadMaterial", scene);
    lilyPad.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
    lilyPads.push(lilyPad);
  }
  initialLilyPads = Array.from(lilyPads);


  //Create the ground
  const ground = new BABYLON.MeshBuilder.CreateGround("ground", { width: MAP_WIDTH, height: MAP_HEIGHT }, scene)
  const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
  ground.position.x = -0.5
  ground.position.z = -0.5

  //Get the ground texture
  const groundTexture = new BABYLON.Texture("/mapTexture.png", scene)
  groundMaterial.diffuseTexture = groundTexture;
  groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  ground.material = groundMaterial;

  //Generate the cars
  carMeshes = generateCars(scene);

  //Generate the logs
  logMeshes = generateLogs(scene);

  //Generate the turtles
  turtleMeshes = generateTurtles(scene);

  //Construct GUI
  constructGUI(scene);

  return scene;
}

var scene = createScene();

// Debug mode
// Inspector.Show(scene, {});

//Run on each render
engine.runRenderLoop(function () {
  scene.render();
  //Check lives
  if (lives < 0) {
    isControlEnabled = false;
    setTimeout(() => {
      //Reset the game by reloading the page
      document.location = "/"
    }, 5000);
  }
  //Check win condition
  else if (lilyPads.length == 0) {
    isControlEnabled = false;
    winCondition = true;
    setTimeout(() => {
      //Reset the game by reloading the page
      document.location = "/"
    }, 5000);
  }
  else {
    // Check out of bounds
    if (frog.position.x < -MAP_WIDTH / 2 - 0.5 || frog.position.x > MAP_WIDTH / 2 - 0.5) {
      console.log("Out of bounds!");
      //Reset frog position
      resetFrog();
      lives--;
    }
    // Check if the frog is inside any cars
    else if (isInsideMesh(frog, carMeshes)) {
      console.log("Splat! Roadkill!");
      //Reset frog position
      resetFrog();
      lives--;
    }
    else if (isInsideMesh(frog, logMeshes)) {
      console.log("On a Log");
      frog.position.y = 0.4
      frog.position.x += LOG_SPEED[frog.position.z];
    }
    else if (isInsideMesh(frog, turtleMeshes)) {
      console.log("On a Turtle");
      frog.position.y = 0.3
      frog.position.x += TURTLE_SPEED[frog.position.z];
    }
    else if (frog.position.z >= 0 && frog.position.z <= 4 && !isFrogMoving) {
      console.log("Frog can't swim");
      //Reset frog position
      resetFrog();
      lives--;
    }
    else if (frog.position.z == MAP_HEIGHT / 2 - 1 && !isFrogMoving) {
      if (isInsideMesh(frog, lilyPads)) {
        for (let i = 0; i < lilyPads.length; i++) {
          const mesh = lilyPads[i];
          if (frog.intersectsMesh(mesh, false)) {
            // Remove the lily pad mesh from the array
            lilyPads.splice(i, 1);
            // Decrease the loop variable to account for the removed element
            i--;
            //Define new frog
            window.removeEventListener("keydown", handle);
            frog.position.x = mesh.position.x;
            frog.position.y = mesh.position.y + 0.3;
            frog.position.z = mesh.position.z;
            frog = createFrog(scene);
          }
        }
        //Game over (for debug)
        if (lilyPads.length === 0) {
          console.log("All lily pads reached! Game over!");
        }

      }
      else {
        //Reset frog position
        resetFrog();
        lives--;
      }
    }
  }

  // Move camera with frog
  camera.position = new BABYLON.Vector3(camera.position.x, camera.position.y, frog.position.z - MAP_HEIGHT / 2);
});

// Function to check if the object is inside any mesh
function isInsideMesh(obj, meshes) {
  for (const mesh of meshes) {
    if (obj.intersectsMesh(mesh, false)) {
      return true;
    }
  }
  return false;
}

//Creates frog and sets up key controls
function createFrog(scene) {
  //Create the frog
  var newFrog = new BABYLON.MeshBuilder.CreateBox("frog", { size: 0.5 }, scene)
  newFrog.position.y = 0
  newFrog.position.z = -(MAP_HEIGHT / 2)

  const frogMaterial = new BABYLON.StandardMaterial("frogMaterial", scene);
  frogMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
  frogMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  newFrog.material = frogMaterial;

  setupKeyControls(newFrog, scene);
  return newFrog
}

//Resets the frog location
function resetFrog() {
  frog.getScene().stopAnimation(frog);
  isFrogMoving = false;
  frog.position.z = -(MAP_HEIGHT / 2)
  frog.position.x = 0;
  frog.position.y = 0;
}

//Sets up a listener to handle frog directions and custom mode
function setupKeyControls(frog, scene) {
  isControlEnabled = true;
  window.addEventListener("keydown", handle);

}

//Handler for keypresses
function handle(event) {
  // Check if the frog is currently moving
  if (isFrogMoving || !isControlEnabled) {
    return;
  }

  // Set the flag to indicate that the frog is moving
  isFrogMoving = true;


  const halfMapWidth = MAP_WIDTH / 2;
  const halfMapHeight = MAP_HEIGHT / 2;
  var newPosition = frog.position.clone();
  switch (event.key) {
    case "ArrowUp":
      if (frog.position.z < halfMapHeight - 1) {
        newPosition.z += 1;
      }
      break;
    case "ArrowDown":
      if (frog.position.z > -halfMapHeight) {
        newPosition.z -= 1;
      }
      break;
    case "ArrowLeft":
      if (frog.position.x > -halfMapWidth) {
        newPosition.x -= 1;
      }
      break;
    case "ArrowRight":
      if (frog.position.x < halfMapWidth - 1) {
        newPosition.x += 1;
      }
      break;
    //Make it your own mode
    case "!":
      myOwn = true;
      const rightWall = BABYLON.MeshBuilder.CreatePlane("plane", { height: MAP_HEIGHT, width: MAP_WIDTH }, scene);
      rightWall.position = new BABYLON.Vector3(MAP_WIDTH / 2 - 0.5, MAP_HEIGHT / 2, -0.5);
      rightWall.rotation.y = Math.PI / 2

      const leftWall = BABYLON.MeshBuilder.CreatePlane("plane", { height: MAP_HEIGHT, width: MAP_WIDTH }, scene);
      leftWall.position = new BABYLON.Vector3(-MAP_WIDTH / 2 - 0.5, MAP_HEIGHT / 2, -0.5);
      leftWall.rotation.y = -Math.PI / 2

      const backWall = BABYLON.MeshBuilder.CreatePlane("plane", { height: MAP_HEIGHT, width: MAP_WIDTH }, scene);
      backWall.position = new BABYLON.Vector3(-0.5, MAP_HEIGHT / 2, MAP_WIDTH / 2 - 0.5);
      const wallTexture = new BABYLON.Texture("/background.png", scene)
      const backwallTexture = new BABYLON.Texture("/background2.png", scene)
      const wallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
      const backwallMaterial = new BABYLON.StandardMaterial("wallMaterial", scene);
      wallMaterial.diffuseTexture = wallTexture;
      wallMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      backwallMaterial.diffuseTexture = backwallTexture;
      backwallMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      rightWall.material = wallMaterial;
      leftWall.material = wallMaterial;
      backWall.material = backwallMaterial;
      break;
  }
  if (frog.position.z < 0 || frog.position.z > 3) {
    newPosition.y = 0;
  }

  // Frog animation
  const animation = new BABYLON.Animation(
    'moveFrogAnimation',
    'position',
    60,
    BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Keyframes for the animation
  const keys = [
    { frame: 0, value: frog.position.clone() },
    { frame: 5, value: new BABYLON.Vector3(newPosition.x, newPosition.y + 1, newPosition.z - ((newPosition.z - frog.position.z) / 2)) },
    { frame: 10, value: newPosition.clone() }
  ];

  animation.setKeys(keys);
  frog.animations = [animation];

  // Callback function to stop frog motion
  const onAnimationEnd = function () {
    isFrogMoving = false;
  };

  // Start the animation and provide the callback function
  scene.beginAnimation(frog, 0, 10, false, 1.0, onAnimationEnd);
}
