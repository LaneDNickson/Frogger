import { MAP_WIDTH, MAP_HEIGHT, LOG_WIDTH, LOG_SPEED, LOG_PER_ROW, myOwn } from './main.js';
import * as BABYLON from '@babylonjs/core'

// Generate the logs for the river 
export function generateLogs(scene) {
  var logMeshes = [];
  //Add texture
  const sideTexture = new BABYLON.Texture('log.png', scene);
  sideTexture.vScale = 1;

  for (let row = 0; row < 5; row++) {
    for (let number = 0; number < LOG_PER_ROW[row]; number++) {

      const log = new BABYLON.MeshBuilder.CreateCylinder(`log:row${row}number:${number}`, {height: LOG_WIDTH, diameter: 0.8}, scene);
      log.rotation.z = Math.PI / 2

      log.position.y = -0.1;
      let space = (MAP_WIDTH - LOG_PER_ROW[row]) / LOG_PER_ROW[row]
      log.position.x = (-MAP_WIDTH / 2) + number * (space + LOG_WIDTH);
      log.position.z = -(MAP_HEIGHT / 2) + row + 6;

      //Log material properties
      const logMaterial = new BABYLON.StandardMaterial("logMaterial", scene);
      logMaterial.diffuseColor = new BABYLON.Color3(.6, .3, 0);
      logMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
      log.material = logMaterial;

      // Animation for moving the logs
      scene.registerBeforeRender(() => {
        if (myOwn) {
          logMaterial.diffuseTexture = sideTexture; // Set side texture
        }
        log.position.x += LOG_SPEED[row];

        // If the log reaches the right edge, reset its position to the left
        if (log.position.x > MAP_WIDTH/ 2 + LOG_WIDTH / 2 - 0.5) {
          log.position.x = -MAP_WIDTH / 2 - LOG_WIDTH / 2 -0.5;
        }

        // If the log reaches the left edge, reset its position to the right
        if (log.position.x < -MAP_WIDTH / 2 - LOG_WIDTH / 2 - 0.5) {
          log.position.x = MAP_WIDTH/ 2 + LOG_WIDTH / 2 -0.5;
        }
      });
      logMeshes.push(log);
    }
  }
  return logMeshes;

}