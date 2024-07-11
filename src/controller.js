import { sound, webaudio } from "@pixi/sound";
import { loadScriptDemo } from "./loader";
import { demoes } from "./demo";

const demoBtns = document.getElementsByClassName("button");
// webaudio.WebAudioContext.autoPause = false;
sound.disableAutoPause = true;

export function initButtons() {
  for (let i = 0; i < demoBtns.length; i++) {
    demoBtns[i].addEventListener("click", () => {
      resetBtnInnerHTML();
      window.currBtn = demoBtns[i];
      // 清空动画
      window.app.stage.removeChildren();
      sound.stopAll();
      // 播放音频
      sound.add(`demo${i + 1}`, demoes[`demo${i + 1}`].audioSrc, {
        preload: true,
      });
      // 播放sb
      loadScriptDemo(window.app, demoes[`demo${i + 1}`], () => {
        sound.play("demo" + (i + 1));
      });
    });
  }
}

function resetBtnInnerHTML() {
  for (let i = 0; i < demoBtns.length; i++) {
    demoBtns[i].innerHTML = `Demo${i + 1}`;
  }
}
