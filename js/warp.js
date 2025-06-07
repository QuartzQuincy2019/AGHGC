// warp.js
// 第三版 祈愿逻辑（2024/3/23）
// 第四版 祈愿逻辑（2024/4/5）更新武器逻辑，集录卡池逻辑等待下一次整改
// 2025/3/29 适配星铁
// 第五版 祈愿和初步统计逻辑（2025/4/4）更新筛选器和重复计数
// 祈愿。储存祈愿逻辑。

/**
 * Sup：五星Up物品
 */
var Sup = [];

/**
 * Scommon：五星常驻
 */
var Scommon = [];

/**
 * Rup：四星Up物品
 */
var Rup = [];

/**
 * Rcommon：四星常驻
 */
var Rcommon = [];

/**
 * Candidates：候选
 */
var Candidates = [];

var Sup_W = [];
var Sup_C = [];
var Rup_W = [];
var Rup_C = [];
var Scommon_W = [];
var Scommon_C = [];
var Rcommon_W = [];
var Rcommon_C = [];
function resetDetail() {
    Candidates = [];
    Sup = [];
    Scommon = [];
    Rup = [];
    Rcommon = [];
    Sup_W = [];
    Sup_C = [];
    Rup_W = [];
    Rup_C = [];
    Scommon_W = [];
    Scommon_C = [];
    Rcommon_W = [];
    Rcommon_C = [];
}



//初始化对象
var isRupObtained = false;
var isSupObtained = false;
var RGuaranteeCounter = 0;
var SGuaranteeCounter = 0;
var totalWarps = 0;
var OBTAINED_ITEMS = [];

/**
 * 这个对象除了告诉warpCharacter()函数从哪里开始计算概率之外，
 * 也为抽取到的每一个物品“在哪一抽抽到的”提供了信息
 */
class WarpStatus {
    /**
     * 是否4星出up
     * @type {Boolean}
     */
    RupSwitch;
    /**
     * 是否5星出up
     * @type {Boolean}
     */
    SupSwitch;
    RCount;
    SCount;
    total;
    constructor(_RupSwitch, _SupSwitch, _RCount, _SCount, _total) {
        this.RupSwitch = _RupSwitch;
        this.SupSwitch = _SupSwitch;
        this.RCount = _RCount;
        this.SCount = _SCount;
        this.total = _total
    }
    initialize() {
        this.RupSwitch = false;
        this.SupSwitch = false;
        this.RCount = 0;
        this.SCount = 0;
    }
}
var GLOBAL_WARP_STATUS = new WarpStatus(
    isRupObtained, isSupObtained,
    RGuaranteeCounter, SGuaranteeCounter,
    totalWarps);

function globalInitalize(globalStatus) {
    globalStatus.initialize();
    isRupObtained = false;
    isSupObtained = false;
    RGuaranteeCounter = 0;
    SGuaranteeCounter = 0;
    totalWarps = 0;
    OBTAINED_ITEMS = [];
    globalStatus.RupSwitch = isRupObtained;
    globalStatus.SupSwitch = isSupObtained;
    globalStatus.RCount = RGuaranteeCounter;
    globalStatus.SCount = SGuaranteeCounter;
    globalStatus.total = totalWarps;
}

/**
 * 抽取结果类
 * 包含结果代号（不分角色或光锥）和类型（Sup/Scommon/Rup/Rcommon/3星）
 */
class ResultStatus {
    codeName;
    category;
    constructor(_codeName, _category) {
        this.codeName = _codeName;
        this.category = _category;
    }
}

/**
 * 
 * @param {WarpStatus} status 
 * @returns {[number, number]} 
 */
function getProbability(status) {
    const sCount = Number(status.SCount);
    const rCount = Number(status.RCount);

    // 处理五星保底
    if (sCount + 1 >= 90) {
        return [1, 1]; // 五星概率100%，四星概率0%
    }

    // 处理四星保底
    if (rCount + 1 >= 10) {
        let s = calculateSProbability(sCount);
        return [s, 1]; // 四星概率 = 1 - 五星概率 = 1 - s
    }

    // 常规概率计算
    const s = calculateSProbability(sCount);
    const r = 0.051; // 四星基础概率
    return [s, s+r];
}

/**
 * 计算五星基础概率（内部辅助函数）
 */
