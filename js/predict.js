// predict.js
refreshPoolSelector(document.getElementById("PreForm_PoolInput"));
function getPredictionFormValue() {
    var pool = document.getElementById("PreForm_PoolInput").value;
    var gua5 = document.getElementById("PreForm_GuaranteeInput").value;
    if (gua5 == 1) gua5 = true;
    if (gua5 == 0) gua5 = false;
    var SCounter = document.getElementById("PreForm_SCountInput").value;
    // var pull = document.getElementById("PreForm_PullInput").value;
    var SupNumber = document.getElementById("PreForm_SupInput").value;
    selectPool(pool);
    document.getElementById("PreForm_SupTargetDisplay").innerHTML = "<strong>" + findItem(Sup).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;x</strong>";
    P_Form_PredictionTableArea.innerHTML = '对抽取过程进行计算，最多需要10秒钟。期间请勿再次按下“开始预测”按钮。';
    return {
        selectedPool: pool, //所选卡池
        isGuaranteed: Number(gua5),  //是否大保底
        SCount: Number(SCounter), //当前小保底垫数
        pulls: 500, //总抽数
        targetQty: Number(SupNumber) //目标五星Up个数
    };
}

var PREDICTION_RESULTS;
var FINAL_PREDICTED_P = 1;

function predict() {
    var predictionFormValueObj = getPredictionFormValue();
    var pool = TOTAL_EVENT_WARPS[predictionFormValueObj.selectedPool];
    var poolType = pool.type;
    var warpStatus = new WarpStatus(
        false,
        predictionFormValueObj.isGuaranteed,
        0,
        predictionFormValueObj.SCount,
        0
    );
    var start = predictionFormValueObj.pulls;
    var res = getProbabilityArray(
        poolType,
        start,
        predictionFormValueObj.targetQty,
        warpStatus
    );
    while (res.length > 0 && res[res.length - 1] < 0.999) {
        start += 50;
        res = getProbabilityArray(
            poolType,
            start,
            predictionFormValueObj.targetQty,
            warpStatus
        );
    }
    while (res[res.length - 1] > 0.9999) {
        res.pop();
    }
    res.shift(); //去掉0抽
    let seq = [];
    for (var i = 1; i <= res.length; i++) {
        seq.push(i);
    }
    var PREDICTION_RESULTS = {
        Xs: seq,
        Ps: res
    };
    //已获取概率数组
    //判断是否使用多列表
    var rows = 20;
    if (PREDICTION_RESULTS.Ps.length < 200) {
        rows = 20;
    } else if (PREDICTION_RESULTS.Ps.length < 500) {
        rows = 40;
    } else if (PREDICTION_RESULTS.Ps.length < 800) {
        rows = 80;
    } else if (PREDICTION_RESULTS.Ps.length < 1200) {
        rows = 100;
    } else {
        rows = 200;
    }
    //使用分表
    //列数计算
    const cols = Math.ceil(PREDICTION_RESULTS.Xs.length / rows);
    document.getElementById("PredictionTableArea").innerHTML = '';
    var _table = document.createElement('table');
    for (var i = 0; i < rows; i++) {
        var _tr = document.createElement('tr');
        for (j = 0; j < cols; j++) {
            if (i + rows * j >= PREDICTION_RESULTS.Ps.length) break;
            var _tr_td_X_cell = document.createElement('td');
            _tr_td_X_cell.innerHTML = PREDICTION_RESULTS.Xs[i + rows * j];
            var _tr_td_P_cell = document.createElement('td');
            var style = '';
            if (PREDICTION_RESULTS.Ps[i + rows * j] < 0.05) {
                style = 'BoldRed';
            } else if (PREDICTION_RESULTS.Ps[i + rows * j] < 0.3) {
                style = 'BoldPurple';
            } else if (PREDICTION_RESULTS.Ps[i + rows * j] < 0.6) {
                style = 'BoldBlue';
            } else if (PREDICTION_RESULTS.Ps[i + rows * j] < 0.85) {
                style = 'BoldYellow';
            } else {
                style = 'BoldGreen';
            }
            var p = formatFloat(PREDICTION_RESULTS.Ps[i + rows * j] * 100, 4);
            _tr_td_P_cell.innerHTML = p + '%';
            _tr_td_P_cell.classList.add(style);
            _tr.append(_tr_td_X_cell, _tr_td_P_cell);
        }
        _table.appendChild(_tr);
    }
    document.getElementById("PredictionTableArea").appendChild(_table);
}