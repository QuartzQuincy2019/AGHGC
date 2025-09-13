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
    const selfData = deepClone(event.data);
    var selfStatusC = selfData.CharacterStatus;
    var selfStatusL = selfData.LightconeStatus;
    function initializeStatus() {
        selfStatusC = selfData.CharacterStatus;
        selfStatusL = selfData.LightconeStatus;
    }
    var pt = PoolType.Character;
    var sC = 0, sL = 0;//获得数
    var meet = 0;//达成数
    var obtained = [];
    const investment = event.data.Investment;
    var invested = 0;
    switch (event.data.Strategy) {
        case 1: {//先C后L
            for (var i = 0; i < selfData.SimulationTimes; i++) {
                var pt = PoolType.Character;
                sC = 0; sL = 0; invested = 0; obtained = [];
                initializeStatus();
                while (invested < investment) {
                    var mode = 0;
                    if (pt == PoolType.Character) mode = warpWithInfo(selfStatusC, obtained, pt);
                    if (pt == PoolType.Lightcone) mode = warpWithInfo(selfStatusL, obtained, pt);
                    if (mode == 15 && pt == PoolType.Character) sC++;
                    if (mode == 15 && pt == PoolType.Lightcone) sL++;
                    if (sC == event.data.TargetCQty) pt = PoolType.Lightcone;//切换卡池
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
                var pt = PoolType.Lightcone;
                sC = 0; sL = 0; invested = 0; obtained = [];
                initializeStatus();
                while (invested < investment) {
                    var mode = 0;
                    if (pt == PoolType.Character) mode = warpWithInfo(selfStatusC, obtained, pt);
                    if (pt == PoolType.Lightcone) mode = warpWithInfo(selfStatusL, obtained, pt);
                    if (mode == 15 && pt == PoolType.Character) sC++;
                    if (mode == 15 && pt == PoolType.Lightcone) sL++;
                    if (sL == event.data.TargetLQty) pt = PoolType.Character;//切换卡池
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
