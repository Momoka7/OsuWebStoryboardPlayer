import * as Parser from "./parser";
import * as PIXI from "pixi.js";
import gsap from "gsap";
import { createLayers } from "./layer";

export function loadScriptDemo(app, scriptObj, callback) {
  let osbPath = scriptObj.osbSrc;
  fetch(osbPath)
    .then((res) => res.text())
    .then((text) => {
      gsap.killTweensOf("*"); //清除所有动画
      let sbCode = text.split("\n");
      let mainTimeline = gsap.timeline();
      let timeline = mainTimeline;
      let progressBar = createProgressBar(app);
      timeline.autoRemoveChildren = true;
      timeline.pause();

      let animationContainer = new PIXI.Container();
      let layers = createLayers(animationContainer);
      app.stage.addChild(animationContainer);
      let animeContext = { mainTimeline, layers, sprites: {}, progressBar };
      animeContext.scriptObj = scriptObj;
      animeContext.timeline = timeline;

      loadTextures(sbCode, animeContext).then(() => {
        parseScript(sbCode, animeContext, callback);
      });
    });
}

function createProgressBar(app) {
  const progressBar = new PIXI.Graphics();

  progressBar.rect(0, 0, 500, 100);
  progressBar.fill({
    color: 0xffffff,
  });

  app.stage.addChild(progressBar);
  progressBar.scale.set(0, 1);
  return progressBar;
}

async function loadTextures(sbCode, animeContext) {
  //预先加载图片纹理

  const loadPromises = sbCode.map(async (str, idx) => {
    if (str.startsWith("Sprite")) {
      // 表示是一个图片
      let params = str.split(",");
      // let path = document.querySelector("#folder").value + params[3].replace(/\"/g,"").replace(/\\/g,"/").trim();
      let path =
        animeContext.scriptObj.prefix +
        params[3].replace(/\"/g, "").replace(/\\/g, "/").trim();
      let texture = await PIXI.Assets.load(path);
      animeContext.sprites[path] = texture;
    }
  });

  await Promise.all(loadPromises);
}

function parseScript(sbCode, animeContext, callback) {
  //一次性解析脚本
  sbCode.forEach((str, idx) => {
    window.requestIdleCallback(() => {
      if (str.startsWith("Sprite")) {
        //表示是一个图片
        loadResource(str, animeContext);
      } else if (str.startsWith(" ")) {
        //空格开头，对物件进行操作
        parseCommands(str, animeContext);
      }
      if (idx % 2000 == 0) {
        console.log("now loaded: " + idx);
      }
      // animeContext.progressBar.scale.set((idx / sbCode.length) * 1, 1);
      // console.log(idx / sbCode.length);
      window.currBtn.innerHTML = Math.ceil((idx / sbCode.length) * 100) + "%";

      if (idx == sbCode.length - 1) {
        //等所有脚本解析完毕后再播放
        // playMusic();//播放音乐文件
        console.log("load done!!!");
        animeContext.progressBar.visible = false;
        callback();
        setTimeout(() => {
          animeContext.timeline.play();
        }, 0);
      }
    });
  });
}

function exitLoop(animeContext) {
  //退出循环
  const curResource = animeContext.curResource;
  if (curResource != undefined && curResource.isLooping) {
    console.log("now exit!!!");
    animeContext.timeline.repeat(curResource.loopCnt - 1);
    curResource.isLooping = 0;
    curResource.loopCnt = 0;
  }
  animeContext.timeline = animeContext.mainTimeline; //切换回主timeline
}

function loadResource(str, animeContext) {
  //读取sb中所用到的图片资源
  exitLoop(animeContext);
  let params = str.split(",");
  // let path=document.querySelector("#folder").value+params[3].replace(/\"/g,"").replace(/\\/g,"/").trim();
  let path =
    animeContext.scriptObj.prefix +
    params[3].replace(/\"/g, "").replace(/\\/g, "/").trim();
  // let tempRes = PIXI.Sprite.from(sprites[path]);//图片纹理路径
  let tempRes = PIXI.Sprite.from(animeContext.sprites[path]); //图片纹理路径
  chooseOrigin(params[2], tempRes); //选择原点所在处
  tempRes.x = params[4];
  tempRes.y = params[5];
  tempRes.visible = false;
  tempRes.isLooping = 0;
  tempRes.initCnt = 0;
  chooseLayers(params[1], tempRes, animeContext); //选择所在图层
  animeContext.curResource = tempRes;
  // sprites.push(tempRes);
}

function parseCommands(str, animeContext) {
  let params = str.split(",");
  const curResource = animeContext.curResource;
  const mainTimeline = animeContext.mainTimeline;
  if (animeContext.curResource.isLooping == 1) {
    //处于循环状态
    if (str.startsWith("  ")) {
      //在循环内部
      params[0] = params[0].slice(1);
      //console.log(params);
    } else {
      //退出循环
      exitLoop(animeContext);
    }
  }
  if (params[0].startsWith(" S")) {
    //Scale 对元件进行缩放
    Parser.animateS(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" F")) {
    //对元件进行透明度操作
    Parser.animateF(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" MX")) {
    //对元件进行X方向操作
    Parser.animateMX(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" MY")) {
    //对元件进行Y方向操作
    Parser.animateMY(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" M")) {
    //对元件进行XY方向操作
    Parser.animateM(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" R")) {
    //对元件进行旋转
    Parser.animateR(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" V")) {
    //对元件矢量操作（拉长/压扁）
    Parser.animateV(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" C")) {
    //对元件进行颜色操作（RGB方式改变色调）
    Parser.animateC(params, curResource, animeContext.timeline);
  } else if (params[0].startsWith(" L")) {
    //循环
    curResource.isLooping = 1;
    curResource.loopCnt = Number(params[2]); //循环次数
    let tTimeline = gsap.timeline();
    mainTimeline.add(tTimeline, Number(params[1]) / 1000);
    animeContext.timeline = tTimeline; //切换timeline到循环timeline
  }
}

function chooseOrigin(originStr, obj) {
  //选择原点位置
  if (originStr == "Centre") {
    obj.anchor.set(0.5);
  } else if (originStr == "CentreLeft") {
    obj.anchor.set(0, 0.5);
  } else if (originStr == "CentreRight") {
    obj.anchor.set(1, 0.5);
  } else if (originStr == "TopCentre") {
    obj.anchor.set(0.5, 0);
  } else if (originStr == "TopLeft") {
    obj.anchor.set(0, 0);
  } else if (originStr == "TopRight") {
    obj.anchor.set(1, 0);
  } else if (originStr == "BottomCentre") {
    obj.anchor.set(0.5, 1);
  } else if (originStr == "BottomLeft") {
    obj.anchor.set(0, 1);
  } else if (originStr == "BottomRight") {
    obj.anchor.set(1, 1);
  }
}

function chooseLayers(layerStr, obj, animeContext) {
  //选择图层
  if (layerStr == "Background") {
    animeContext.layers[0].addChild(obj);
    obj.father = "BG";
  } else if (layerStr == "Foreground") {
    animeContext.layers[1].addChild(obj);
    obj.father = "FG";
  }
}
