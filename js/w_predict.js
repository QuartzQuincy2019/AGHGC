// Worker
importScripts("./core.js");
importScripts("./settings.js");
importScripts("./database.js");
importScripts("./warp.js");

self.onmessage = function (event) {
    const predictionFormValueObj=event.data.pfv;
    const totalRound = event.data.round;
    var obtained=[];
    var innerStatus = new WarpStatus(
        false, predictionFormValueObj.isGuaranteed,
        0, predictionFormValueObj.SCount,
        0);
    function innerReset() {
        globalInitalize(innerStatus);
        selectPool(predictionFormValueObj.selectedPool);
        obtained=[];
        innerStatus.RupSwitch = false;
        innerStatus.SupSwitch = predictionFormValueObj.isGuaranteed;
        innerStatus.RCount = 0;
        innerStatus.SCount = predictionFormValueObj.SCount;
        innerStatus.total = 0;
    }
    innerReset();
    var count = [];
    for (var i = 0; i <= predictionFormValueObj.pulls; i++) {
        count.push(0);
    }
    for (var testSequence = 0; testSequence < totalRound; testSequence++) {
        //单轮：
        //模拟predictionFormValueObj.pulls次抽取
        for (var i = 0; i < predictionFormValueObj.pulls; i++) {
            warpWithInfo(innerStatus,obtained);
        }
        //开始处理数据
        var x = 0;
        for (var i = 0; i < obtained.length; i++) {
            // console.log("轮数:"+testSequence,"length="+obtained.length+"obtained中的["+i+"]记录：",obtained[i].rStatus.codeName);
            if (Sup.includes(obtained[i].rStatus.codeName)) x += 1;
        }
        count[x] += 1;
        //数据处理结束，重置，然后进行下一次模拟
        innerReset();
    }
    // console.log(count);
    self.postMessage(count);
}