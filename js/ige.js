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

var _IGE_Status = {
    selectedItemCode: null,
    selectedItemType: null, // "Character" or "LightCone"
}

function switchPage(code) {
    let item = findItem(code);
    E_IGE_Title.innerText = item.fullName[LANGUAGE];
    E_IGE_Illustration.src = item.artwork;
    E_IGE_Illustration_Caption.innerText = item.fullName[LANGUAGE];
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