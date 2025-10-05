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

    get stringLastDate() {
        return MJDToDateString(this.lastDate);
    }

    get date() {
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
    versionTitle = {};
    constructor(_versionCode, _session, _dateStart, _last, _isPermanent, _versionTitle = { "zh-CN": "??????", "en": "??????", "jp": "??????" }) {
        super("" + _versionCode + "@" + _session, dateStringToMJD(_dateStart), _last, _isPermanent);
        this.session = _session;
        this.mainVersion = _versionCode;
        this.versionTitle = _versionTitle;
    }
}
// 上半卡池的结束当天应算作下半卡池的开始，例如
// 3.5@1的结束日期是2025-09-01，但实际交接时间是2025-09-02 11:59。
// 3.5@2的开始日期是2025-09-02，实际开始时间是2025-09-02 12:00。

var NORMAL_VERSIONS = {
    "4.2@2": new Version("4.2", 2, "2026-05-13", 21, false),
    "4.2@1": new Version("4.2", 1, "2026-04-22", 21, false),
    "4.1@2": new Version("4.1", 2, "2026-04-01", 21, false),
    "4.1@1": new Version("4.1", 1, "2026-03-11", 21, false),
    "4.0@2": new Version("4.0", 2, "2026-02-18", 21, false),
    "4.0@1": new Version("4.0", 1, "2026-01-28", 21, false),
    "3.8@2": new Version("3.8", 2, "2026-01-07", 21, false),
    "3.8@1": new Version("3.8", 1, "2025-12-17", 21, false),
    "3.7@2": new Version("3.7", 2, "2025-11-26", 21, false),
    "3.7@1": new Version("3.7", 1, "2025-11-05", 21, false),
    "3.6@2": new Version("3.6", 2, "2025-10-15", 21, false, { "zh-CN": "于长夜重返大地", "en": "Back to Earth in Evernight", "jp": "長き夜に再び大地へ" }),
    "3.6@1": new Version("3.6", 1, "2025-09-24", 21, false, { "zh-CN": "于长夜重返大地", "en": "Back to Earth in Evernight", "jp": "長き夜に再び大地へ" }),
    "3.5@2": new Version("3.5", 2, "2025-09-02", 22, false, { "zh-CN": "英雄未死之前", "en": "Before Their Deaths", "jp": "英雄は死ぬまでに" }),
    "3.5@1": new Version("3.5", 1, "2025-08-13", 20, false, { "zh-CN": "英雄未死之前", "en": "Before Their Deaths", "jp": "英雄は死ぬまでに" }),
    "3.4@2": new Version("3.4", 2, "2025-07-23", 21, false, { "zh-CN": "因为太阳将要毁伤", "en": "For the Sun is Set to Die", "jp": "破滅へ向かう太陽" }),
    "3.4@1": new Version("3.4", 1, "2025-07-02", 21, false, { "zh-CN": "因为太阳将要毁伤", "en": "For the Sun is Set to Die", "jp": "破滅へ向かう太陽" }),
    "3.3@2": new Version("3.3", 2, "2025-06-11", 21, false, { "zh-CN": "在黎明升起时坠落", "en": "The Fall at Dawn's Rise", "jp": "夜明け前に迎える崩落" }),
    "3.3@1": new Version("3.3", 1, "2025-05-21", 21, false, { "zh-CN": "在黎明升起时坠落", "en": "The Fall at Dawn's Rise", "jp": "夜明け前に迎える崩落" }),
    "3.2@2": new Version("3.2", 2, "2025-04-30", 21, false, { "zh-CN": "走过安眠地的花丛", "en": "Through the Petals in the Land of Repose", "jp": "安眠の地の花海を歩いて" }),
    "3.2@1": new Version("3.2", 1, "2025-04-09", 21, false, { "zh-CN": "走过安眠地的花丛", "en": "Through the Petals in the Land of Repose", "jp": "安眠の地の花海を歩いて" }),
    "3.1@2": new Version("3.1", 2, "2025-03-19", 21, false, { "zh-CN": "门扉之启，王座之终", "en": "Light Slips the Gate, Shadow Greets the Throne", "jp": "始まりの門と終わりの玉座" }),
    "3.1@1": new Version("3.1", 1, "2025-02-26", 21, false, { "zh-CN": "门扉之启，王座之终", "en": "Light Slips the Gate, Shadow Greets the Throne", "jp": "始まりの門と終わりの玉座" }),
    "3.0@2": new Version("3.0", 2, "2025-02-05", 21, false, { "zh-CN": "再创世的凯歌", "en": "Paean of Era Nova", "jp": "再創紀の凱歌" }),
    "3.0@1": new Version("3.0", 1, "2025-01-15", 21, false, { "zh-CN": "再创世的凯歌", "en": "Paean of Era Nova", "jp": "再創紀の凱歌" }),
    "2.7@2": new Version("2.7", 2, "2024-12-25", 21, false, { "zh-CN": "在第八日启程", "en": "A New Venture on the Eighth Dawn", "jp": "八日目の旅立ち" }),
    "2.7@1": new Version("2.7", 1, "2024-12-04", 21, false, { "zh-CN": "在第八日启程", "en": "A New Venture on the Eighth Dawn", "jp": "八日目の旅立ち" }),
    "2.6@2": new Version("2.6", 2, "2024-11-13", 21, false, { "zh-CN": "毗乃昆尼末法世记", "en": "Annals of Pinecany's Mappou Age", "jp": "毘乃昆尼末法筆録" }),
    "2.6@1": new Version("2.6", 1, "2024-10-23", 21, false, { "zh-CN": "毗乃昆尼末法世记", "en": "Annals of Pinecany's Mappou Age", "jp": "毘乃昆尼末法筆録" }),
    "2.5@2": new Version("2.5", 2, "2024-10-02", 21, false, { "zh-CN": "碧羽飞黄射天狼", "en": "Flying Aureus Shot to Lupine Rue", "jp": "碧羽飛黄、射られる天狼" }),
    "2.5@1": new Version("2.5", 1, "2024-09-10", 22, false, { "zh-CN": "碧羽飞黄射天狼", "en": "Flying Aureus Shot to Lupine Rue", "jp": "碧羽飛黄、射られる天狼" }),
    "2.4@2": new Version("2.4", 2, "2024-08-21", 20, false, { "zh-CN": "明霄竞武试锋芒", "en": "Finest Duel Under the Pristine Blue", "jp": "風起雲湧、相見える鋒鋩" }),
    "2.4@1": new Version("2.4", 1, "2024-07-31", 21, false, { "zh-CN": "明霄竞武试锋芒", "en": "Finest Duel Under the Pristine Blue", "jp": "風起雲湧、相見える鋒鋩" }),
    "2.3@2": new Version("2.3", 2, "2024-07-10", 21, false, { "zh-CN": "再见，匹诺康尼", "en": "Farewell, Penacony", "jp": "さよなら、ピノコニー" }),
    "2.3@1": new Version("2.3", 1, "2024-06-19", 21, false, { "zh-CN": "再见，匹诺康尼", "en": "Farewell, Penacony", "jp": "さよなら、ピノコニー" }),
    "2.2@2": new Version("2.2", 2, "2024-05-29", 21, false, { "zh-CN": "等醒来再哭泣", "en": "Then Wake to Weep", "jp": "涙は目覚めの後で" }),
    "2.2@1": new Version("2.2", 1, "2024-05-08", 21, false, { "zh-CN": "等醒来再哭泣", "en": "Then Wake to Weep", "jp": "涙は目覚めの後で" }),
    "2.1@2": new Version("2.1", 2, "2024-04-17", 21, false, { "zh-CN": "狂热奔向深渊", "en": "Into the Yawning Chasm", "jp": "深淵への狂走" }),
    "2.1@1": new Version("2.1", 1, "2024-03-27", 21, false, { "zh-CN": "狂热奔向深渊", "en": "Into the Yawning Chasm", "jp": "深淵への狂走" }),
    "2.0@2": new Version("2.0", 2, "2024-02-29", 27, false, { "zh-CN": "假如在午夜入梦", "en": "If One Dreams At Midnight", "jp": "真夜中に夢を見るなら" }),
    "2.0@1": new Version("2.0", 1, "2024-02-06", 23, false, { "zh-CN": "假如在午夜入梦", "en": "If One Dreams At Midnight", "jp": "真夜中に夢を見るなら" }),
    "1.6@2": new Version("1.6", 2, "2024-01-17", 20, false, { "zh-CN": "庸与神的冠冕", "en": "Crown of the Mundane and Divine", "jp": "只人と神の栄冠" }),
    "1.6@1": new Version("1.6", 1, "2023-12-27", 21, false, { "zh-CN": "庸与神的冠冕", "en": "Crown of the Mundane and Divine", "jp": "只人と神の栄冠" }),
    "1.5@2": new Version("1.5", 2, "2023-12-06", 21, false, { "zh-CN": "迷离幻夜谈", "en": "The Crepuscule Zone", "jp": "迷離幻夜譚" }),
    "1.5@1": new Version("1.5", 1, "2023-11-15", 21, false, { "zh-CN": "迷离幻夜谈", "en": "The Crepuscule Zone", "jp": "迷離幻夜譚" }),
    "1.4@2": new Version("1.4", 2, "2023-10-27", 19, false, { "zh-CN": "冬梦激醒", "en": "Jolted Awake From a Winter Dream", "jp": "冬の夢から目覚めて" }),
    "1.4@1": new Version("1.4", 1, "2023-10-11", 16, false, { "zh-CN": "冬梦激醒", "en": "Jolted Awake From a Winter Dream", "jp": "冬の夢から目覚めて" }),
    "1.3@2": new Version("1.3", 2, "2023-09-20", 21, false, { "zh-CN": "天镜映劫尘", "en": "Celestial Eyes Above Mortal Ruins", "jp": "業塵を映す天鏡" }),
    "1.3@1": new Version("1.3", 1, "2023-08-30", 21, false, { "zh-CN": "天镜映劫尘", "en": "Celestial Eyes Above Mortal Ruins", "jp": "業塵を映す天鏡" }),
    "1.2@2": new Version("1.2", 2, "2023-08-09", 21, false, { "zh-CN": "仙骸有终", "en": "Even Immortality Ends", "jp": "仙骸に果て有り" }),
    "1.2@1": new Version("1.2", 1, "2023-07-19", 21, false, { "zh-CN": "仙骸有终", "en": "Even Immortality Ends", "jp": "仙骸に果て有り" }),
    "1.1@2": new Version("1.1", 2, "2023-06-28", 21, false, { "zh-CN": "银河漫游", "en": "Galactic Roaming", "jp": "銀河漫遊" }),
    "1.1@1": new Version("1.1", 1, "2023-06-07", 21, false, { "zh-CN": "银河漫游", "en": "Galactic Roaming", "jp": "銀河漫遊" }),
    "1.0@2": new Version("1.0", 2, "2023-05-17", 21, false, { "zh-CN": "通往群星的轨道", "en": "The Rail Unto the Stars", "jp": "星へ続くレイル" }),
    "1.0@1": new Version("1.0", 1, "2023-04-26", 21, false, { "zh-CN": "通往群星的轨道", "en": "The Rail Unto the Stars", "jp": "星へ続くレイル" })
}
var SPECIAL_VERSIONS = {
    "3.4@A": new Version("3.4", "A", "2025-07-11", 0, true, { "zh-CN": "因为太阳将要毁伤", "en": "For the Sun is Set to Die", "jp": "破滅へ向かう太陽" })
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

    /**
     * 获取当期版本的五星Up角色和光锥的内部代码
     * @param {string} durationCode 版本代号
     * @returns [角色内部代码[], 光锥内部代码[]]
     */
    sups = function (durationCode) {
        var c = getVersionSupCharacters(durationCode);
        var l = getVersionSupLightcones(durationCode);
        return [c, l];
    }
}

/**
 * 全部版本组成的对象，包括键值对
 */
var VERSIONS_SET = { ...NORMAL_VERSIONS, ...SPECIAL_VERSIONS };

var globalVersionManager = new VersionManager();
/**
 * 全部版本组成的数组，按由新到旧排序。
 * @type {Array[Version]}
 */
var ALL_VERSIONS = globalVersionManager.sortDurationsByStart(Object.values({ ...NORMAL_VERSIONS, ...SPECIAL_VERSIONS })).reverse();

var ALL_MAIN_VERSION_CODE = [...new Set(ALL_VERSIONS.map((eachVersion) => eachVersion.mainVersion))];


var OFFICIAL_VERSIONS_KEYS = Object.keys(NORMAL_VERSIONS);

var CURRENT_STAGE = "";
