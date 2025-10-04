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


var _IGE_Status = {
    selectedItemCode: null,
    selectedItemType: null, // "Character" or "LightCone"
}

function switchPage(code) {
    //清空显示
    E_IGE_ExclusiveLc.innerText = "";


    let item = findItem(code);
    E_IGE_Title.innerText = item.fullName[LANGUAGE];
    E_IGE_Illustration.src = item.artwork;
    E_IGE_Illustration_Caption.innerText = item.fullName[LANGUAGE];
    E_IGE_EnglishName.innerText = item.fullName["en"];
    E_IGE_Path.innerText = lang[LANGUAGE]._Path[item.path];
    if (isCharacter(item)) {
        E_IGE_Path.innerText += " - " + lang[LANGUAGE]._CombatType[item.combatType];
        if (item.star == 5) {
            let exlusiveLc = findItem(item.params.exclusiveLc);
            E_IGE_ExclusiveLc.innerHTML += lang[LANGUAGE].exclusive_lc + ": " + exlusiveLc.fullName[LANGUAGE];
            E_IGE_ExclusiveLc.appendChild(generateItemButton(exlusiveLc));
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
    E_IGE_Frequency.innerText = lang[LANGUAGE].ige_frequency + ": " + pools.length;
    E_IGE_Frequency_Detail.innerText = text;
}

function classifyCharacters(mode) {
    var classifiedCharacters = [];
    switch (mode) {
        case "_Path": {
            for (path in Path) {
                let thisClass = CHARACTER_CODES.toRemoved("c000").toRemoved("c001").filter(code => findItem(code).path == Path[path]);
                classifiedCharacters.push(thisClass);
            }
            break;
        }
        case "_CombatType": {
            for (ct in CombatType) {
                let thisClass = CHARACTER_CODES.toRemoved("c000").toRemoved("c001").filter(code => findItem(code).combatType == CombatType[ct]);
                classifiedCharacters.push(thisClass);
            }
            break;
        }
        case "_Party": {
            for (party in Party) {
                let thisClass = CHARACTER_CODES.toRemoved("c000").toRemoved("c001").filter(code => findItem(code).params.party == Party[party]);
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
    switch (mode) {
        case "_Path": {
            for (path in Path) {
                let thisClass = LIGHTCONE_CODES.toRemoved("l000000").filter(code => findItem(code).path == Path[path]);
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