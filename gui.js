import * as BABYLON from '@babylonjs/core'
import * as GUI from '@babylonjs/gui';
import {lives, winCondition} from './main.js';

export function constructGUI(scene) {
  var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  var lifeText = new GUI.TextBlock();
  lifeText.color = "white"; // Set text color
  lifeText.fontSize = 40; // Set font size
  lifeText.top = "45%"; 
  lifeText.left = "-45%";

  var gameOver = new GUI.TextBlock();
  gameOver.color = "red"; // Set text color
  gameOver.fontSize = 80; // Set font size
  gameOver.text = "GAME OVER"

  var win = new GUI.TextBlock();
  win.color = "green"; // Set text color
  win.fontSize = 80; // Set font size
  win.text = "YOU WIN!"

  advancedTexture.addControl(lifeText); 
  scene.registerBeforeRender(() => {
    if (lives < 0) {
      advancedTexture.addControl(gameOver); 
    }
    else if (winCondition) {
      advancedTexture.addControl(win); 
    }
    else {
      lifeText.text = `Lives: ${lives}`
    }
  });

}