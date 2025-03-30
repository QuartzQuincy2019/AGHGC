var E_ResultDisplayer = document.getElementById("ResultDisplayer");
var E_FilterResult = document.getElementById("FilterResult");

var E_Form_CharacterPoolInput = document.getElementById("Form_CharacterPoolInput");
var E_MainForm = document.getElementById("MainForm");
var E_Form_PullInput = document.getElementById("Form_PullInput");

var E_Form_CFS = document.getElementById("Form_CharacterFilterSelect");
function refreshCFS() {
    var names = [];
    for (var i = 0; i < OBTAINED_ITEMS.length; i++) {
        names.push(OBTAINED_ITEMS[i].rStatus.codeName);
    }
    var unique = findUnique(names);
    let star5 = [], star4 = [];
    star5 = unique.filter((code) => findCharacter(code).star == 5);
    star4 = unique.filter((code) => findCharacter(code).star == 4);
    unique = [...star5, ...star4];
    E_Form_CFS.innerHTML = "";
    for (var j = 0; j < unique.length; j++) {
        var opt = this.document.createElement('option');
        opt.setAttribute('value', unique[j]);
        opt.innerHTML = findCharacter(unique[j]).fullName[LANGUAGE];
        E_Form_CFS.appendChild(opt);
    }
}

function repull() {
    OBTAINED_ITEMS = [];
    globalInitalize();
    warpCharacterWithInfoFor(E_Form_PullInput.value);
    showAllObtainedInfo();
    refreshCFS();
}
//----------------------------------------
function selectPool(poolName) {
    if (CHARACTER_EVENT_WARPS[poolName] == undefined) return;
    Sup = deepClone(CHARACTER_EVENT_WARPS[poolName][0]);
    Scommon = deepClone(CHARACTER_EVENT_WARPS[poolName][1]);
    Rup = deepClone(CHARACTER_EVENT_WARPS[poolName][2]);
    Rcommon = deepClone(CHARACTER_EVENT_WARPS[poolName][3]);
}
function applyPool() {
    selectPool(E_Form_CharacterPoolInput.value);
}
E_Form_CharacterPoolInput.addEventListener('change', function () {
    applyPool();
});
function refreshCharacterPoolSelector() {
    for (var j = 0; j < ALL_CHARACTER_WARP_POOLS.length; j++) {
        var opt = document.createElement('option');
        opt.setAttribute('value', ALL_CHARACTER_WARP_POOLS[j].code);
        opt.innerHTML = ALL_CHARACTER_WARP_POOLS[j].code + "-----" + ALL_CHARACTER_WARP_POOLS[j].upName;
        E_Form_CharacterPoolInput.appendChild(opt);
    }
}
refreshCharacterPoolSelector();


function showObtainedInfo(obj, destination) {
    var record = document.createElement("div")
    record.classList.add("RecordBox");
    var element_p = translateWarpInfo(obj);
    var character = findCharacter(obj.rStatus.codeName);
    var img = document.createElement("img");
    img.src = character.p40;
    record.appendChild(img);
    record.appendChild(element_p);
    destination.appendChild(record);
    return 0;
}

function showAllObtainedInfo() {
    E_ResultDisplayer.innerHTML = "";
    for (var i = 0; i < OBTAINED_ITEMS.length; i++) {
        showObtainedInfo(OBTAINED_ITEMS[i], E_ResultDisplayer);
    }
    return 0;
}

function refreshFilterBoxDisplay(){
    var code = E_Form_CFS.value;
    E_FilterResult.innerHTML = '';
    var results = collectRecordsByCodeName(OBTAINED_ITEMS, code);
    for (var i = 0; i < results.length; i++) {
        showObtainedInfo(results[i], E_FilterResult);
    }
}

E_Form_CFS.addEventListener('change', function () {
    refreshFilterBoxDisplay();
})

function applyAll() {
    OBTAINED_ITEMS = [];
    applyPool();
    repull();
    refreshCFS();
    refreshFilterBoxDisplay();
}