function calculateSProbability(sCount) {
    if (sCount + 1 <= 73) {
        return 0.006;
    } else {
        return 0.006 + (sCount + 1 - 73) * 0.06;
    }
}

/**
 * 
 * @param {WarpStatus} status 
 */
function determineQuality(status) {
    var probArray = getProbability(status);
    var randomed = Math.random();
    // console.log("randomed="+randomed,'probArray='+probArray);
    if (randomed < probArray[0]) {
        return 5;//S
    } else if (randomed < probArray[1]) {
        return 4;//R
    } else {
        return 3;//3星
    }
}

function determineUp() {
    var u = Math.random();
    if (u <= 0.625) return 10;//未确定
    return 0;
}

function warpWithInfo(status,obtained) {
    var item = [null, null];
    //随机数抽取（决定：5/4/3）
    item[0] = determineQuality(status);

    if (status.SupSwitch == true) {
        item[1] = 10;
    } else if (status.RupSwitch == true) {
        item[1] = 10;
    } else {
        //随机数抽取（决定：10/0）
        item[1] = determineUp();
    }

    //mode
    var mode = item[0] + item[1];
    // console.log("mode="+mode);
    status.total ++;//这两者顺序不能颠倒
    //currentInfo应记录：
    //1.这一抽是第几抽，因此total应先加一
    //2.在这一抽之前，有多少抽未出5星（即垫数）
    var currentInfo = deepClone(status);//这两者顺序不能颠倒
    var result;
    var resultStatus;
    switch (mode) {
        case 15: {
            result = Sup[0];
            resultStatus = new ResultStatus(result, 15);
            status.RCount ++;
            status.SCount = 0;
            status.SupSwitch = false;
            break;
        }
        case 5: {
            result = getRandomElement(Scommon);
            resultStatus = new ResultStatus(result, 5);
            status.RCount ++;
            status.SCount = 0;
            status.SupSwitch = true;
            break;
        }
        case 14: {
            result = getRandomElement(Rup);
            resultStatus = new ResultStatus(result, 14);
            status.RCount = 0;
            status.SCount ++;
            status.RupSwitch = false;
            break;
        }
        case 4: {
            result = getRandomElement(Rcommon);
            resultStatus = new ResultStatus(result, 4);
            status.RCount = 0;
            status.SCount ++;
            status.RupSwitch = true;
            break;
        }
        case 3: {
            status.RCount ++;
            status.SCount ++;
            break;
        }
        case 13: {
            status.RCount ++;
            status.SCount ++;
            break;
        }
        default: throw new Error("未出现预期情况。");
    }
    if (mode % 10 != 3) {
        // console.log(currentInfo);
        obtained.push({ rStatus: resultStatus, wStatus: currentInfo });
    }
}

function warpWithInfoFor(pulls) {
    for (var i = 0; i < pulls; i++) {
        warpWithInfo(GLOBAL_WARP_STATUS,OBTAINED_ITEMS);
    }
}

/**
 * obj接收：rStatus, wStatus
 */
function translateWarpInfo(obj) {
    let item = findItem(obj.rStatus.codeName);
    var parag = document.createElement('p');

    var span0 = document.createElement('span');
    span0.classList.add("ItemTitle");
    if (Scommon.includes(obj.rStatus.codeName)) span0.classList.add("BoldRed");
    if (Sup.includes(obj.rStatus.codeName)) {
        span0.classList.add("BoldBlue","SupItemTitle");
    };
    span0.innerHTML = item.fullName[LANGUAGE] + '<br>';


    var span0f = document.createElement('span');
    let t1 = lang[LANGUAGE]["totalCount"];
    t1 += obj.wStatus.total;
    let t2 = lang[LANGUAGE]._SGuarantee[obj.wStatus.SupSwitch];
    span0f.innerHTML = t1 + ' ' + t2 + '<br>';

    span1e = document.createElement('span');
    span1e.innerHTML = lang[LANGUAGE]["SCount"] + lang[LANGUAGE]["colon"];

    span1 = document.createElement('span');
    if (obj.wStatus.SCount >= 77) {
        span1.classList.add('BoldRed','ItemTitle');
    }
    if (obj.wStatus.SCount <= 35 && Sup.includes(obj.rStatus.codeName)) {
        span1.classList.add('BoldGreen','ItemTitle');
    };
    span1.innerHTML = obj.wStatus.SCount;

    parag.append(span0, span0f, span1e, span1);
    return parag;
}
