// predict.js
refreshPoolSelector(document.getElementById("PreForm_PoolInput"));
function getPredictionFormValue() {
    var pool = document.getElementById("PreForm_PoolInput").value;
    var gua5 = document.getElementById("PreForm_GuaranteeInput").value;
    if (gua5 == 1) gua5 = true;
    if (gua5 == 0) gua5 = false;
    var SCounter = document.getElementById("PreForm_SCountInput").value;
    var pull = document.getElementById("PreForm_PullInput").value;
    var SupNumber = document.getElementById("PreForm_SupInput").value;
    selectPool(pool);
    document.getElementById("PreForm_SupTargetDisplay").innerHTML = "<strong>" + findItem(Sup).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;x</strong>";
    P_Form_PredictionTableArea.innerHTML = '对抽取过程进行' + testMaximum + '次模拟(10线程)，最多需要30秒钟。期间请勿再次按下“开始预测”按钮。';
    return {
        selectedPool: pool,
        isGuaranteed: gua5,
        SCount: SCounter,
        pulls: pull,
        targetQty: SupNumber
    };
}

var PREDICTION_RESULTS;
var FINAL_PREDICTED_P = 1;
function startPrediction(predictionFormValueObj) {
    OBTAINED_ITEMS = [];
    var roundsPerWorker = testMaximum / 10;
    var completedWorkers = 0;
    var workersResults = [];
    var count = [];
    function drawPrediction() {
        document.getElementById("PredictionTableArea").innerHTML = '';
        var _table = document.createElement('table');
        var _tr_Xs = document.createElement('tr');
        var _tr_td_X = document.createElement('td');
        _tr_td_X.innerHTML = '五星Up个数';
        _tr_Xs.appendChild(_tr_td_X);
        for (var i = 0; i < PREDICTION_RESULTS.Xs.length; i++) {
            var _tr_td_X_cell = document.createElement('td');
            _tr_td_X_cell.innerHTML = PREDICTION_RESULTS.Xs[i];
            _tr_Xs.appendChild(_tr_td_X_cell);
        }
        _table.appendChild(_tr_Xs);
        var _tr_Ps = document.createElement('tr');
        var _tr_td_P = document.createElement('td');
        _tr_td_P.innerHTML = '对应概率';
        _tr_Ps.appendChild(_tr_td_P);
        for (var i = 0; i < PREDICTION_RESULTS.Ps.length; i++) {
            var _tr_td_P_cell = document.createElement('td');
            var p = formatFloat(PREDICTION_RESULTS.Ps[i] * 100, 3);
            _tr_td_P_cell.innerHTML = p + '%';
            _tr_Ps.appendChild(_tr_td_P_cell);
        }
        _table.appendChild(_tr_Ps);
        document.getElementById("PredictionTableArea").appendChild(_table);
        //----------------
        var parag = document.createElement('p');
        let final = 0;
        for (var i = predictionFormValueObj.targetQty; i < count.length; i++) {
            if (count[i] == 0) break;
            final = final + count[i] / testMaximum;
        }
        parag.innerHTML = '均值（数学期望）<span class="BoldBlue">' + formatFloat(PREDICTION_RESULTS.E, 2)
            + '</span>个，目标达成概率：<span class="BoldBlue">'
            + formatFloat(final * 100, 3) + "%</span>";
        FINAL_PREDICTED_P = final;
        //-----------------
        if (final >= 0.85) {
            parag.innerHTML += "<br><span class='BoldGreen'>此抽卡规划一般会实现。</span>";
        }
        if (final < 0.85 && final >= 0.4) {
            parag.innerHTML += "<br><span class='BoldBlue'>此抽卡规划是否实现值得期待。</span>";
        }
        if (final < 0.4 && final >= 0.1) {
            parag.innerHTML += "<br><span class='BoldYellow'>此抽卡规划一般不会实现。</span>";
        }
        if (final < 0.1) {
            parag.innerHTML += "<br><span class='BoldRed'>此抽卡规划不会实现。</span>";
        }
        document.getElementById("PredictionTableArea").appendChild(parag);
    }
    function merge() {
        for (var col = 0; col < workersResults[0].length; col++) {
            var bit = 0;
            for (var row = 0; row < workersResults.length; row++) {
                bit = bit + Number(workersResults[row][col]);
            }
            count.push(bit);
        }
        var output_Xs = [];
        var output_Ps = [];
        for (var f = 0; f < count.length; f++) {
            if (count[f] == 0) continue;
            output_Xs.push(f);
            output_Ps.push(count[f] / testMaximum);
        }
        var expectation = 0;
        for (var i = 0; i < output_Xs.length; i++) {
            expectation = expectation + output_Xs[i] * output_Ps[i];
        }
        PREDICTION_RESULTS = {
            Xs: output_Xs,
            Ps: output_Ps,
            E: expectation
        };
        drawPrediction();
    }
    function startWorkerBatch(index = 0) {
        var batchSize = 1;
        for (let i = 0; i < batchSize && index < 10; i++, index++) {
            // console.log(index);
            var worker = new Worker('./js/w_predict.js');
            worker.addEventListener('error', (event) => {
                console.error(index + ' Worker 加载失败:', event.message);
            });
            worker.postMessage({ pfv: predictionFormValueObj, round: roundsPerWorker });
            worker.onmessage = function (event) {
                workersResults.push(event.data);
                worker.terminate();
                completedWorkers++;
                if (completedWorkers == 10) {
                    merge();
                }
            };
        }
        if (index < 10) {
            setTimeout(() => startWorkerBatch(index), 100);
        }
    }
    startWorkerBatch();
}
// console.log(navigator.hardwareConcurrency);