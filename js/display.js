//display.js
var E_ResultDisplayer = document.getElementById("ResultDisplayer");
var E_FilterResult = document.getElementById("FilterResult");

/**
 * 全局卡池选择下拉菜单
 */
var E_Form_CharacterPoolInput = document.getElementById("Form_CharacterPoolInput");
var E_MainForm = document.getElementById("MainForm");

var Pool_Options = [];
var E_Form_AdvPoolFilter = document.getElementById("Form_AdvPoolFilter");

/**
 * 第二模块的“抽取次数”
 */
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

var E_PoolInformer = document.getElementById("PoolInformer");
var E_PreForm_SupTargetDisplay = document.getElementById("PreForm_SupTargetDisplay");

/**
 * 在展示“所有记录”时，若大于this抽，则不再显示记录
 */
var MAX_GENERAL_RECORD_QUANTITY = 5000;
document.getElementById("E_MAX_GENERAL_RECORD_QUANTITY").innerHTML = MAX_GENERAL_RECORD_QUANTITY;
/**
 * 在展示“筛选记录”时，若大于this抽，则不再显示记录
 */
var MAX_FILTERED_RECORD_QUANTITY = 50000;
document.getElementById("E_MAX_FILTERED_RECORD_QUANTITY").innerHTML = MAX_FILTERED_RECORD_QUANTITY;
/**
 * 在展示“筛选记录”时，若大于this抽，则不再显示记录
 */
var MAX_ALLOWED_PULLS = 5000000;
document.getElementById("E_MAX_ALLOWED_PULLS").innerHTML = MAX_ALLOWED_PULLS;
E_Form_PullInput.setAttribute('max', MAX_ALLOWED_PULLS);


//写入今日
{
    let vm = new VersionManager();
    /**
     * 今天对应的版本对象实例
     */
    var thisVersion = vm.detectStage(TODAY, Object.values(NORMAL_VERSIONS))[0];
    document.getElementById("VersionDisplayer").innerHTML = thisVersion.durationCode + "&nbsp;&nbsp;";
}

document.getElementById("DisplayerPoolQuantity").innerHTML += "本程序记录在内的卡池总数量：<strong>" + Object.keys(TOTAL_EVENT_WARPS).length + "</strong>个。";


//当前Up角色和光锥的显示功能
var E_SPAN_CurrentSupCharacters = document.getElementById("CurrentSupCharacters");
{
    let t = getVersionSupCharacters(thisVersion.durationCode);
    for (var i = 0; i < t.length; i++) {
        E_SPAN_CurrentSupCharacters.innerHTML += "&nbsp;&nbsp;&nbsp;" + findItem(t[i]).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;";
    }
}
var E_SPAN_CurrentSupLightcones = document.getElementById("CurrentSupLightcones");
{
    let t = getVersionSupLightcones(thisVersion.durationCode);
    for (var i = 0; i < t.length; i++) {
        E_SPAN_CurrentSupLightcones.innerHTML += "&nbsp;&nbsp;&nbsp;" + findItem(t[i]).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;";
    }
}

/**
 * 刷新第二模块的物品筛选器下拉菜单，前提是OBTAINED_ITEMS有货
 */
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
    if (TOTAL_EVENT_WARPS[SELECTED_POOL_NAME]["type"] == 'character') {
        unique = [...star5C, ...star5L, ...star4C, ...star4L];
    } else {
        unique = [...star5L, ...star5C, ...star4L, ...star4C];
    }
    E_Form_CFS.innerHTML = "";
    for (var j = 0; j < unique.length; j++) {
        var opt = this.document.createElement('option');
        let code = unique[j].element;
        opt.setAttribute('value', code);
        opt.innerHTML = findItem(code).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;[x" + unique[j].duplication + "]";
        E_Form_CFS.appendChild(opt);
    }
}

/**
 * 读取抽卡模拟模块的卡池选择信息，并刷新Sup,Scommon,Rup,Rcommon的值
 * @param {Element} fromWhom - 应为select元素
 */
