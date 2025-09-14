importScripts("./core.js");
importScripts("./plugins/mjd.js");
importScripts("./settings.js");
importScripts("./lang.js");
importScripts("./version.js");
importScripts("./pool.js");
importScripts("./database.js");
importScripts("./warp.js");

function switchPoolType(currentType) {
    if (currentType == PoolType.Character) {
        currentType = PoolType.Lightcone;
    } else {
        currentType = PoolType.Character;
    }
}

self.onmessage = function (event) {
    function isAchieved(sC, sL) {
        return sC >= event.data.TargetCQty && sL >= event.data.TargetLQty;
    }
    console.log('Worker 收到消息:', event.data);
    const selfData = deepClone(event.data);//各线程初始值
    var variableStatusC = deepClone(selfData.CharacterStatus);
    var variableStatusL = deepClone(selfData.LightconeStatus);
    var index = selfData.BatchIndex;
    function initializeStatus() {
        variableStatusC = deepClone(selfData.CharacterStatus);
        variableStatusL = deepClone(selfData.LightconeStatus);
    }
    var sC = 0, sL = 0;//获得数
    var meet = 0;//达成数
    var obtained = [];
    const investment = selfData.Investment;
    var invested = 0;
    switch (selfData.Strategy) {
        case 1: {//先C后L
            for (var i = 0; i < selfData.SimulationTimes; i++) {
                var pt = PoolType.Character;//初始卡池类型
                initializeStatus();
                sC = 0; sL = 0; invested = 0; obtained = [];
                while (invested < investment) {
                    var mode = 0;
                    if (pt == PoolType.Character) mode = warpWithInfo(variableStatusC, obtained, pt);
                    if (pt == PoolType.LightCone) mode = warpWithInfo(variableStatusL, obtained, pt);
                    if (mode == 15 && pt == PoolType.Character) sC++;
                    if (mode == 15 && pt == PoolType.LightCone) sL++;
                    if (sC == selfData.TargetCQty) {
                        pt = PoolType.LightCone;//切换卡池
                    }//切换卡池
                    invested++;
                    if (isAchieved(sC, sL)) {
                        meet++;
                        break;
                    }
                }
            }
            break;
        }
        case 2: {//先L后C
            for (var i = 0; i < selfData.SimulationTimes; i++) {
                var pt = PoolType.LightCone;//初始卡池类型
                initializeStatus();
                sC = 0; sL = 0; invested = 0; obtained = [];
                while (invested < investment) {
                    var mode = 0;
                    if (pt == PoolType.Character) mode = warpWithInfo(variableStatusC, obtained, pt);
                    if (pt == PoolType.LightCone) mode = warpWithInfo(variableStatusL, obtained, pt);
                    if (mode == 15 && pt == PoolType.Character) sC++;
                    if (mode == 15 && pt == PoolType.LightCone) sL++;
                    if (sL == selfData.TargetLQty) {
                        pt = PoolType.Character;//切换卡池
                    }//切换卡池
                    invested++;
                    if (isAchieved(sC, sL)) {
                        meet++;
                        break;
                    }
                }
            }
            break;
        }
    }
    self.postMessage(meet);
}
