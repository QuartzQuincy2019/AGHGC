// predict.js
var testMaximum = 10000;
refreshPoolSelector(document.getElementById("PreForm_PoolInput"));
function getPredictionFormValue(){
    var pool = document.getElementById("PreForm_PoolInput").value;
    var gua5 = document.getElementById("PreForm_GuaranteeInput").value;
    if(gua5==1) gua5=true;
    if(gua5==0) gua5=false;
    var SCounter = document.getElementById("PreForm_SCountInput").value;
    var pull = document.getElementById("PreForm_PullInput").value;
    var SupNumber = document.getElementById("PreForm_SupInput").value;
    return {
        selectedPool: pool,
        isGuaranteed: gua5,
        SCount: SCounter,
        pulls: pull,
        targetQty: SupNumber
    };
}

function startPrediction(predictionFormValueObj){
    OBTAINED_ITEMS = [];
    function innerReset(){
        globalInitalize();
        selectPool(predictionFormValueObj.selectedPool);
        isRupObtained=false;
        isSupObtained=predictionFormValueObj.isGuaranteed;
        RGuaranteeCounter=0;
        SGuaranteeCounter=predictionFormValueObj.SCount;
        GLOBAL_WARP_STATUS.RupSwitch = isRupObtained;
        GLOBAL_WARP_STATUS.SupSwitch = isSupObtained;
        GLOBAL_WARP_STATUS.RCount = RGuaranteeCounter;
        GLOBAL_WARP_STATUS.SCount = SGuaranteeCounter;
        GLOBAL_WARP_STATUS.total = totalWarps;
    }
    innerReset();
    var targetSupQuantity = predictionFormValueObj.targetQty;
    for(var testSequence = 1;testSequence<testMaximum+1;testSequence++){
        warpWithInfoFor(predictionFormValueObj.pulls);
        //开始处理数据

        //数据处理结束，重置，然后进行下一次模拟
        innerReset();
    }
}