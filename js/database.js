// database.js
// 数据库。储存与游戏角色及属性、卡池配置相关信息。

/**
 * 仿枚举类型
 */
var CombatType = {
    physical: 1,
    fire: 2,
    ice: 3,
    lightning: 4,
    wind: 5,
    quantum: 6,
    imaginary: 7
}

var Path = {
    destruction: 1,
    thehunt: 2,
    erudition: 3,
    harmony: 4,
    nihility: 5,
    preservation: 6,
    abundance: 7,
    remembrance: 8
}

var STAR_NUMBER = [4, 5];

class Character {
    code;//角色识别名（不是英文名）
    star;//角色星数
    combatType;//角色属性
    path;//角色命途
    fullName;//全名

    icon;//40*40肖像
    /**
     * 
     * @param {String} code 
     * @param {Number} star
     * @param {CombatType} combatType
     * @param {Path} path
     * @param {Object} fullName 
     */
    constructor(code, star, combatType, path, fullName) {
        this.code = code;
        this.star = star;
        this.icon = './img/p40/' + this.code + '.png';
        this.combatType = combatType;
        this.path = path;
        this.fullName = fullName;
    }
}

class Lightcone {
    code;
    star;
    path;//命途
    fullName;//光锥名称

    icon;//74*74
    /**
     * 
     * @param {string} code 
     * @param {number} star 
     * @param {Path} path 
     * @param {object} fullName 
     */
    constructor(code, star, path, fullName) {
        this.code = code;
        this.star = star;
        this.icon = './img/lc74/' + this.code + '.png';
        this.path = path;
        this.fullName = fullName;
    }
}

function getItemType(item) {
    if (item instanceof Character) return 'Character';
    if (item instanceof Lightcone) return 'Lightcone';
    throw new Error("getItemType: " + item + "不属于Character或Lightcone");
}

