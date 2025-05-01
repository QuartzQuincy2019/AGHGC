//display.js
var E_ResultDisplayer = document.getElementById("ResultDisplayer");
var E_FilterResult = document.getElementById("FilterResult");

var E_Form_CharacterPoolInput = document.getElementById("Form_CharacterPoolInput");
var E_MainForm = document.getElementById("MainForm");
var E_Form_PullInput = document.getElementById("Form_PullInput");

/**
 * 即第二模块“是否5星大保底（是：1；否：0）”后的input
 */
var E_Form_GuaranteeInput = document.getElementById("Form_GuaranteeInput");
/**
 * 即第二模块“是否4星大保底（是：1；否：0）”后的input
 */
var E_Form_4StarGuaranteeInput = document.getElementById("Form_4StarGuaranteeInput");
/**
 * 即第二模块“已多少抽未出5星（若上一抽是5星，则为0，以此类推）”之后的input
 */
var E_Form_SCountInput = document.getElementById("Form_SCountInput");
/**
 * 即第二模块“已多少抽未出4星（若上一抽是5星，则为0，以此类推）”之后的input
 */
var E_Form_RCountInput = document.getElementById("Form_RCountInput");

/**
 * 第二模块的Form_CharacterFilterSelect筛选器下拉菜单
 */
var E_Form_CFS = document.getElementById("Form_CharacterFilterSelect");

/**
 * 第一模块的卡池下拉菜单
 */
var P_Form_PFS = document.getElementById("PreForm_PoolInput");

/**
 * 即\<p id="PreForm_SupTargetDisplay">//Sup//\</p>
 */
var P_Form_STD = document.getElementById("PreForm_SupTargetDisplay");
var P_Form_PredictionTableArea = document.getElementById("PredictionTableArea");

/**
 * 五星常驻自选
 */
var E_ScommonSelector = document.getElementById("ScommonSelector");

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
    unique = [...star5C, ...star5L, ...star4C, ...star4L];
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
    warpWithInfoFor(E_Form_PullInput.value);
    showAllObtainedInfo();
    refreshCFS();
}
//----------------------------------------

/**
 * 读取抽卡模拟模块的卡池选择信息，并刷新Sup,Scommon,Rup,Rcommon的值
 */
function applyPool() {
    // console.log("SelectPool之前的include:\n" + included_Scommon + "\nScommon:" + Scommon);
    selectPool(E_Form_CharacterPoolInput.value);
    // console.log("SelectPool之后的include:\n" + included_Scommon + "\nScommon:" + Scommon);
}

function modifiedScommonVersionDetection() {
    var pool = TOTAL_EVENT_WARPS[E_Form_CharacterPoolInput.value];
    var version = OFFICIAL_VERSIONS[pool["versionInfo"]];
    var versionMJD = version.dateMJD;
    // console.log("modifiedScommonVersionDetection(): \n调整前：", excluded_Scommon, included_Scommon);
    if (versionMJD >= 60774) {//版本号日期在3.2之后的情况
        E_ScommonSelector.style.display = "";
        document.getElementById("ScommonSelector_Inclusion").innerHTML = "";
        document.getElementById("ScommonSelector_Exclusion").innerHTML = "";
        for (var i = 0; i < included_Scommon.length; i++) {
            let member = document.createElement("div");
            member.innerHTML = findItem(included_Scommon[i]).fullName[LANGUAGE];
            member.title = "点击可切换该成员位置";
            member.classList.add("card");
            member["data-namecode"] = included_Scommon[i];
            member.onclick = function () {
                moveInclusion(this);
            }
            document.getElementById("ScommonSelector_Inclusion").appendChild(member);
        }
        for (var i = 0; i < excluded_Scommon.length; i++) {
            let member = document.createElement("div");
            member.innerHTML = findItem(excluded_Scommon[i]).fullName[LANGUAGE];
            member.title = "点击可切换该成员位置";
            member.classList.add("card");
            member["data-namecode"] = excluded_Scommon[i];
            member.onclick = function () {
                moveInclusion(this);
            }
            document.getElementById("ScommonSelector_Exclusion").appendChild(member);
        }
    } else {
        E_ScommonSelector.style.display = "none";
        excluded_Scommon = ['blad', 'fxua', 'seel'];
        included_Scommon = ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'];
    }
    // console.log("modifiedScommonVersionDetection(): \n调整后：",excluded_Scommon,included_Scommon);
}
E_Form_CharacterPoolInput.addEventListener('change', function () {
    applyPool();
    modifiedScommonVersionDetection();
});

