import { MAP_WIDTH, MAP_HEIGHT, CAR_WIDTH, CAR_SPEED, CAR_PER_ROW } from './main.js';

import * as BABYLON from '@babylonjs/core'

//Generate cars for the road
export function generateCars(scene) {
  var carMeshes = [];

  for (let row = 0; row < 4; row++) {
    for (let number = 0; number < CAR_PER_ROW[row]; number++) {

      //Car position and geometry
      const car = new BABYLON.MeshBuilder.CreateBox(`car:row${row}number:${number}`, { size: CAR_WIDTH - 0.2, depth: 0.5, height: 0.5 }, scene);
      car.position.y = 0.5;
      let space = (MAP_WIDTH - CAR_PER_ROW[row]) / CAR_PER_ROW[row]
      car.position.x = -MAP_WIDTH / 2 - CAR_WIDTH / 2 + number * (space + CAR_WIDTH);
      car.position.z = -(MAP_HEIGHT / 2) + row + 1 - 0.25;

      //Car material
      const carMaterial = new BABYLON.StandardMaterial("carMaterial", scene);
      carMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
      carMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      car.material = carMaterial;

      // Animation for moving the cars
      scene.registerBeforeRender(() => {
        car.position.x += CAR_SPEED[row]

        // If the car reaches the right edge, reset its position to the left
        if (car.position.x > MAP_WIDTH / 2 + CAR_WIDTH / 2 - 0.5) {
          car.position.x = -MAP_WIDTH / 2 - CAR_WIDTH / 2 - 0.5;
        }

        // If the car reaches the left edge, reset its position to the right
        if (car.position.x < -MAP_WIDTH / 2 - CAR_WIDTH) {
          car.position.x = MAP_WIDTH / 2 + CAR_WIDTH / 2 - 0.5;
        }
      });
      carMeshes.push(car);

    }
  }
  return carMeshes;
}