var CHARACTER_LIST = [
    //1.0
    new Character("arla", 4, CombatType.lightning, Path.destruction, { "zh-CN": "阿兰", "en": "Arlan" }),
    new Character("asta", 4, CombatType.fire, Path.harmony, { "zh-CN": "艾丝妲", "en": "Asta" }),
    new Character("bail", 5, CombatType.lightning, Path.abundance, { "zh-CN": "白露", "en": "Bailu" }),
    new Character("bron", 5, CombatType.wind, Path.harmony, { "zh-CN": "布洛妮娅", "en": "Bronya" }),
    new Character("clar", 5, CombatType.physical, Path.destruction, { "zh-CN": "克拉拉", "en": "Clara" }),
    new Character("dhen", 4, CombatType.wind, Path.thehunt, { "zh-CN": "丹恒", "en": "Dan Heng" }),
    new Character("gepa", 5, CombatType.ice, Path.preservation, { "zh-CN": "杰帕德", "en": "Gepard" }),
    new Character("hert", 4, CombatType.ice, Path.erudition, { "zh-CN": "黑塔", "en": "Herta" }),
    new Character("hime", 5, CombatType.fire, Path.erudition, { "zh-CN": "姬子", "en": "Himeko" }),
    new Character("hook", 4, CombatType.fire, Path.destruction, { "zh-CN": "虎克", "en": "Hook" }),
    new Character("jyua", 5, CombatType.lightning, Path.erudition, { "zh-CN": "景元", "en": "Jing Yuan" }),
    new Character("marP", 4, CombatType.ice, Path.preservation, { "zh-CN": "三月七", "en": "March 7th" }),
    new Character("nata", 4, CombatType.physical, Path.abundance, { "zh-CN": "娜塔莎", "en": "Natasha" }),
    new Character("pela", 4, CombatType.ice, Path.nihility, { "zh-CN": "佩拉", "en": "Pela" }),
    new Character("qque", 4, CombatType.quantum, Path.erudition, { "zh-CN": "青雀", "en": "Qingque" }),
    new Character("samp", 4, CombatType.wind, Path.nihility, { "zh-CN": "桑博", "en": "Sampo" }),
    new Character("seel", 5, CombatType.quantum, Path.thehunt, { "zh-CN": "希儿", "en": "Seele" }),
    new Character("serv", 4, CombatType.lightning, Path.erudition, { "zh-CN": "希露瓦", "en": "Serval" }),
    new Character("ssha", 4, CombatType.physical, Path.thehunt, { "zh-CN": "素裳", "en": "Sushang" }),
    new Character("tyun", 4, CombatType.lightning, Path.harmony, { "zh-CN": "停云", "en": "Tingyun" }),
    new Character("welt", 5, CombatType.imaginary, Path.nihility, { "zh-CN": "瓦尔特", "en": "Welt" }),
    new Character("yqin", 5, CombatType.ice, Path.thehunt, { "zh-CN": "彦卿", "en": "Yanqing" }),
    //1.1
    new Character("lcha", 5, CombatType.imaginary, Path.abundance, { "zh-CN": "罗刹", "en": "Luocha" }),
    new Character("swol", 5, CombatType.quantum, Path.nihility, { "zh-CN": "银狼", "en": "Silver Wolf" }),
    new Character("ykon", 4, CombatType.imaginary, Path.harmony, { "zh-CN": "驭空", "en": "Yukong" }),
    //1.2
    new Character("blad", 5, CombatType.wind, Path.destruction, { "zh-CN": "刃", "en": "Blade" }),
    new Character("kafk", 5, CombatType.lightning, Path.nihility, { "zh-CN": "卡芙卡", "en": "Kafka" }),
    new Character("luka", 4, CombatType.physical, Path.nihility, { "zh-CN": "卢卡", "en": "Luka" }),
    //1.3
    new Character("dhil", 5, CombatType.imaginary, Path.destruction, { "zh-CN": "丹恒·饮月", "en": "Dan Heng • Imbibitor Lunae" }),
    new Character("fxua", 5, CombatType.quantum, Path.preservation, { "zh-CN": "符玄", "en": "Fu Xuan" }),
    new Character("lynx", 4, CombatType.quantum, Path.abundance, { "zh-CN": "玲可", "en": "Lynx" }),
    //1.4
    new Character("guin", 4, CombatType.fire, Path.nihility, { "zh-CN": "桂乃芬", "en": "Guinaifen" }),
    new Character("jliu", 5, CombatType.ice, Path.destruction, { "zh-CN": "镜流", "en": "Jingliu" }),
    new Character("tonu", 5, CombatType.fire, Path.thehunt, { "zh-CN": "托帕&账账", "en": "Topaz & Numby" }),
    //1.5
    new Character("arge", 5, CombatType.physical, Path.erudition, { "zh-CN": "银枝", "en": "Argenti" }),
    new Character("hany", 4, CombatType.physical, Path.harmony, { "zh-CN": "寒鸦", "en": "Hanya" }),
    new Character("hhuo", 5, CombatType.wind, Path.abundance, { "zh-CN": "藿藿", "en": "Huohuo" }),
    //1.6
    new Character("rati", 5, CombatType.imaginary, Path.thehunt, { "zh-CN": "真理医生", "en": "Dr.Ratio" }),
    new Character("rmei", 5, CombatType.ice, Path.harmony, { "zh-CN": "阮·梅", "en": "Ruan Mei" }),
    new Character("xuey", 4, CombatType.quantum, Path.destruction, { "zh-CN": "雪衣", "en": "Xueyi" }),
    //2.0
    new Character("blsw", 5, CombatType.wind, Path.nihility, { "zh-CN": "黑天鹅", "en": "Black Swan" }),
    new Character("mish", 4, CombatType.ice, Path.destruction, { "zh-CN": "米沙", "en": "Misha" }),
    new Character("spar", 5, CombatType.quantum, Path.harmony, { "zh-CN": "花火", "en": "Sparkle" }),
    //2.1
    new Character("ache", 5, CombatType.lightning, Path.nihility, { "zh-CN": "黄泉", "en": "Acheron" }),
    new Character("aven", 5, CombatType.imaginary, Path.preservation, { "zh-CN": "砂金", "en": "Aventurine" }),
    new Character("gall", 4, CombatType.fire, Path.abundance, { "zh-CN": "加拉赫", "en": "Gallagher" }),
    //2.2
    new Character("boot", 5, CombatType.physical, Path.thehunt, { "zh-CN": "波提欧", "en": "Boothill" }),
    new Character("robi", 5, CombatType.physical, Path.harmony, { "zh-CN": "知更鸟", "en": "Robin" }),
    //2.3
    new Character("fire", 5, CombatType.fire, Path.destruction, { "zh-CN": "流萤", "en": "Firefly" }),
    new Character("jade", 5, CombatType.quantum, Path.erudition, { "zh-CN": "翡翠", "en": "Jade" }),
    //2.4
    new Character("jqiu", 5, CombatType.fire, Path.nihility, { "zh-CN": "椒丘", "en": "Jiaoqiu" }),
    new Character("marH", 4, CombatType.imaginary, Path.thehunt, { "zh-CN": "三月七", "en": "March 7th" }),
    new Character("yunl", 5, CombatType.physical, Path.destruction, { "zh-CN": "云璃", "en": "Yunli" }),
    //2.5
    new Character("fxia", 5, CombatType.wind, Path.thehunt, { "zh-CN": "飞霄", "en": "Feixiao" }),
    new Character("lsha", 5, CombatType.fire, Path.abundance, { "zh-CN": "灵砂", "en": "Lingsha" }),
    new Character("moze", 4, CombatType.lightning, Path.thehunt, { "zh-CN": "貊泽", "en": "Moze" }),
    //2.6
    new Character("rapp", 5, CombatType.imaginary, Path.erudition, { "zh-CN": "乱破", "en": "Rappa" }),
    //2.7
    new Character("fugu", 5, CombatType.fire, Path.nihility, { "zh-CN": "忘归人", "en": "Fugue" }),
    new Character("sund", 5, CombatType.imaginary, Path.harmony, { "zh-CN": "星期日", "en": "Sunday" }),
    //3.0
    new Character("agla", 5, CombatType.lightning, Path.remembrance, { "zh-CN": "阿格莱雅", "en": "Aglaea" }),
    new Character("ther", 5, CombatType.ice, Path.erudition, { "zh-CN": "大黑塔", "en": "The Herta" }),
    //3.1
    new Character("myde", 5, CombatType.imaginary, Path.destruction, { "zh-CN": "万敌", "en": "Mydei" }),
    new Character("trib", 5, CombatType.quantum, Path.harmony, { "zh-CN": "缇宝", "en": "Tribbie" }),
    //3.2
    new Character("cast", 5, CombatType.quantum, Path.remembrance, { "zh-CN": "遐蝶", "en": "Castorice" }),
    new Character("anax", 5, CombatType.wind, Path.erudition, { "zh-CN": "那刻夏", "en": "Anaxa" }),
    new Character("ciph", 5, CombatType.quantum, Path.nihility, { "zh-CN": "赛飞儿", "en": "Cipher" }),
    new Character("hyac", 5, CombatType.wind, Path.remembrance, { "zh-CN": "风堇", "en": "Hyacine" })

];