function applyPool(fromWhom) {
    selectPool(fromWhom.value);
}

/**
 * 如果所选的卡池对应的版本大于3.2，则展示“星缘相邀”，并填充内容
 */
function modifiedScommonVersionDetection() {
    var pool = TOTAL_EVENT_WARPS[E_Form_CharacterPoolInput.value];
    var version = VERSIONS_SET[pool.versionInfo];
    var versionMJD = version.dateStart;
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
    applyPool(E_Form_CharacterPoolInput);
    modifiedScommonVersionDetection();
});

class PoolFilter {
    TOKENS;
    LINKID;
    extractTokens() {
        this.TOKENS = [];
        const text = document.getElementById(this.LINKID);
        var i = 0;
        var token = "";
        for (; i < text.length;) {
            if (text[i] == ' ') {
                i++;
                continue;
            }
            if (text[i] == ',') {
                this.TOKENS.push(token);
                token = "";
                i++;
                continue;
            }
            token += text[i];
            i++;
        }
    }

}

/**
 * 根据当前LANGUAGE，刷新某个selector的选项
 * @param {Element} destination 
 */
function refreshPoolSelector(destination) {
    destination.innerHTML = '';
    var origin = Object.keys(TOTAL_EVENT_WARPS);
    var providedKeywords = E_Form_AdvPoolFilter.value.split(" ");
    var filteredItemInAWP = [];
    if (providedKeywords[0] != '') {
        var filteredPools = origin.filter((eachPoolCode) => providedKeywords.every((singleKeyword) => TOTAL_EVENT_WARPS[eachPoolCode].keywords.has(singleKeyword)));
        filteredItemInAWP = ALL_WARP_POOLS.filter((each) => filteredPools.includes(each.code));
        if (filteredPools.length == 0) filteredItemInAWP = ALL_WARP_POOLS;
    } else {
        filteredItemInAWP = ALL_WARP_POOLS;
    }
    for (var j = 0; j < filteredItemInAWP.length; j++) {
        // console.log("filteredItemInAWP[j]： ",j,filteredItemInAWP[j]);
        var opt = document.createElement('option');
        let cod = filteredItemInAWP[j].code;
        opt.setAttribute('value', cod);//'L2_7_4'
        let ver = VERSIONS_SET[TOTAL_EVENT_WARPS[cod].versionInfo];
        // console.log(ver)
        opt.innerHTML = /*"[" + cod + "]*/"(v" + ver.durationCode + ") - (" + ver.date + ") ------- " + filteredItemInAWP[j].upName;
        destination.appendChild(opt);
    }
}
refreshPoolSelector(E_Form_CharacterPoolInput);
E_Form_AdvPoolFilter.addEventListener('input', () => {
    refreshPoolSelector(E_Form_CharacterPoolInput);
});

function checkImageExists(path, callback) {
    const img = new Image();
    img.onload = function () {
        callback(true); // 图片存在
    };
    img.onerror = function () {
        callback(false); // 图片不存在
    };
    img.src = path;
}

/**
 * 给定rStatus和wStatus的组合对象，返回一个record元素
 * @param {object} obj - obj接收：{rStatus, wStatus}.
 * @returns 返回一个record元素
 */
