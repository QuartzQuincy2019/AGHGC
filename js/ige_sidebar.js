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
    toggleSideBarLayout();
});

//E_IGE_Sidebar_Characters
function fillItemArea(database, itemArea) {
    itemArea.innerHTML = "";//清空
    for (let i = 0; i < database.length; i++) {
        if (database[i].params.type === "placeholder") continue;
        let item = document.createElement('div');
        item.title = database[i].fullName[LANGUAGE] + " (" + lang[LANGUAGE]._Path[database[i].path] + ")";
        item.classList.add('SidebarItem');
        item.onclick = () => {
            _IGE_Status.selectedItemCode = database[i].code;
            if (isCharacter(database[i])) {
                _IGE_Status.selectedItemType = "Character";
            } else if (isLightcone(database[i])) {
                _IGE_Status.selectedItemType = "LightCone";
            }
            switchPage(database[i].code);
        }
        let img = document.createElement('img');
        img.src = database[i].icon;
        item.appendChild(img);
        itemArea.appendChild(item);
    }
}
fillItemArea(CHARACTER_LIST, E_IGE_Sidebar_Characters);
fillItemArea(LIGHTCONE_LIST, E_IGE_Sidebar_Lightcones);