var LIGHTCONE_LIST = [
    new Lightcone("aftert4", 4, Path.erudition, { "zh-CN": "谐乐静默之后", "en": "After the Charmony Fall" }),
    new Lightcone("asecre3", 4, Path.destruction, { "zh-CN": "秘密誓心", "en": "A Secret Vow" }),
    new Lightcone("boundl2", 4, Path.nihility, { "zh-CN": "无边曼舞", "en": "Boundless Choreo" }),
    new Lightcone("concer3", 4, Path.preservation, { "zh-CN": "两个人的演唱会", "en": "Concert for Two" }),
    new Lightcone("danced3", 4, Path.harmony, { "zh-CN": "舞！舞！舞！", "en": "Dance! Dance! Dance!" }),
    new Lightcone("dayone6", 4, Path.preservation, { "zh-CN": "余生的第一天", "en": "Day One of My New Life" }),
    new Lightcone("dreams2", 4, Path.abundance, { "zh-CN": "梦的蒙太奇", "en": "Dream's Montage" }),
    new Lightcone("eyesof4", 4, Path.nihility, { "zh-CN": "猎物的视线", "en": "Eyes of the Prey" }),
    new Lightcone("geniusr", 4, Path.erudition, { "zh-CN": "天才们的休憩", "en": "Geniuses' Repose" }),
    new Lightcone("goodni5", 4, Path.nihility, { "zh-CN": "晚安与睡颜", "en": "Good Night and Sleep Well" }),
    new Lightcone("indeli2", 4, Path.destruction, { "zh-CN": "铭记于心的约定", "en": "Indelible Promise" }),
    new Lightcone("landau2", 4, Path.preservation, { "zh-CN": "朗道的选择", "en": "Landau's Choice" }),
    new Lightcone("maketh4", 4, Path.erudition, { "zh-CN": "别让世界静下来", "en": "Make the World Clamor" }),
    new Lightcone("memori4", 4, Path.harmony, { "zh-CN": "记忆中的模样", "en": "Memories of the Past" }),
    new Lightcone("onlysi3", 4, Path.thehunt, { "zh-CN": "唯有沉默", "en": "Only Silence Remains" }),
    new Lightcone("perfec2", 4, Path.abundance, { "zh-CN": "此时恰好", "en": "Perfect Timing" }),
    new Lightcone("planet2", 4, Path.harmony, { "zh-CN": "与行星相会", "en": "Planetary Rendezvous" }),
    new Lightcone("poised3", 4, Path.harmony, { "zh-CN": "芳华待灼", "en": "Poised to Bloom" }),
    new Lightcone("postop2", 4, Path.abundance, { "zh-CN": "一场术后对话", "en": "Post-Op Conversation" }),
    new Lightcone("resolu6", 4, Path.nihility, { "zh-CN": "决心如汗珠般闪耀", "en": "Resolution Shines As Pearls of Sweat" }),
    new Lightcone("shadow3", 4, Path.thehunt, { "zh-CN": "黑夜如影随行", "en": "Shadowed by Night" }),
    new Lightcone("shared2", 4, Path.abundance, { "zh-CN": "同一种心情", "en": "Shared Feeling" }),
    new Lightcone("subscr3", 4, Path.thehunt, { "zh-CN": "点个关注吧！", "en": "Subscribe for More!" }),
    new Lightcone("swordp1", 4, Path.thehunt, { "zh-CN": "论剑", "en": "Swordplay" }),
    new Lightcone("thebir5", 4, Path.erudition, { "zh-CN": "「我」的诞生", "en": "The Birth of the Self" }),
    new Lightcone("themol4", 4, Path.destruction, { "zh-CN": "鼹鼠党欢迎你", "en": "The Moles Welcome You" }),
    new Lightcone("trendo5", 4, Path.preservation, { "zh-CN": "宇宙市场趋势", "en": "Trend of the Universal Market" }),
    new Lightcone("undert4", 4, Path.destruction, { "zh-CN": "在蓝天下", "en": "Under the Blue Sky" }),
    new Lightcone("geniusg", 4, Path.remembrance, { "zh-CN": "天才们的问候", "en": "Geniuses' Greetings" }),
    //5 stars
    new Lightcone("alongt4", 5, Path.nihility, { "zh-CN": "行于流逝的岸", "en": "Along the Passing Shore" }),
    new Lightcone("butthe5", 5, Path.harmony, { "zh-CN": "但战斗还未结束", "en": "But the Battle Isn't Over" }),
    new Lightcone("inthen6", 5, Path.nihility, { "zh-CN": "以世界之名", "en": "In the Name of the World" }),
    new Lightcone("longro4", 5, Path.nihility, { "zh-CN": "长路终有归途", "en": "Long Road Leads Home" }),
    new Lightcone("makefa4", 5, Path.remembrance, { "zh-CN": "让告别，更美一些", "en": "Make Farewells More Beautiful" }),
    new Lightcone("moment3", 5, Path.preservation, { "zh-CN": "制胜的瞬间", "en": "Moment of Victory" }),
    new Lightcone("nighto5", 5, Path.erudition, { "zh-CN": "银河铁道之夜", "en": "Night on the Milky Way" }),
    new Lightcone("sleepl4", 5, Path.thehunt, { "zh-CN": "如泥酣眠", "en": "Sleep Like the Dead" }),
    new Lightcone("someth2", 5, Path.destruction, { "zh-CN": "无可取代的东西", "en": "Something Irreplaceable" }),
    new Lightcone("thosem3", 5, Path.nihility, { "zh-CN": "那无数个春天", "en": "Those Many Springs" }),
    new Lightcone("timewa5", 5, Path.abundance, { "zh-CN": "时节不居", "en": "Time Waits for No One" }),
];

