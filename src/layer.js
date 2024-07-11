import * as PIXI from 'pixi.js';

export function createLayers(parentContainer){//创建图层，如前景层、背景层
    let layers=[];
    let Background=new PIXI.Container();
    let baseHeight= 490
    let baseWidth= 870
    let scaleFactor=window.app.canvas.height/baseHeight
    let xScaleFactor=window.app.canvas.width/baseWidth
    parentContainer.addChild(Background);
    Background.sortableChildren =true;
    Background.zIndex=0;
    Background.x=115 * xScaleFactor;
    Background.y= 5 * scaleFactor;
    Background.scale.set(xScaleFactor,scaleFactor);
    layers.push(Background);

    let Foreground=new PIXI.Container();
    parentContainer.addChild(Foreground);
    Foreground.sortableChildren =true;
    Foreground.zIndex=5;
    Foreground.x=115 * xScaleFactor;
    Foreground.y= 5 * scaleFactor;
    Foreground.scale.set(xScaleFactor,scaleFactor);
    layers.push(Foreground);

    window.onresize = () => {
        // scaleFactor=window.app.canvas.height/baseHeight
        // xScaleFactor=window.app.canvas.width/baseWidth
        // Background.x=115 * xScaleFactor;
        // Background.y= 5 * scaleFactor;
        // Background.scale.set(xScaleFactor,scaleFactor);
        // Foreground.x=115 * xScaleFactor;
        // Foreground.y= 5 * scaleFactor;
        // Foreground.scale.set(xScaleFactor,scaleFactor);
        console.log("resize",window.devicePixelRatio)
        parentContainer.scale.set(1/window.devicePixelRatio);
    }

    return layers
}