/**
 * 根据当前LANGUAGE，刷新某个selector的选项
 * @param {Element} destination 
 */
function refreshPoolSelector(destination) {
    destination.innerHTML = '';
    for (var j = 0; j < ALL_WARP_POOLS.length; j++) {
        var opt = document.createElement('option');
        opt.setAttribute('value', ALL_WARP_POOLS[j].code);
        let cod = ALL_WARP_POOLS[j].code;
        let ver = OFFICIAL_VERSIONS[TOTAL_EVENT_WARPS[cod].versionInfo];
        opt.innerHTML = "[" + cod + "] (v" + ver.versionCode + ":#" + ver.session + ")@" + ver.date + "-----" + ALL_WARP_POOLS[j].upName;
        destination.appendChild(opt);
    }
}
refreshPoolSelector(E_Form_CharacterPoolInput);

/**
 * 给定rStatus和wStatus的组合对象，返回一个record元素
 * @param {object} obj - obj接收：{rStatus, wStatus}.
 * @returns 返回一个record元素
 */
function translateItemInfo(obj) {
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
    if (getItemType(item) != 'Lightcone') {
        let img_ct = document.createElement("img");
        img_ct.src = './img/i16/ct_' + item.combatType + '.png';
        upDiv.appendChild(img_ct);
    }
    if (Sup.includes(obj.rStatus.codeName)) {
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

/**
 * 刷新筛选器
 * @returns 
 */
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
    if (E_Form_PullInput.value > 5000000) {
        alert("“抽取总次数”大于允许的最大值！");
        return -1;
    };
    GLOBAL_WARP_STATUS.initialize();
    isRupObtained = E_Form_4StarGuaranteeInput.value == 1 ? true : false;
    isSupObtained = E_Form_GuaranteeInput.value == 1 ? true : false;
    RGuaranteeCounter = E_Form_RCountInput.value;
    SGuaranteeCounter = E_Form_SCountInput.value;
    totalWarps = 0;
    GLOBAL_WARP_STATUS.RupSwitch = isRupObtained;
    GLOBAL_WARP_STATUS.SupSwitch = isSupObtained;
    GLOBAL_WARP_STATUS.RCount = RGuaranteeCounter;
    GLOBAL_WARP_STATUS.SCount = SGuaranteeCounter;
    GLOBAL_WARP_STATUS.total = totalWarps;
    OBTAINED_ITEMS = [];
    applyPool();
    repull();
    refreshCFS();
    refreshFilterBoxDisplay();
}

/**
 * 
 * @param {Element} card - 被移动的元素
 * @param {string} destination - 目的地元素的ID
 */
function cardMove(card, destination) {
    var origin = card.parentElement.getAttribute("id");
    var temp = card;
    document.getElementById(origin).removeChild(card);
    document.getElementById(destination).appendChild(temp);
}

function moveInclusion(card) {
    var code = card["data-namecode"];
    var E_in_id = "ScommonSelector_Inclusion";
    var E_ex_id = "ScommonSelector_Exclusion";
    if (card.parentElement.getAttribute("id") == E_in_id) {
        let dest = E_ex_id;
        cardMove(card, dest);
        included_Scommon.deleteElement(code);
        excluded_Scommon.push(code);
    } else if (card.parentElement.getAttribute("id") == E_ex_id) {
        let dest = E_in_id;
        cardMove(card, dest);
        excluded_Scommon.deleteElement(code);
        included_Scommon.push(code);
    }
}

P_Form_PFS.addEventListener('change', function () {
    var pool = TOTAL_EVENT_WARPS[P_Form_PFS.value];
    var txt = findItem(pool["contents"][0][0]).fullName[LANGUAGE];
    P_Form_STD.innerHTML = '<strong class="BoldBlue">' + txt + ' </strong>X'
})


modifiedScommonVersionDetection();//  这个只能放在最后，否则就会报错。