var characterMap = {};//角色代号->角色对象
for (var i = 0; i < CHARACTER_LIST.length; i++) {//建立由角色代号到角色对象的映射
    var character = CHARACTER_LIST[i];
    characterMap[character.code] = character;
}

var CHARACTER_CODES = [];//所有角色的代号
for (var i = 0; i < CHARACTER_LIST.length; i++) {
    CHARACTER_CODES.push(CHARACTER_LIST[i].code);
}

var lightconeMap = {};
for (var i = 0; i < LIGHTCONE_LIST.length; i++) {
    var lc = LIGHTCONE_LIST[i];
    lightconeMap[lc.code] = lc;
}

var LIGHTCONE_CODES = [];//所有光锥的代号
for (var i = 0; i < LIGHTCONE_LIST.length; i++) {
    LIGHTCONE_CODES.push(LIGHTCONE_LIST[i].code);
}


class Version {
    versionCode;
    session;
    date;

    /**
     * 
     * @param {string} _code - 版本号
     * @param {number} _session - 上半：1；下半：2
     * @param {session} _date - 更新日期
     */
    constructor(_code, _session, _date) {
        this.versionCode = _code;
        this.session = _session;
        this.date = _date;
    }
}
var OFFICIAL_VERSIONS = {
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

var ALL_CHARACTER_WARP_POOLS = [];
var CHARACTER_EVENT_WARPS = {
    //3.2
    "C3_2_1": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['cast'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['pela', 'gall', 'lynx'],
                ['arla', 'asta', 'dhen', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'marP', 'moze',
                    'mish', 'nata', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ],
            ],
    },
    "C3_2_2-1": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['fugu'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['pela', 'gall', 'lynx'],
                ['arla', 'asta', 'dhen', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'marP', 'moze',
                    'mish', 'nata', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_2_2-2": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['jqiu'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['pela', 'gall', 'lynx'],
                ['arla', 'asta', 'dhen', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'marP', 'moze',
                    'mish', 'nata', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_2_2-3": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['ache'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['pela', 'gall', 'lynx'],
                ['arla', 'asta', 'dhen', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'marP', 'moze',
                    'mish', 'nata', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    //3.1
    "C3_1_3": {
        "versionInfo": "3.1@2",
        "contents":
            [
                ['myde'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['arla', 'xuey', 'nata'],
                ['asta', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'mish', 'pela', 'qque', 'samp',
                    'serv', 'ssha', 'tyun', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_1_4": {
        "versionInfo": "3.1@2",
        "contents":
            [
                ['hhuo'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['arla', 'xuey', 'nata'],
                ['asta', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'mish', 'pela', 'qque', 'samp',
                    'serv', 'ssha', 'tyun', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_1_1": {
        "versionInfo": "3.1@1",
        "contents":
            [
                ['trib'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['lynx', 'hook', 'guin'],
                ['arla', 'asta', 'dhen', 'gall', 'hany',
                    'hert', 'luka', 'marP', 'moze', 'mish',
                    'nata', 'pela', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_1_2": {
        "versionInfo": "3.1@1",
        "contents":
            [
                ['yunl'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['lynx', 'hook', 'guin'],
                ['arla', 'asta', 'dhen', 'gall', 'hany',
                    'hert', 'luka', 'marP', 'moze', 'mish',
                    'nata', 'pela', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    //3.0
    "C3_0_3": {
        "versionInfo": "3.0@2",
        "contents":
            [
                ['agla'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['tyun', 'hany', 'ssha'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'mish', 'nata', 'pela', 'qque',
                    'samp', 'serv', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_0_4-1": {
        "versionInfo": "3.0@2",
        "contents":
            [
                ['boot'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['tyun', 'hany', 'ssha'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'mish', 'nata', 'pela', 'qque',
                    'samp', 'serv', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_0_4-2": {
        "versionInfo": "3.0@2",
        "contents":
            [
                ['robi'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['tyun', 'hany', 'ssha'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'mish', 'nata', 'pela', 'qque',
                    'samp', 'serv', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_0_4-3": {
        "versionInfo": "3.0@2",
        "contents":
            [
                ['swol'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['tyun', 'hany', 'ssha'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'mish', 'nata', 'pela', 'qque',
                    'samp', 'serv', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_0_1": {
        "versionInfo": "3.0@1",
        "contents":
            [
                ['ther'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['nata', 'asta', 'moze'],
                ['arla', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'mish', 'pela', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_0_2-1": {
        "versionInfo": "3.0@1",
        "contents":
            [
                ['lsha'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['nata', 'asta', 'moze'],
                ['arla', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'mish', 'pela', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_0_2-2": {
        "versionInfo": "3.0@1",
        "contents":
            [
                ['fxia'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['nata', 'asta', 'moze'],
                ['arla', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'mish', 'pela', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C3_0_2-3": {
        "versionInfo": "3.0@1",
        "contents":
            [
                ['jade'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['nata', 'asta', 'moze'],
                ['arla', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'mish', 'pela', 'qque', 'samp', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    //2.7
    "C2_7_3": {
        "versionInfo": "2.7@2",
        "contents":
            [
                ['fugu'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['gall', 'ykon', 'mish'],
                ['arla', 'asta', 'dhen', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'nata', 'pela', 'qque', 'samp',
                    'serv', 'ssha', 'tyun', 'xuey',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C2_7_4": {
        "versionInfo": "2.7@2",
        "contents":
            [
                ['fire'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['gall', 'ykon', 'mish'],
                ['arla', 'asta', 'dhen', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'moze', 'nata', 'pela', 'qque', 'samp',
                    'serv', 'ssha', 'tyun', 'xuey',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    //2024-12-04
    "C2_7_1": {
        "versionInfo": "2.7@1",
        "contents":
            [
                ['sund'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['qque', 'arla', 'tyun'],
                ['asta', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'mish', 'moze', 'nata', 'pela', 'samp',
                    'serv', 'ssha', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C2_7_2": {
        "versionInfo": "2.7@1",
        "contents":
            [
                ['jyua'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['qque', 'arla', 'tyun'],
                ['asta', 'dhen', 'gall', 'guin', 'hany',
                    'hert', 'hook', 'luka', 'lynx', 'marP',
                    'mish', 'moze', 'nata', 'pela', 'samp',
                    'serv', 'ssha', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    //2024-11-13
    "C2_6_3": {
        "versionInfo": "2.6@2",
        "contents":
            [
                ['ache'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['marP', 'pela', 'samp',],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'lynx',
                    'mish', 'moze', 'nata', 'qque', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C2_6_4": {
        "versionInfo": "2.6@2",
        "contents":
            [
                ['aven'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['marP', 'pela', 'samp',],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'lynx',
                    'mish', 'moze', 'nata', 'qque', 'serv',
                    'ssha', 'tyun', 'xuey', 'ykon',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    //2024-10-23
    "C2_6_1": {
        "versionInfo": "2.6@1",
        "contents":
            [
                ['rapp'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['lynx', 'xuey', 'ykon'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'marP',
                    'mish', 'moze', 'nata', 'pela', 'qque',
                    'samp', 'serv', 'ssha', 'tyun',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    },
    "C2_6_2": {
        "versionInfo": "2.6@1",
        "contents":
            [
                ['dhil'],
                ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
                ['lynx', 'xuey', 'ykon'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'marP',
                    'mish', 'moze', 'nata', 'pela', 'qque',
                    'samp', 'serv', 'ssha', 'tyun',
                    'asecre3', 'aftert4', 'boundl2', 'concer3',
                    'danced3', 'dayone6', 'dreams2', 'eyesof4',
                    'geniusr', 'goodni5', 'indeli2', 'landau2',
                    'maketh4', 'memori4', 'onlysi3', 'perfec2',
                    'planet2', 'poised3', 'postop2', 'resolu6',
                    'shadow3', 'shared2', "subscr3", 'swordp1',
                    'thebir5', 'themol4', 'trendo5', 'undert4'
                ]
            ]
    }
}

var ALL_LIGHTCONE_WARP_POOLS = [];
var LIGHTCONE_EVENT_WARPS = {
    "L3_2_1": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['makefa4'],
                ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
                ['goodni5', 'postop2', 'boundl2'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'lynx',
                    'marP', 'moze', 'mish', 'nata', 'pela',
                    'qque', 'samp', 'serv', 'ssha', 'tyun',
                    'xuey', 'ykon',
                    'asecre3', 'aftert4', 'concer3', 'danced3',
                    'dayone6', 'dreams2', 'eyesof4', 'geniusr',
                    'indeli2', 'landau2', 'maketh4', 'memori4',
                    'onlysi3', 'perfec2', 'planet2', 'poised3',
                    'resolu6', 'shadow3', 'shared2', "subscr3",
                    'swordp1', 'thebir5', 'themol4', 'trendo5',
                    'undert4'
                ],
            ],
    },
    "L3_2_2-1": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['longro4'],
                ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
                ['goodni5', 'postop2', 'boundl2'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'lynx',
                    'marP', 'moze', 'mish', 'nata', 'pela',
                    'qque', 'samp', 'serv', 'ssha', 'tyun',
                    'xuey', 'ykon',
                    'asecre3', 'aftert4', 'concer3', 'danced3',
                    'dayone6', 'dreams2', 'eyesof4', 'geniusr',
                    'indeli2', 'landau2', 'maketh4', 'memori4',
                    'onlysi3', 'perfec2', 'planet2', 'poised3',
                    'resolu6', 'shadow3', 'shared2', "subscr3",
                    'swordp1', 'thebir5', 'themol4', 'trendo5',
                    'undert4'
                ],
            ],
    },
    "L3_2_2-2": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['thosem3'],
                ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
                ['goodni5', 'postop2', 'boundl2'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'lynx',
                    'marP', 'moze', 'mish', 'nata', 'pela',
                    'qque', 'samp', 'serv', 'ssha', 'tyun',
                    'xuey', 'ykon',
                    'asecre3', 'aftert4', 'concer3', 'danced3',
                    'dayone6', 'dreams2', 'eyesof4', 'geniusr',
                    'indeli2', 'landau2', 'maketh4', 'memori4',
                    'onlysi3', 'perfec2', 'planet2', 'poised3',
                    'resolu6', 'shadow3', 'shared2', "subscr3",
                    'swordp1', 'thebir5', 'themol4', 'trendo5',
                    'undert4'
                ],
            ],
    },
    "L3_2_2-3": {
        "versionInfo": "3.2@1",
        "contents":
            [
                ['alongt4'],
                ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
                ['goodni5', 'postop2', 'boundl2'],
                ['arla', 'asta', 'dhen', 'gall', 'guin',
                    'hany', 'hert', 'hook', 'luka', 'lynx',
                    'marP', 'moze', 'mish', 'nata', 'pela',
                    'qque', 'samp', 'serv', 'ssha', 'tyun',
                    'xuey', 'ykon',
                    'asecre3', 'aftert4', 'concer3', 'danced3',
                    'dayone6', 'dreams2', 'eyesof4', 'geniusr',
                    'indeli2', 'landau2', 'maketh4', 'memori4',
                    'onlysi3', 'perfec2', 'planet2', 'poised3',
                    'resolu6', 'shadow3', 'shared2', "subscr3",
                    'swordp1', 'thebir5', 'themol4', 'trendo5',
                    'undert4'
                ],
            ],
    },
};


var ALL_WARP_POOLS = [];//盛放全部卡池代号："C3_1_2"...
var TOTAL_EVENT_WARPS = { ...CHARACTER_EVENT_WARPS, ...LIGHTCONE_EVENT_WARPS };

/**
 * 根据所选语言，更新卡池Sup的名字
 */
function refreshAllPoolSupCode() {
    ALL_CHARACTER_WARP_POOLS = Object.keys(CHARACTER_EVENT_WARPS);
    ALL_LIGHTCONE_WARP_POOLS = Object.keys(LIGHTCONE_EVENT_WARPS);
    ALL_WARP_POOLS = [...ALL_CHARACTER_WARP_POOLS, ...ALL_LIGHTCONE_WARP_POOLS];
    for (var i = 0; i < ALL_WARP_POOLS.length; i++) {
        ALL_WARP_POOLS[i] = {
            code: ALL_WARP_POOLS[i],
            upName: findItem(TOTAL_EVENT_WARPS[ALL_WARP_POOLS[i]]["contents"][0][0]).fullName[LANGUAGE]
        }
    }
}
refreshAllPoolSupCode();

function switchLanguage() {
    if (LANGUAGE == 'zh-CN') {
        LANGUAGE = 'en';
    } else {
        LANGUAGE = 'zh-CN';
    }
    refreshAllPoolSupCode();
    refreshFilterBoxDisplay();
    refreshPoolSelector(E_Form_CharacterPoolInput);
    refreshPoolSelector(P_Form_PFS);
}

/**
 * 为Sup,Scommon,Rup,Rcommon根据库存的卡池代号进行赋值
 * @param {string} poolName - 从TOTAL_EVENT_WARPS中选取的卡池代号
 * @returns 
 */
function selectPool(poolName) {
    if (TOTAL_EVENT_WARPS[poolName] == undefined) return;
    Sup = deepClone(TOTAL_EVENT_WARPS[poolName]["contents"][0]);
    Scommon = deepClone(TOTAL_EVENT_WARPS[poolName]["contents"][1]);
    Rup = deepClone(TOTAL_EVENT_WARPS[poolName]["contents"][2]);
    Rcommon = deepClone(TOTAL_EVENT_WARPS[poolName]["contents"][3]);
}