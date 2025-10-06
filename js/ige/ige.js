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

var E_IGE_Title_Media = document.getElementById("IGE_Title_Media");
var E_IGE_Profile = document.getElementById('IGE_Profile');
var E_IGE_Splash = document.getElementById("IGE_Splash");
var E_IGE_Portrait = document.getElementById('IGE_Portrait');

var _IGE_Status = {
    selectedItemCode: null
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

function generateItemButton(item) {
    var div = document.createElement('div');
    div.classList.add('SidebarItem', 'InlineItem');
    div.title = item.fullName[LANGUAGE];
    if (item.star == 4) div.classList.add("Star4Item");
    if (item.star == 5) div.classList.add("Star5Item");
    let img = document.createElement('img');
    img.src = item.icon;
    checkImageExists(img.src, (exists) => {//检查图片是否存在，不存在则替换为默认图片
        if (!exists) {
            img.src = "img/func/unknown.png";
            div.title += "\u000a图片加载失败、不存在或丢失";
        }
    });
    div.appendChild(img);
    if (item.params.type == "placeholder") {//若item是占位符，则不赋予点击事件
        return div;
    }
    div.onclick = () => {
        _IGE_Status.selectedItemCode = item.code;
        switchPage(item.code);
    }
    return div;
}

function switchPage(code) {
    //清空显示
    E_IGE_ExclusiveLc.innerHTML = "";
    //大图区域
    E_IGE_Illustration_Caption.innerText = "";
    E_IGE_Path.innerText = "";
    E_IGE_InnerCode.innerText = "";
    E_IGE_EnglishName.innerText = "";
    //频率区域
    E_IGE_Frequency.innerText = "";
    E_IGE_Timer.innerHTML = "";
    E_IGE_Frequency_Detail.innerHTML = "";
    //媒体区域
    E_IGE_Title_Media.innerText = "";
    E_IGE_Profile.src = "";
    E_IGE_Portrait.src = "";
    E_IGE_Splash.src = "";
    //填充显示
    let item = findItem(code);
    if (isCharacter(item)) {
        E_IGE_Path.innerText = lang[LANGUAGE]._Path[item.path] + " - " + lang[LANGUAGE]._CombatType[item.combatType];
        E_IGE_Portrait.src = item.portrait;
        checkImageExists(E_IGE_Portrait.src, (exists) => {
            if (!exists) {
                E_IGE_Portrait.style.display = "none";
            }else{
                E_IGE_Portrait.style.display = "inline-block";
            }
        });
        E_IGE_Splash.src = item.artwork;
        if (item.star == 5) {
            if (item.params.exclusiveLc) {
                let exclusiveLc = findItem(item.params.exclusiveLc);
                E_IGE_ExclusiveLc.innerHTML += lang[LANGUAGE].exclusive_lc + ": <span class='BoldBlue'>" + exclusiveLc.fullName[LANGUAGE] + "</span>";
                E_IGE_ExclusiveLc.appendChild(generateItemButton(exclusiveLc));
            }
            E_IGE_Profile.src = item.profile;
            checkImageExists(E_IGE_Profile.src, (exists) => {
                if (!exists) {
                    E_IGE_Profile.style.display = "none";
                }else{
                    E_IGE_Profile.style.display = "inline-block";
                }
            });
        }
        E_IGE_Title_Media.innerHTML = lang[LANGUAGE].media;
    }
    if (isLightcone(item)) {
        E_IGE_Path.innerText = lang[LANGUAGE]._Path[item.path];
        if (item.star == 5) {
            let exclusiveCh = findItem(findExclusiveCharacterCode(item.code));
            if (exclusiveCh != null) {
                E_IGE_ExclusiveLc.innerHTML += lang[LANGUAGE].exclusive_ch + ": <span class='BoldBlue'>" + exclusiveCh.fullName[LANGUAGE] + "</span>";
                E_IGE_ExclusiveLc.appendChild(generateItemButton(exclusiveCh));
            }
        }
    }
    var pools = [];
    for (pool in TOTAL_EVENT_WARPS) {
        if (TOTAL_EVENT_WARPS[pool].contents()[0][0] == code || TOTAL_EVENT_WARPS[pool].contents()[2].includes(code)) {
            pools.push(TOTAL_EVENT_WARPS[pool]);
        }
    }
    for (var i = 0; i < pools.length; i++) {
        let li = document.createElement("li");
        li.innerHTML += pools[i].getInfo();
        li.appendChild(generateItemButton(findItem(pools[i].contents()[0][0])));
        li.appendChild(generateItemButton(findItem(pools[i].contents()[2][0])));
        li.appendChild(generateItemButton(findItem(pools[i].contents()[2][1])));
        li.appendChild(generateItemButton(findItem(pools[i].contents()[2][2])));
        E_IGE_Frequency_Detail.append(li);
    }
    if (pools.length > 0) {
        for (pool of pools) {
            if (pool.code == "C3_4_A-1" || pool.code == "C3_4_A-2" || pool.code == "L3_4_A-1" || pool.code == "L3_4_A-2") {
                continue;
            }
            if (ofPeriod(TODAY, pool.getFirstDateMjd(), pool.getLastDateMjd()) < 1) {
                E_IGE_Timer.innerHTML = "";
                break;
            }
            if (ofPeriod(TODAY, pool.getFirstDateMjd(), pool.getLastDateMjd()) == 1) {
                let diff = TODAY - pool.getLastDateMjd();
                //上次复刻天数
                E_IGE_Timer.innerHTML = lang[LANGUAGE].lastRerun + ": <span class='BoldBlue'>" + diff + "</span> " + lang[LANGUAGE].daysAgo;
                break;
            }
        }
    }
    E_IGE_Frequency.innerText = lang[LANGUAGE].ige_frequency + ": " + pools.length;
    E_IGE_Title.innerText = item.fullName[LANGUAGE];
    E_IGE_Illustration.src = item.artwork;
    E_IGE_Illustration_Caption.innerText = item.fullName[LANGUAGE];
    E_IGE_EnglishName.innerText = item.fullName["en"];
    E_IGE_InnerCode.innerText = item.code;
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
    var removedLightcones = LIGHTCONE_CODES.toRemoved("l000000").toRemoved("NOTAVAI");
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
    switchPage(code);
}