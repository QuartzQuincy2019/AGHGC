// predict.js
const PRECISION = 5; //概率显示精度(百分比小数点后x位)

refreshPoolSelector(E_Form_CharacterPoolInput);
function getPredictionFormValue() {
    var pool = E_Form_CharacterPoolInput.value;
    var gua5 = document.getElementById("PreForm_GuaranteeInput").value;
    if (gua5 == 1) gua5 = true;
    if (gua5 == 0) gua5 = false;
    var SCounter = document.getElementById("PreForm_SCountInput").value;
    // var pull = document.getElementById("PreForm_PullInput").value;
    var SupNumber = document.getElementById("PreForm_SupInput").value;
    selectPool(pool);
    document.getElementById("PreForm_SupTargetDisplay").innerHTML = "<strong>" + findItem(Sup).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;x</strong>";
    P_Form_PredictionTableArea.innerHTML = '“抽取目标数量”不允许多于65。对抽取过程进行计算，最多需要20秒钟。期间请勿再次按下“开始计算”按钮。';
    return {
        selectedPool: pool, //所选卡池
        isGuaranteed: Number(gua5),  //是否大保底
        SCount: Number(SCounter), //当前小保底垫数
        targetQty: Number(SupNumber) //目标五星Up个数
    };
}

var PREDICTION_RESULTS;
var FINAL_PREDICTED_P = 1;

function predict() {
    var predictionFormValueObj = getPredictionFormValue();
    if (predictionFormValueObj.targetQty > 65) {
        alert("“抽取目标数量”超出安全值！");
        throw new Error("“抽取目标数量”超出安全值！");
    }
    var pool = TOTAL_EVENT_WARPS[predictionFormValueObj.selectedPool];
    var poolType = pool.type;
    var warpStatus = new WarpStatus(
        false,
        predictionFormValueObj.isGuaranteed,
        0,
        predictionFormValueObj.SCount,
        0
    );
    var start = 500;//初始计算抽数，投入500抽
    if (predictionFormValueObj.targetQty >= 30 && predictionFormValueObj.targetQty < 50) {
        start = 3000;
    } else if (predictionFormValueObj.targetQty < 70) {
        start = 6000;
    }
    var res = getOverallProbability(
        poolType,
        start,
        predictionFormValueObj.targetQty,
        warpStatus
    );
    while (res.length > 0 && res[res.length - 1] < 0.99) {
        start *= 2;
        res = [];
        res = getOverallProbability(
            poolType,
            start,
            predictionFormValueObj.targetQty,
            warpStatus
        );
    }
    while (res[res.length - 1] > 0.999) {
        res.pop();
    }
    res.shift(); //去掉0抽
    let seq = [];//seq从1开始
    for (var i = 1; i <= res.length; i++) {
        seq.push(i);
    }
    var exp = calculateExpectedPulls(predictionFormValueObj.targetQty, warpStatus, poolType);
    const PREDICTION_RESULTS = {
        Xs: seq,
        Ps: res,
        E: exp
    };
    //已获取概率数组
    //判断是否使用多列表
    var rows = 10;
    if (PREDICTION_RESULTS.Ps.length < 100) {
        rows = 10;
    } else if (PREDICTION_RESULTS.Ps.length < 200) {
        rows = 20;
    } else if (PREDICTION_RESULTS.Ps.length < 500) {
        rows = 30;
    } else {
        rows = 50;
    }
    //低概率剔除
    var Xs = deepClone(PREDICTION_RESULTS.Xs);
    var Ps = deepClone(PREDICTION_RESULTS.Ps);
    for (var i = 0; ; i++) {
        //剔除小于0.6%的项
        if (PREDICTION_RESULTS.Ps[i] < 0.006) {
            Xs.shift();
            Ps.shift();
        } else {
            break;
        }
    }
    // console.log(PREDICTION_RESULTS);
    //使用分表
    //列数计算
    const cols = Math.ceil(Xs.length / rows);
    document.getElementById("PredictionTableArea").innerHTML = '';
    var _table = document.createElement('table');
    //创建表格
    for (var i = 0; i < rows; i++) {
        var _tr = document.createElement('tr');
        for (j = 0; j < cols; j++) {
            if (i + rows * j >= Ps.length) break;
            var _tr_td_X_cell = document.createElement('td');
            _tr_td_X_cell.innerHTML = Xs[i + rows * j];
            var _tr_td_P_cell = document.createElement('td');
            var style = '';
            if (Ps[i + rows * j] < 0.05) {
                style = 'BoldGrey';
            } else if (Ps[i + rows * j] < 0.2) {
                style = 'BoldRed';
            } else if (Ps[i + rows * j] < 0.4) {
                style = 'BoldPurple';
            } else if (Ps[i + rows * j] < 0.6) {
                style = 'BoldBlue';
            } else if (Ps[i + rows * j] < 0.85) {
                style = 'BoldYellow';
            } else {
                style = 'BoldGreen';
            }
            var p = formatFloat(Ps[i + rows * j] * 100, PRECISION);
            _tr_td_P_cell.innerHTML = p + '%';
            _tr_td_P_cell.classList.add(style);
            _tr.append(_tr_td_X_cell, _tr_td_P_cell);
        }
        _table.appendChild(_tr);
    }
    //显示期望
    document.getElementById("PredictionExpectationArea").innerHTML = "达成抽取目标的期望抽数：<span class='BoldBlue'>" + formatFloat(PREDICTION_RESULTS.E, PRECISION) + "</span>";
    document.getElementById("PredictionTableArea").appendChild(_table);
}