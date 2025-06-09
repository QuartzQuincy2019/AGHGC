var E_M3_Input = document.getElementById("M3_Input");
var E_M3_Result = document.getElementById("M3_E_Result");
const reg_Date = /\d{4}-\d{2}-\d{2}/g;
const reg_Version = /\d\.\d/g
const reg_SpecialVersion_Plus = /(\+)/g
const reg_SpecialVersion_Minus = /(-)/g
var test_Date;
var test_Version;
var test_SpecialVersion;
var thisStage = detectStage(TODAY);

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
    if (test_Date == 0) {
        var foundVersion = OFFICIAL_VERSIONS[detectStage(dateStringToMJD(getValue))];
        if (!foundVersion) {
            E_M3_Result.innerHTML += "<span class='BoldRed'>该版本信息不在数据库内。若要进行计算，请使用“+”或“-”表示“下一个半版本”、“下一个子版本”。<br>比如输入'++++'来预测后续第4个半版本的时间。</span>";
            return;
        }
        E_M3_Result.innerHTML += "检测到的版本：v" + foundVersion.versionCode + "@" + foundVersion.session + "<br>";
        presentVersionWith(foundVersion.dateMJD, dateStringToMJD(foundVersion.endDate));
        return;
    }
    if (test_Version == 0) {
        var foundVersion = OFFICIAL_VERSIONS[getValue];
        if (!foundVersion) return;
        if (foundVersion) E_M3_Result.innerHTML += "检测到的版本：v" + foundVersion.versionCode + "@" + foundVersion.session + "<br>";
        presentVersionWith(foundVersion.dateMJD, dateStringToMJD(foundVersion.endDate));
        return;
    }
    if (test_SpecialVersion != 0) {
        var currentVersion = OFFICIAL_VERSIONS[thisStage];
        var startDate = currentVersion.dateMJD + 21 * test_SpecialVersion;
        var foundVersion = OFFICIAL_VERSIONS[detectStage(startDate)];
        if (foundVersion) E_M3_Result.innerHTML += "检测到的版本：v" + foundVersion.versionCode + "@" + foundVersion.session + "<br>";
        presentVersionWith(startDate, startDate + 20);
        return;
    }
}

function presentVersionWith(dateStart, dateEnd) {
    if (ofPeriod(TODAY, dateStart, dateEnd) == 1) {
        E_M3_Result.innerHTML += "该版本已过去" + (TODAY - dateEnd) + "天。（" + MJDToDateString(dateStart) + " ~ " + MJDToDateString(dateEnd) + "）";
    }
    if (ofPeriod(TODAY, dateStart, dateEnd) == 0) {
        E_M3_Result.innerHTML += "该版本已开始" + (TODAY - dateStart) + "天，还有" + (dateEnd - TODAY) + "天结束。";
    }
    if (ofPeriod(TODAY, dateStart, dateEnd) == -1) {
        E_M3_Result.innerHTML += "距离该版本还有" + (dateStart - TODAY) + "天。（" + MJDToDateString(dateStart) + " ~ " + MJDToDateString(dateEnd) + "）";
    }
}