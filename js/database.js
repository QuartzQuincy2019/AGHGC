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
    //pfile;//Charaicon对应文件路径
    //wfile;//WishArtworks对应文件路径
    combatType;//角色属性
    path;//角色命途
    fullName;//全名

    p40;//40*40肖像
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
        this.p40 = './img/p40/' + this.code + '.png';
        //this.wfile = PATH_FULLWISH + 'w_' + this.name + '.png';
        this.combatType = combatType;
        this.path = path;
        this.fullName = fullName;
    }
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

var characterMap = {};//角色代号->角色对象
for (var i = 0; i < CHARACTER_LIST.length; i++) {//建立由角色代号到角色对象的映射
    var character = CHARACTER_LIST[i];
    characterMap[character.code] = character;
}

var CHARACTER_CODES = [];//所有角色的代号
for (var i = 0; i < CHARACTER_LIST.length; i++) {
    CHARACTER_CODES.push(CHARACTER_LIST[i].code);
}


var CHARACTER_EVENT_WARPS = {
    "5_1_3": [
        ['myde'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['arla', 'xuey', 'nata'],
        ['asta', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'ykon']
    ],
    "5_1_4": [
        ['hhuo'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['arla', 'xuey', 'nata'],
        ['asta', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'ykon']
    ]
}