// version.js
// Jul.30,2025改版


class Duration {
    durationCode;//期间代号
    dateStart;
    last;
    isPermanent;
    /**
     * 
     * @param {string} _durationCode 
     * @param {number} _dateStart - 开始日期（MJD）
     * @param {number} _last - 持续时间（天）
     * @param {boolean} isPermanent - 是否为永久期限
     */
    constructor(_durationCode, _dateStart, _last, isPermanent = false) {
        this.durationCode = _durationCode;
        this.dateStart = _dateStart;
        this.last = _last;
        this.isPermanent = isPermanent;
    }

    /**
     * 获取期限的最后一天（MJD）
     */
    get lastDate() {
        return this.dateStart + this.last - 1;
    }

    get date(){
        return MJDToDateString(this.dateStart);
    }
}

class DurationManager {
    /**
     * 检查指定日期是否在某个期限内
     * @param {number} targetDate - 指定日期（MJD）
     * @param {Duration} duration - 期限对象的实例
     * @returns 
     */
    isDuring = function (targetDate, duration) {
        if (targetDate < duration.dateStart) {
            return false;
        } else if (duration.isPermanent) {
            return true;
        } else {
            return targetDate <= duration.lastDate;
        }
    }

    /**
     * 按照开始日期对多个期限正序排序
     * @param  {Array[Duration]} durations - 多个期限对象的实例
     * @returns 
     */
    sortDurationsByStart = function (durations) {
        return durations.sort((a, b) => a.dateStart - b.dateStart);
    }
}


class Version extends Duration {
    session;
    mainVersion;
    constructor(_versionCode, _session, _dateStart, _last = 20, _isPermanent = false) {
        super("" + _versionCode + "@" + _session, dateStringToMJD(_dateStart), _last, _isPermanent);
        this.session = _session;
        this.mainVersion = _versionCode;
    }
}

var NORMAL_VERSIONS = {
    "3.7@2": new Version("3.7", 2, "2025-11-26"),
    "3.7@1": new Version("3.7", 1, "2025-11-05"),
    "3.6@2": new Version("3.6", 2, "2025-10-15"),
    "3.6@1": new Version("3.6", 1, "2025-09-24"),
    "3.5@2": new Version("3.5", 2, "2025-09-03"),
    "3.5@1": new Version("3.5", 1, "2025-08-13"),
    "3.4@2": new Version("3.4", 2, "2025-07-23"),
    "3.4@1": new Version("3.4", 1, "2025-07-02"),
    "3.3@2": new Version("3.3", 2, "2025-06-11"),
    "3.3@1": new Version("3.3", 1, "2025-05-21"),
    "3.2@2": new Version("3.2", 2, "2025-04-30"),
    "3.2@1": new Version("3.2", 1, "2025-04-09"),
    "3.1@2": new Version("3.1", 2, "2025-03-19"),
    "3.1@1": new Version("3.1", 1, "2025-02-26"),
    "3.0@2": new Version("3.0", 2, "2025-02-05"),
    "3.0@1": new Version("3.0", 1, "2025-01-15"),
    "2.7@2": new Version("2.7", 2, "2024-12-25"),
    "2.7@1": new Version("2.7", 1, "2024-12-04"),
    "2.6@2": new Version("2.6", 2, "2024-11-13"),
    "2.6@1": new Version("2.6", 1, "2024-10-23"),
    "2.5@2": new Version("2.5", 2, "2024-10-02"),
    "2.5@1": new Version("2.5", 1, "2024-09-10"),
    "2.4@2": new Version("2.4", 2, "2024-08-21"),
    "2.4@1": new Version("2.4", 1, "2024-07-31"),
    "2.3@2": new Version("2.3", 2, "2024-07-10"),
    "2.3@1": new Version("2.3", 1, "2024-06-19"),
    "2.2@2": new Version("2.2", 2, "2024-05-29"),
    "2.2@1": new Version("2.2", 1, "2024-05-08")
}
var SPECIAL_VERSIONS = {
    "3.4@A": new Version("3.4", "A", "2025-07-11", 0, true),
}

class VersionManager extends DurationManager {

    /**
     * 
     * @param {number} mjd 
     * @param {array[Version]} references - 版本对象的实例的数组
     * @returns 
     */
    detectStage = function (mjd, references) {
        var output = [];
        for (const eachVersion of references) {
            if (this.isDuring(mjd, eachVersion)) {
                output.push(eachVersion);
            }
        }
        return output;
    }
}

/**
 * 全部版本组成的对象，包括键值对
 */
var VERSIONS_SET = {...NORMAL_VERSIONS,...SPECIAL_VERSIONS};

var globalVersionManager = new VersionManager();
/**
 * 全部版本组成的数组，按由新到旧排序。
 * @type {Array[Version]}
 */
var ALL_VERSIONS = globalVersionManager.sortDurationsByStart(Object.values({ ...NORMAL_VERSIONS, ...SPECIAL_VERSIONS })).reverse();

var ALL_MAIN_VERSION_CODE = [...new Set(ALL_VERSIONS.map((eachVersion)=>eachVersion.mainVersion))];


var OFFICIAL_VERSIONS_KEYS = Object.keys(NORMAL_VERSIONS);

var CURRENT_STAGE = "";
