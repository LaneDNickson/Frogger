import { MAP_WIDTH, MAP_HEIGHT, TURTLE_WIDTH, TURTLE_SPEED, TURTLE_PER_ROW, myOwn} from './main.js';
import * as BABYLON from '@babylonjs/core'

//Generate turtles in the river
export function generateTurtles(scene) {
  var turtleMeshes = [];

  for (let row = 0; row < 5; row++) {
    for (let number = 0; number < TURTLE_PER_ROW[row]; number++) {
      for (let turtleInRow = 0; turtleInRow < TURTLE_WIDTH; turtleInRow++) {

        const turtle = new BABYLON.MeshBuilder.CreateSphere(`turtle:row${row}number:${number}`, { diameter: 0.8 }, scene);

        let space = (MAP_WIDTH - TURTLE_PER_ROW[row]) / TURTLE_PER_ROW[row]
        turtle.position.x = (-MAP_WIDTH / 2) + number * (space + TURTLE_WIDTH) + turtleInRow;
        turtle.position.z = -(MAP_HEIGHT / 2) + row + 6;

        //Turtle material
        const turtleTexture = new BABYLON.Texture('turtle.png', scene);
        turtleTexture.vScale = 2;
        turtleTexture.uScale = 2;
        const turtleMaterial = new BABYLON.StandardMaterial("turtleMaterial", scene);
        turtleMaterial.diffuseColor = new BABYLON.Color3(.2, .3, 0);
        turtleMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        turtle.material = turtleMaterial;

        // Generate a random offset for each turtle
        let randomOffset = Math.random() * 2 * Math.PI;

        // Animation for moving the turtle
        scene.registerBeforeRender(() => {
          if (myOwn) {
            turtleMaterial.diffuseTexture = turtleTexture;
          }

          //Turtle moves in a y sine wave based on the x position
          turtle.position.x += TURTLE_SPEED[row];
          turtle.position.y = Math.sin((turtle.position.x + randomOffset) * 0.5) * 0.25 -0.25;

          // If the turtle reaches the right edge, reset its position to the left
          if (turtle.position.x > MAP_WIDTH / 2 + TURTLE_WIDTH / 2 - 0.5) {
            turtle.position.x = (-MAP_WIDTH / 2 - TURTLE_WIDTH / 2 - 0.5);
            randomOffset = Math.random() * 2 * Math.PI;
          }

          // If the turtle reaches the left edge, reset its position to the right
          if (turtle.position.x < -MAP_WIDTH / 2 - TURTLE_WIDTH / 2 - 0.5) {
            turtle.position.x = (MAP_WIDTH / 2 + TURTLE_WIDTH / 2 - 0.5);
            randomOffset = Math.random() * 2 * Math.PI;
          }
        });
        turtleMeshes.push(turtle);
      }
    }
  }
  return turtleMeshes;

}