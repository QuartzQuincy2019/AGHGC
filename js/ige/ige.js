// ige.js

var E_SideBarButton = document.getElementById('SideBarButton');
var E_SideBar = document.getElementById('SideBar');
var E_IGE_Sidebar_Characters = document.getElementById('IGE_Sidebar_Characters');
var E_IGE_Sidebar_Lightcones = document.getElementById('IGE_Sidebar_Lightcones');

var E_IGE_Title = document.getElementById('IGE_Title');
var E_IGE_Illustration = document.getElementById('IGE_Illustration');
var E_IGE_Frequency = document.getElementById('IGE_Frequency');
var E_IGE_Frequency_Detail = document.getElementById('IGE_Frequency_Detail');
var E_IGE_Illustration_Caption = document.getElementById('IGE_Illustration_Caption');
var E_IGE_ExclusiveLc = document.getElementById('IGE_ExclusiveLc');
var E_IGE_EnglishName = document.getElementById('IGE_EnglishName');
var E_IGE_Path = document.getElementById('IGE_Path');
var E_IGE_InnerCode = document.getElementById('IGE_InnerCode');
var E_IGE_Timer = document.getElementById('IGE_Timer');


var _IGE_Status = {
    selectedItemCode: null,
    selectedItemType: null, // "Character" or "LightCone"
}

function calculateRerun() {
    var rerunCalculations = [];
    for (itemCode of ALL_ITEM_CODES.toRemoved("c000").toRemoved("c001").toRemoved("marH").toRemoved("l000000")) {
        var targetPool = null;
        for (pool in TOTAL_EVENT_WARPS) {
            if (TOTAL_EVENT_WARPS[pool].contents()[0][0] == itemCode || TOTAL_EVENT_WARPS[pool].contents()[2].includes(itemCode)) {
                targetPool = TOTAL_EVENT_WARPS[pool];//最近一次卡池
                break;
            }
        }
        if (targetPool == null) {
            rerunCalculations.push({
                code: itemCode,
                lastRerun: -1//不存在卡池
            });
            continue;
        }
        if (targetPool.getLastDateMjd() < TODAY) {
            rerunCalculations.push({
                code: itemCode,
                lastRerun: targetPool.getLastDateMjd()
            });
        } else {
            rerunCalculations.push({
                code: itemCode,
                lastRerun: 0//尚未到来或正在复刻
            });
        }
    }
    return rerunCalculations.sort((pre, next) => next.lastRerun - pre.lastRerun);
}

function switchPage(code) {
    //清空显示
    E_IGE_ExclusiveLc.innerHTML = "";
    E_IGE_Timer.innerHTML = "";


    let item = findItem(code);
    E_IGE_Title.innerText = item.fullName[LANGUAGE];
    E_IGE_Illustration.src = item.artwork;
    E_IGE_Illustration_Caption.innerText = item.fullName[LANGUAGE];
    E_IGE_EnglishName.innerText = item.fullName["en"];
    E_IGE_Path.innerText = lang[LANGUAGE]._Path[item.path];
    if (isCharacter(item)) {
        E_IGE_Path.innerText += " - " + lang[LANGUAGE]._CombatType[item.combatType];
        if (item.star == 5) {
            let exclusiveLc = findItem(item.params.exclusiveLc);
            E_IGE_ExclusiveLc.innerHTML += lang[LANGUAGE].exclusive_lc + ": <span class='BoldBlue'>" + exclusiveLc.fullName[LANGUAGE] + "</span>";
            E_IGE_ExclusiveLc.appendChild(generateItemButton(exclusiveLc));
        }
    }
    if (isLightcone(item)) {
        if (item.star == 5) {
            let exclusiveCh;
            for (characterCode of CHARACTER_CODES) {
                if (findItem(characterCode).params.exclusiveLc == item.code) {
                    exclusiveCh = findItem(characterCode);
                }
            }
            E_IGE_ExclusiveLc.innerHTML += lang[LANGUAGE].exclusive_ch + ": <span class='BoldBlue'>" + exclusiveCh.fullName[LANGUAGE] + "</span>";
            E_IGE_ExclusiveLc.appendChild(generateItemButton(exclusiveCh));
        }
    }
    E_IGE_InnerCode.innerText = item.code;
    var pools = [];
    for (pool in TOTAL_EVENT_WARPS) {
        if (TOTAL_EVENT_WARPS[pool].contents()[0][0] == code || TOTAL_EVENT_WARPS[pool].contents()[2].includes(code)) {
            pools.push(TOTAL_EVENT_WARPS[pool]);
        }
    }
    let text = "";
    for (var i = 0; i < pools.length; i++) {
        text += pools[i].getInfo() + " \n";
    }
    if (pools.length > 0) {
        for (pool of pools) {
            if (pool.getLastDateMjd() < TODAY) {
                let diff = TODAY - pool.getLastDateMjd();
                E_IGE_Timer.innerHTML = lang[LANGUAGE].lastRerun + ": <span class='BoldBlue'>" + diff + "</span> " + lang[LANGUAGE].daysAgo;
                break;
            }
        }
    }
    E_IGE_Frequency.innerText = lang[LANGUAGE].ige_frequency + ": " + pools.length;
    E_IGE_Frequency_Detail.innerText = text;
}

function classifyCharacters(mode) {
    var classifiedCharacters = [];
    var removedCharacters = CHARACTER_CODES.toRemoved("c000").toRemoved("c001").toRemoved("marH");
    switch (mode) {
        case "_Path": {
            for (path in Path) {
                let thisClass = removedCharacters.filter(code => findItem(code).path == Path[path]);
                classifiedCharacters.push(thisClass);
            }
            break;
        }
        case "_CombatType": {
            for (ct in CombatType) {
                let thisClass = removedCharacters.filter(code => findItem(code).combatType == CombatType[ct]);
                classifiedCharacters.push(thisClass);
            }
            break;
        }
        case "_Party": {
            for (party in Party) {
                let thisClass = removedCharacters.filter(code => findItem(code).params.party == Party[party]);
                classifiedCharacters.push(thisClass);
            }
            break;
        }
        default: throw new Error("Unknown classify mode: " + mode);
    }
    return {
        classified: classifiedCharacters,
        standard: mode
    };//分类对象
}

function classifyLightcones(mode) {
    var classifiedLightcones = [];
    var removedLightcones = LIGHTCONE_CODES.toRemoved("l000000");
    switch (mode) {
        case "_Path": {
            for (path in Path) {
                let thisClass = removedLightcones.filter(code => findItem(code).path == Path[path]);
                classifiedLightcones.push(thisClass);
            }
            break;
        }
        default: throw new Error("Unknown classify mode: " + mode);
    }
    return {
        classified: classifiedLightcones,
        standard: mode
    };//分类对象
}

function switchIgeLanguage() {
    if (LANGUAGE == "zh-CN") {
        LANGUAGE = "en"
    } else if (LANGUAGE == "en") {
        LANGUAGE = "jp";
    } else if (LANGUAGE == "jp") {
        LANGUAGE = "zh-CN";
    }
    sidebarCharacterReclassify();
    fillItemArea(classifyLightcones("_Path"), E_IGE_Sidebar_Lightcones);
    let code = _IGE_Status.selectedItemCode;
    let type = "";
    if (isCharacter(findItem(code))) type = "Character";
    if (isLightcone(findItem(code))) type = "LightCone";
    switchPage(_IGE_Status.selectedItemCode);
}