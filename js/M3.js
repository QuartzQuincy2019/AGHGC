var E_M3_Input = document.getElementById("M3_Input");
var E_M3_Result = document.getElementById("M3_E_Result");
const reg_Date = /\d{4}-\d{2}-\d{2}/g;
const reg_Version = /\d\.\d/g
const reg_SpecialVersion_Plus = /(\+)/g
const reg_SpecialVersion_Minus = /(-)/g
var test_Date;
var test_Version;
var test_SpecialVersion;
{
    let vm = new VersionManager();
    var thisStage = vm.detectStage(TODAY, Object.values(NORMAL_VERSIONS))[0];
}

E_M3_Input.addEventListener("input", () => {
    var getValue = E_M3_Input.value;
    getValue = getValue.replaceAll(/#/g, "@")
        .replaceAll(/(^v)/g, "")
        .replaceAll(/\s+/g, "@")
        .replaceAll(/(年)|(月)/g, "-")
        .replaceAll(/(日)/g, "");
    getValue = getValue.replaceAll(/(?<=\d)(?=上|下)/g, "@")
        .replaceAll(/(上半)|(上)/g, "1")
        .replaceAll(/(下半)|(下)/g, "2");
    test_Date = getValue.search(reg_Date);
    test_Version = getValue.search(reg_Version);
    let pluses = 0, minuses = 0;
    getValue.match(reg_SpecialVersion_Plus) == null ? pluses = 0 : pluses = getValue.match(reg_SpecialVersion_Plus).length;
    getValue.match(reg_SpecialVersion_Minus) == null ? minuses = 0 : minuses = getValue.match(reg_SpecialVersion_Minus).length;
    test_SpecialVersion = pluses - minuses;
    // console.log(test_Date, test_Version, test_SpecialVersion);
    E_M3_Result.innerHTML = "";
    startM3Calculation(getValue);
})
function startM3Calculation(getValue) {
    var vm = new VersionManager();
    const err = "<span class='BoldRed'>该版本不在程序数据库内，或不存在此版本。</span>";
    const d1 = "查询到的版本：<span class='EmphasisBlue'>";
    const d2 = "</span><br>";
    if (test_Date == 0) {
        console.log(getValue);
        var foundVersion = vm.detectStage(dateStringToMJD(getValue), Object.values(NORMAL_VERSIONS))[0];
        if (foundVersion) {
            E_M3_Result.innerHTML += d1 + foundVersion.durationCode + "&nbsp;&nbsp;&nbsp;" + foundVersion.versionTitle[LANGUAGE] + d2;
            presentVersionSups(foundVersion);
            presentVersionWith(foundVersion.dateStart, foundVersion.lastDate);
        } else {
            E_M3_Result.innerHTML = err;
        }
        return;
    }
    if (test_Version == 0) {
        var foundVersion = VERSIONS_SET[getValue];
        if (foundVersion) {
            E_M3_Result.innerHTML += d1 + foundVersion.durationCode + "&nbsp;&nbsp;&nbsp;" + foundVersion.versionTitle[LANGUAGE] + d2;
            presentVersionSups(foundVersion);
            presentVersionWith(foundVersion.dateStart, foundVersion.lastDate);
        } else {
            E_M3_Result.innerHTML = err;
        }
        return;
    }
    if (test_SpecialVersion != 0) {
        var currentCodeIndex = OFFICIAL_VERSIONS_KEYS.indexOf(thisStage.durationCode);
        var foundVersion = VERSIONS_SET[OFFICIAL_VERSIONS_KEYS[currentCodeIndex - test_SpecialVersion]];
        // console.log(currentCodeIndex + test_SpecialVersion);
        if (foundVersion) {
            E_M3_Result.innerHTML += d1 + foundVersion.durationCode + "&nbsp;&nbsp;&nbsp;" + foundVersion.versionTitle[LANGUAGE] + d2;
            presentVersionSups(foundVersion);
            presentVersionWith(foundVersion.dateStart, foundVersion.lastDate);
        } else {
            E_M3_Result.innerHTML = err;
        }
        return;
    }
}

function presentVersionSups(foundVersion) {
    var vm = new VersionManager();
    var sups = vm.sups(foundVersion.durationCode);
    var str1 = "";
    var str2 = "";
    if (sups[0].length > 0) {
        for (var i = 0; i < sups[0].length; i++) {
            str1 += findItem(sups[0][i]).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        E_M3_Result.innerHTML += "该版本UP五星角色：<span class='EmphasisPurple'>" + str1 + "</span><br>";
    }
    if (sups[1].length > 0) {
        for (var i = 0; i < sups[1].length; i++) {
            str2 += findItem(sups[1][i]).fullName[LANGUAGE] + "&nbsp;&nbsp;&nbsp;&nbsp;";
        }
        E_M3_Result.innerHTML += "该版本UP五星光锥：<span class='EmphasisPurple'>" + str2 + "</span><br>";
    }
}


function presentVersionWith(dateStart, dateEnd) {
    if (ofPeriod(TODAY, dateStart, dateEnd) == 1) {
        E_M3_Result.innerHTML += "该版本已过去<span class='EmphasisBlue'>" + (TODAY - dateEnd) + "</span>天。（" + MJDToDateString(dateStart) + " ~ " + MJDToDateString(dateEnd) + "）";
    }
    if (ofPeriod(TODAY, dateStart, dateEnd) == 0) {
        E_M3_Result.innerHTML += "该版本已开始" + (TODAY - dateStart) + "天，还有<span class='EmphasisBlue'>" + (dateEnd - TODAY) + "</span>天结束。";
    }
    if (ofPeriod(TODAY, dateStart, dateEnd) == -1) {
        E_M3_Result.innerHTML += "距离该版本还有<span class='EmphasisBlue'>" + (dateStart - TODAY) + "</span>天。（" + MJDToDateString(dateStart) + " ~ " + MJDToDateString(dateEnd) + "）";
    }
}