function translateItemInfo(obj) {
    var record = document.createElement("div");
    record.classList.add("RecordBox");
    var element_p = translateWarpInfo(obj);

    /**
     * 抽取到的物品的对象实例
     */
    var item = findItem(obj.rStatus.codeName);

    var img = document.createElement("img");
    img.classList.add("ItemIcon");
    const icon = item.icon;
    checkImageExists(icon, function (exists) {
        if (exists) {
            img.src = item.icon; // 图片存在，设置src
        } else {
            // 图片不存在时的处理
            img.src = './img/func/unknown.png'; // 设置备用图片
        }
    });
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
    //img本身的样式
    if (item.star == 5) img.classList.add("RecordStar5");
    if (item.star == 4) img.classList.add("RecordStar4");
    if (Sup.includes(obj.rStatus.codeName)) {
        if (Number(E_Form_PullInput.value) <= MAX_FILTERED_RECORD_QUANTITY / 2) {
            img.classList.add("RecordSup");
        } else {
            img.classList.add("RecordSupSymplified");
        }
    }
    if (Scommon.includes(obj.rStatus.codeName)) img.classList.add("RecordScommon");
    img.title = item.fullName[LANGUAGE];
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

/**
 * 用于第二模块，根据OBTAINED_ITEMS中的所有信息，展示“所有记录”
 * @returns 0
 */
function showAllObtainedInfo() {
    E_ResultDisplayer.innerHTML = "";
    if (E_Form_PullInput.value > MAX_GENERAL_RECORD_QUANTITY) return 0;
    for (var i = 0; i < OBTAINED_ITEMS.length; i++) {
        showObtainedInfo(OBTAINED_ITEMS[i], E_ResultDisplayer);
    }
    return 0;
}

/**
 * 用于第二模块，展示筛选出来的记录
 * @returns 0
 */
function refreshFilterBoxDisplay() {
    var code = E_Form_CFS.value;
    E_FilterResult.innerHTML = '';
    if (E_Form_PullInput.value > MAX_FILTERED_RECORD_QUANTITY) return 0;
    var results = collectRecordsByCodeName(OBTAINED_ITEMS, code);
    for (var i = 0; i < results.length; i++) {
        showObtainedInfo(results[i], E_FilterResult);
    }
}

E_Form_CFS.addEventListener('change', function () {
    refreshFilterBoxDisplay();
})

/**
 * 用户点击“确认抽取”后，执行的函数。
 * @returns 0
 */
function applyAll() {
    if (E_Form_PullInput.value > MAX_ALLOWED_PULLS) {
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
    applyPool(E_Form_CharacterPoolInput);
    warpWithInfoFor(E_Form_PullInput.value);
    showAllObtainedInfo();
    refreshCFS();
    refreshFilterBoxDisplay();
}

/**
 * 将某个元素从一个位置移到另一个位置
 * @param {Element} card - 被移动的元素
 * @param {string} destination - 目的地元素的ID
 */
function cardMove(card, destination) {
    var origin = card.parentElement.getAttribute("id");
    var temp = card;
    document.getElementById(origin).removeChild(card);
    document.getElementById(destination).appendChild(temp);
}

/**
 * 将被点击移动的物品名移动到另一个状态区域中，并刷新对应数组included_Scommon和exluded_Scommon
 * @param {Element} card - 被点击移动的元素
 */
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

E_Form_CharacterPoolInput.addEventListener('change', function () {
    var pool = TOTAL_EVENT_WARPS[E_Form_CharacterPoolInput.value];
    var txt = findItem(pool.contents()[0][0]).fullName[LANGUAGE];
    P_Form_STD.innerHTML = '<strong class="BoldBlue">' + txt + ' </strong>X';
    E_PoolInformer.innerHTML = '<p>当前选择：<span class="BoldBlue">' + txt + '</span>卡池</p>';
    E_PreForm_SupTargetDisplay.innerHTML = '<p><span class="BoldBlue">' + txt + '</span> x</p>';
});

E_PoolInformer.innerHTML = '<p>当前选择：<span class="BoldBlue">' + findItem(TOTAL_EVENT_WARPS[E_Form_CharacterPoolInput.value].contents()[0][0]).fullName[LANGUAGE] + '</span>卡池</p>';
E_PreForm_SupTargetDisplay.innerHTML = '<p><span class="BoldBlue">' + findItem(TOTAL_EVENT_WARPS[E_Form_CharacterPoolInput.value].contents()[0][0]).fullName[LANGUAGE] + '</span> x</p>';


modifiedScommonVersionDetection();//  这个只能放在最后，否则就会报错。