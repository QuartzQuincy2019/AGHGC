//display.js
var E_ResultDisplayer = document.getElementById("ResultDisplayer");
var E_FilterResult = document.getElementById("FilterResult");

var E_Form_CharacterPoolInput = document.getElementById("Form_CharacterPoolInput");
var E_MainForm = document.getElementById("MainForm");
var E_Form_PullInput = document.getElementById("Form_PullInput");

var E_Form_CFS = document.getElementById("Form_CharacterFilterSelect");
var P_Form_PFS = document.getElementById("PreForm_PoolInput");

/**
 * 即\<p id="PreForm_SupTargetDisplay">//Sup//\</p>
 */
var P_Form_STD = document.getElementById("PreForm_SupTargetDisplay");
var P_Form_PredictionTableArea = document.getElementById("PredictionTableArea");

function refreshCFS() {
    var names = [];
    for (var i = 0; i < OBTAINED_ITEMS.length; i++) {
        names.push(OBTAINED_ITEMS[i].rStatus.codeName);
    }
    var unique = findUniqueWithCount(names);
    let star5C = [], star4C = [], star5L = [], star4L = [];
    star5C = unique.filter((ele) => findItem(ele.element).star == 5 && findItem(ele.element) instanceof Character);
    star4C = unique.filter((ele) => findItem(ele.element).star == 4 && findItem(ele.element) instanceof Character);
    star5L = unique.filter((ele) => findItem(ele.element).star == 5 && findItem(ele.element) instanceof Lightcone);
    star4L = unique.filter((ele) => findItem(ele.element).star == 4 && findItem(ele.element) instanceof Lightcone);
    unique = [...star5C, ...star4C, ...star5L, ...star4L];
    E_Form_CFS.innerHTML = "";
    for (var j = 0; j < unique.length; j++) {
        var opt = this.document.createElement('option');
        let code = unique[j].element;
        opt.setAttribute('value', code);
        opt.innerHTML = findItem(code).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;[x" + unique[j].duplication + "]";
        E_Form_CFS.appendChild(opt);
    }
}

function repull() {
    OBTAINED_ITEMS = [];
    globalInitalize(GLOBAL_WARP_STATUS);
    warpWithInfoFor(E_Form_PullInput.value);
    showAllObtainedInfo();
    refreshCFS();
}
//----------------------------------------
function applyPool() {
    selectPool(E_Form_CharacterPoolInput.value);
}
E_Form_CharacterPoolInput.addEventListener('change', function () {
    applyPool();
});
function refreshPoolSelector(destination) {
    for (var j = 0; j < ALL_WARP_POOLS.length; j++) {
        var opt = document.createElement('option');
        opt.setAttribute('value', ALL_WARP_POOLS[j].code);
        opt.innerHTML = ALL_WARP_POOLS[j].code + "-----" + ALL_WARP_POOLS[j].upName;
        destination.appendChild(opt);
    }
}
refreshPoolSelector(E_Form_CharacterPoolInput);

/**
 * obj接收：rStatus, wStatus
 */
function translateItemInfo(obj){
    var record = document.createElement("div");
    record.classList.add("RecordBox");
    var element_p = translateWarpInfo(obj);
    var item = findItem(obj.rStatus.codeName);
    var img = document.createElement("img");
    img.classList.add("ItemIcon");
    img.src = item.icon;
    var rightDiv = document.createElement("div");
    rightDiv.classList.add("RightColumn");
    var upDiv = document.createElement("div");
    upDiv.classList.add("MiniIcon");
    let img_path = document.createElement("img");
    img_path.src = './img/i16/p_' + item.path + '.png';
    upDiv.appendChild(img_path);
    if(getItemType(item)!='Lightcone'){
        let img_ct = document.createElement("img");
        img_ct.src = './img/i16/ct_' + item.combatType + '.png';
        upDiv.appendChild(img_ct);
    }
    if(Sup.includes(obj.rStatus.codeName)){
        record.classList.add("Target");
    }
    rightDiv.appendChild(upDiv);
    rightDiv.appendChild(element_p);
    record.appendChild(img);
    record.appendChild(rightDiv);
    return record;
}

function showObtainedInfo(obj, destination) {
    destination.appendChild(translateItemInfo(obj));
    return 0;
}

function showAllObtainedInfo() {
    E_ResultDisplayer.innerHTML = "";
    if (E_Form_PullInput.value > 10000) return 0;
    for (var i = 0; i < OBTAINED_ITEMS.length; i++) {
        showObtainedInfo(OBTAINED_ITEMS[i], E_ResultDisplayer);
    }
    return 0;
}

function refreshFilterBoxDisplay() {
    var code = E_Form_CFS.value;
    E_FilterResult.innerHTML = '';
    if (E_Form_PullInput.value > 100000) return 0;
    var results = collectRecordsByCodeName(OBTAINED_ITEMS, code);
    for (var i = 0; i < results.length; i++) {
        showObtainedInfo(results[i], E_FilterResult);
    }
}

E_Form_CFS.addEventListener('change', function () {
    refreshFilterBoxDisplay();
})

function applyAll() {
    if (E_Form_PullInput.value > 5000000){
        alert("“抽取总次数”大于允许的最大值！");
        return -1;
    };
    OBTAINED_ITEMS = [];
    applyPool();
    repull();
    refreshCFS();
    refreshFilterBoxDisplay();
}

P_Form_PFS.addEventListener('change',function(){
    var pool = TOTAL_EVENT_WARPS[P_Form_PFS.value];
    var txt=findItem(pool[0][0]).fullName[LANGUAGE];
    P_Form_STD.innerHTML='<strong>'+txt+' x</strong>'
})