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
        isRupObtained = false;
        isSupObtained = predictionFormValueObj.isGuaranteed;
        RGuaranteeCounter = 0;
        SGuaranteeCounter = predictionFormValueObj.SCount;
        innerStatus.RupSwitch = isRupObtained;
        innerStatus.SupSwitch = isSupObtained;
        innerStatus.RCount = RGuaranteeCounter;
        innerStatus.SCount = SGuaranteeCounter;
        innerStatus.total = totalWarps;
    }
    innerReset();
    var count = [];
    for (var i = 0; i <= predictionFormValueObj.pulls; i++) {
        count.push(0);
    }
    for (var testSequence = 0; testSequence < totalRound; testSequence++) {
        for (var i = 0; i < predictionFormValueObj.pulls; i++) {
            warpWithInfo(innerStatus,obtained);
        }
        //开始处理数据
        var x = 0;
        for (var i = 0; i < obtained.length; i++) {
            if (Sup.includes(obtained[i].rStatus.codeName)) x += 1;
        }
        count[x] += 1;
        //数据处理结束，重置，然后进行下一次模拟
        innerReset();
    }
    // console.log(count);
    self.postMessage(count);
}