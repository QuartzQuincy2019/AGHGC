// ige_sidebar.js

function toggleSideBarLayout() {
    if (window.innerWidth <= 768) {//移动端
        E_SideBar.style.display = "none";
        E_SideBarButton.style.display = "block";//显示按钮
    } else {//非移动端
        E_SideBar.style.display = "block";
        E_SideBarButton.style.display = "none";//隐藏按钮
    }
}
toggleSideBarLayout();

function hasSideBar() {
    if (E_SideBar.style.display === "none") {
        return false;
    } else {
        return true;
    }
}

function toggleSideBar() {
    if (window.innerWidth > 768) return;
    if (hasSideBar()) {//若有，则隐藏
        E_SideBar.style.display = "none";//隐藏侧边栏
        E_SideBarButton.innerHTML = "&#9776;";
    } else {
        E_SideBar.style.display = "block";//显示侧边栏
        E_SideBarButton.innerHTML = "&#10005;";
    }
}
toggleSideBar(); toggleSideBar();

E_SideBarButton.onclick = () => {
    console.log('SideBar button clicked');
    toggleSideBar();
}

window.addEventListener('resize', function () {
    toggleSideBarLayout(); toggleSideBar(); toggleSideBar();
});

function generateItemButton(item) {
    var div = document.createElement('div');
    div.classList.add('SidebarItem','InlineItem');
    if (item.star == 4) div.classList.add("Star4Item");
    if (item.star == 5) div.classList.add("Star5Item");
    let img = document.createElement('img');
    img.src = item.icon;
    div.appendChild(img);
    div.onclick = () => {
        _IGE_Status.selectedItemCode = item.code;
        if (isCharacter(item)) {
            _IGE_Status.selectedItemType = "Character";
        } else if (isLightcone(item)) {
            _IGE_Status.selectedItemType = "LightCone";
        }
        switchPage(item.code);
    }
    return div;
}

//E_IGE_Sidebar_Characters
function fillItemArea(classificationObj, itemArea) {
    itemArea.innerHTML = "";//清空
    for (let i = 0; i < classificationObj.classified.length; i++) {
        var itemGroup = document.createElement('div');
        itemGroup.classList.add('SidebarItemGroup');
        var itemGroupTitle = document.createElement('div');
        itemGroupTitle.classList.add('SidebarItemGroupTitle');
        itemGroupTitle.innerText = lang[LANGUAGE][classificationObj.standard][i];//分类标题
        itemGroup.appendChild(itemGroupTitle);
        itemGroup.appendChild(document.createElement('hr'));
        var gridArea = document.createElement('div');
        gridArea.classList.add('SidebarItemGrid');
        for (let j = 0; j < classificationObj.classified[i].length; j++) {
            const thisItem = findItem(classificationObj.classified[i][j]);
            let gridItem = document.createElement('div');
            gridItem.title = thisItem.fullName[LANGUAGE] + " (" + lang[LANGUAGE]._Path[thisItem.path] + ")";
            gridItem.classList.add('SidebarItem');
            gridItem.onclick = () => {
                _IGE_Status.selectedItemCode = thisItem.code;
                if (isCharacter(thisItem)) {
                    _IGE_Status.selectedItemType = "Character";
                } else if (isLightcone(thisItem)) {
                    _IGE_Status.selectedItemType = "LightCone";
                }
                switchPage(thisItem.code);
            }
            if (thisItem.star == 4) gridItem.classList.add("Star4Item");
            if (thisItem.star == 5) gridItem.classList.add("Star5Item");
            let img = document.createElement('img');
            img.src = thisItem.icon;
            gridItem.appendChild(img);
            gridArea.appendChild(gridItem);
        }
        itemGroup.appendChild(gridArea);
        itemArea.appendChild(itemGroup);
    }
}
fillItemArea(classifyCharacters("_Party"), E_IGE_Sidebar_Characters);
fillItemArea(classifyLightcones("_Path"), E_IGE_Sidebar_Lightcones);

function sidebarCharacterReclassify() {
    let select = document.getElementById("CharacterReclassify");
    let classification = select.value;
    fillItemArea(classifyCharacters(classification), E_IGE_Sidebar_Characters);
}