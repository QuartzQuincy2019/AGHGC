// M4.js
var E_M4_C_5G_Input = document.getElementById('M4_C_5G_Input');
var E_M4_C_Count_Input = document.getElementById('M4_C_Count_Input');
var E_M4_L_5G_Input = document.getElementById('M4_L_5G_Input');
var E_M4_L_Count_Input = document.getElementById('M4_L_Count_Input');
var E_M4_C_Qty_Input = document.getElementById('M4_C_Qty_Input');
var E_M4_L_Qty_Input = document.getElementById('M4_L_Qty_Input');
var E_M4_Strategy_Input = document.getElementById('M4_Strategy_Input');
var E_M4_Investment = document.getElementById('M4_Investment');

var E_M4_Result = document.getElementById('M4_Result');

function getM4Status() {
    function parseBool(val) {
        return val == 1 ? true : false;
    }
    var CharacterStatus = new WarpStatus(
        false, parseBool(Number(E_M4_C_5G_Input.value)),
        0,
        Number(E_M4_C_Count_Input.value),
        0
    );
    var LightconeStatus = new WarpStatus(
        false, parseBool(Number(E_M4_L_5G_Input.value)),
        0,
        Number(E_M4_L_Count_Input.value),
        0
    );
    return {
        CharacterStatus: CharacterStatus,
        LightconeStatus: LightconeStatus,
        Strategy: Number(E_M4_Strategy_Input.value),
        Investment: Number(E_M4_Investment.value),
        TargetCQty: Number(E_M4_C_Qty_Input.value),
        TargetLQty: Number(E_M4_L_Qty_Input.value)
    }
}

function executeM4() {
    var workersResults = [];
    var completedWorkers = 0;
    var sum = 0;
    E_M4_Result.innerHTML = "计算中，请稍候...";

    startWorkerBatch();
    function merge() {
        return workersResults.reduce((acc, cur) => acc + cur, 0);
    }

    function startWorkerBatch(index = 0) {
        var batchSize = 1;
        var CS = deepClone(getM4Status().CharacterStatus);
        var LS = deepClone(getM4Status().LightconeStatus);
        var Inv = deepClone(getM4Status().Investment);
        for (let i = 0; i < batchSize && index < MAX_WORKERS; i++, index++) {
            // console.log(index);
            var worker = new Worker('./js/M4_Worker.js');
            worker.addEventListener('error', (event) => {
                console.error(index + ' Worker 加载失败:', event.message);
            });
            worker.postMessage({
                CharacterStatus: CS,
                LightconeStatus: LS,
                Strategy: getM4Status().Strategy,
                Investment: Inv,
                TargetCQty: deepClone(getM4Status().TargetCQty),
                TargetLQty: deepClone(getM4Status().TargetLQty),
                SimulationTimes: SIMULATION_TIMES,
                BatchIndex: index
            });
            worker.onmessage = function (event) {
                workersResults.push(event.data);
                worker.terminate();
                completedWorkers++;
                console.log(completedWorkers + '/' + MAX_WORKERS + ' Worker 完成计算:', event.data);
                if (completedWorkers == MAX_WORKERS) {
                    sum = merge();
                    E_M4_Result.innerHTML = "计算完成，概率约<span class='BoldBlue'> " + (sum / (SIMULATION_TIMES * MAX_WORKERS) * 100).toFixed(1) + "%</span>";
                }
            };
        }
        if (index < MAX_WORKERS) {
            setTimeout(() => startWorkerBatch(index), 200);
        }
    }
    return sum;
}
// console.log(navigator.hardwareConcurrency);