import * as PIXI from "pixi.js";
import { initButtons } from "./src/controller";
import gsap from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { loadScriptDemo } from "./src/loader";

const app = new PIXI.Application();
const canvasNode = document.getElementById("myCanvas");
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

Number.prototype.pad = function (size) {
  var s = this.toString(16);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
};

app
  .init({
    view: canvasNode,
    resizeTo: canvasNode,
    antialias: true,
    backgroundColor: 0,
  })
  .then(() => {
    console.log("PixiJS is ready!");
    window.app = app;

    initButtons();
  });
