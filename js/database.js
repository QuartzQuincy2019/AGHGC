// database.js
// 数据库。储存与游戏角色及属性、卡池配置相关信息。
// Jul.30 2025改版

/**
 * 仿枚举类型
 */
var CombatType = {
    physical: 0,
    fire: 1,
    ice: 2,
    lightning: 3,
    wind: 4,
    quantum: 5,
    imaginary: 6
}

var Path = {
    destruction: 0,
    thehunt: 1,
    erudition: 2,
    harmony: 3,
    nihility: 4,
    preservation: 5,
    abundance: 6,
    remembrance: 7
}

var PoolType = {
    Character: 0,
    LightCone: 1
}

var Party = {
    AstralExpress: 0,
    StellaronHunters: 1,
    HertaSpaceStation: 2,
    JariloVI: 3,
    XianzhouAlliance: 4,
    Penacony: 5,
    IPC: 6,
    Cosmic: 7,
    Amphoreus: 8,
    Collaboration: 98,
    Upcoming: 99
}



var CURRENT_POOLTYPE = PoolType.Character;

var STAR_NUMBER = [4, 5];

class Character {
    code;//角色识别名（不是英文名）
    star;//角色星数
    combatType;//角色属性
    path;//角色命途
    fullName;//全名
    icon;//40*40肖像
    artwork;//背景立绘
    portrait;//无背景立绘
    profile;//特殊头像
    params;//其他信息
    /**
     * 
     * @param {String} code 
     * @param {Number} star
     * @param {CombatType} combatType
     * @param {Path} path
     * @param {Object} fullName 
     */
    constructor(code, star, combatType, path, fullName, _params = {}) {
        this.code = code;
        this.star = star;
        this.icon = './img/p40/' + this.code + '.png';
        this.artwork = './img/aC/' + this.code + '.png';
        this.portrait = './img/port/' + this.code + '.png';
        this.profile = './img/prof5/' + this.code + '.png';
        this.combatType = combatType;
        this.path = path;
        this.fullName = fullName;
        this.params = _params;
    }
    get keywords() {
        var itemKg = new ItemKeywordsGenerator(this.code);
        return itemKg.getKeywords();
    }
}

class Lightcone {
    code;
    star;
    path;//命途
    fullName;//光锥名称
    params;
    icon;//74*74
    artwork;
    /**
     * 
     * @param {string} code 
     * @param {number} star 
     * @param {Path} path 
     * @param {object} fullName 
     */
    constructor(code, star, path, fullName, _params = {}) {
        this.code = code;
        this.star = star;
        this.icon = './img/lc74/' + this.code + '.png';
        this.artwork = './img/aL/' + this.code + '.png';
        this.path = path;
        this.fullName = fullName;
        this.params = _params;
    }
    get keywords() {
        var itemKg = new ItemKeywordsGenerator(this.code);
        return itemKg.getKeywords();
    }
}

class ItemKeywordsGenerator {
    itemCode;
    constructor(_itemCode) {
        this.itemCode = _itemCode;
    }
    getKeywords() {
        var item = findItem(this.itemCode);
        var kw = [];
        kw.push(this.itemCode);
        kw.push(item.fullName["en"]);
        if (item && item.params && item.params.alias) {
            for (const name of item.params.alias) {
                for (var i = 1; i < name.length + 1; i++) {
                    kw.push(name.slice(0, i));
                }
            }
        }
        for (const eachLanguage in lang) {
            const name = item.fullName[eachLanguage];
            if (!name.includes(" ")) {
                let word = deepClone(name);
                for (var i = 1; i < word.length + 1; i++) {
                    kw.push(word.slice(0, i));
                }
                word = word.toLowerCase();
                for (var i = 1; i < word.length + 1; i++) {
                    kw.push(word.slice(0, i));
                }
            } else {
                let list = name.split(" ");
                for (var singleWord of list) {
                    let word = deepClone(singleWord);
                    for (var i = 1; i < word.length + 1; i++) {
                        kw.push(word.slice(0, i));
                    }
                    word = word.toLowerCase();
                    for (var i = 1; i < word.length + 1; i++) {
                        kw.push(word.slice(0, i));
                    }
                }
            }
            kw.push(lang[eachLanguage]._Path[item.path]);
            var type = getItemType(item);
            switch (type) {
                case 'Character': kw.push(lang[eachLanguage].character);
                    break;
                case 'Lightcone': kw.push(lang[eachLanguage].lightcone);
                    break;
                default: throw new Error("ItemKeywordsGenerator: 未找到对应类型。");
            }
        }
        var s_kw = new Set(kw);
        return s_kw;
    }
}

function getItemType(item) {
    if (item instanceof Character) return 'Character';
    if (item instanceof Lightcone) return 'Lightcone';
    throw new Error("getItemType: " + item + "不属于Character或Lightcone");
}

class KeywordsGenerator {
    insdinctiveCode;
    itemCode;
    versionCode;
    get keywords() {
        var output = new Set();
        if (this.itemCode) {
            var item = findItem(this.itemCode);
            output = output.union(item.keywords);
            if (getItemType(item) == 'Character') {
                for (const eachLang in lang) {
                    output.add(lang[eachLang]._CombatType[item.combatType]);
                }
                output.add(lang[LANGUAGE].character);
                if (item && item.params && item.params.exclusiveLc) {
                    output = output.union(findItem(item.params.exclusiveLc).keywords);
                }
                output = output.union(item.keywords);
            }
            if (getItemType(item) == 'Lightcone') {
                output = output.union(item.keywords);
                output.add(lang[LANGUAGE].lightcone);
                for (const chara of CHARACTER_LIST) {
                    if (chara.params.exclusiveLc) {
                        if (chara.params.exclusiveLc == this.itemCode) {
                            output = output.union(chara.keywords);
                        }
                    }
                }
                output = output.union(item.keywords);
            }
        };
        if (this.versionCode) {
            let version = VERSIONS_SET[this.versionCode];
            output.add(version.mainVersion);
            let startDateMJD = version.dateStart;
            let endDateMJD = version.lastDate;
            for (var i = deepClone(startDateMJD); i <= endDateMJD; i++) {
                let str = MJDToDateString(i);
                output.add(str);
                output.add(str.slice(0, 7));
                output.add(str.slice(0, 4));
            }
        }
        if (this.insdinctiveCode) {
            output.add(this.insdinctiveCode);
        }
        return output;
    }
}

class Pool {
    code;
    versionInfo;//期限对应码
    type;
    contents;
    keywords = new Set();
    constructor(_code, _versionInfo, _type, _contents) {
        this.code = _code;
        this.versionInfo = _versionInfo;
        if (_type === 'character') this.type = PoolType.Character;
        if (_type === 'lightcone') this.type = PoolType.LightCone;
        this.contents = _contents;
        let kg = new KeywordsGenerator();
        kg.itemCode = this.contents()[0][0];
        kg.versionCode = this.versionInfo;
        kg.insdinctiveCode = this.code;
        this.keywords = kg.keywords;
    }
    getInfo() {
        let text = "";
        text = lang[LANGUAGE].poolCode + ": " + this.code
            + " || " + lang[LANGUAGE].versionInfo + ": " + this.versionInfo + "(" + VERSIONS_SET[this.versionInfo].versionTitle[LANGUAGE] + ")"
            + " || " + MJDToDateString(VERSIONS_SET[this.versionInfo].dateStart) + " ~ " + MJDToDateString(VERSIONS_SET[this.versionInfo].lastDate)
            + " || " + "Up: " + findItem(this.contents()[0][0]).fullName[LANGUAGE];
        return text;
    }

    getFirstDateMjd() {
        return VERSIONS_SET[this.versionInfo].dateStart;
    }

    getLastDateMjd() {
        return VERSIONS_SET[this.versionInfo].lastDate;
    }

    getLastDateString() {
        return MJDToDateString(VERSIONS_SET[this.versionInfo].lastDate);
    }
}

function refreshPoolKeywords(pool) {
    let kg = new KeywordsGenerator();
    kg.itemCode = pool.contents()[0][0];
    kg.versionCode = pool.versionInfo;
    kg.insdinctiveCode = pool.code;
    pool.keywords = kg.keywords;
}

var CHARACTER_LIST = [
    new Character("c000", 4, CombatType.physical, Path.destruction,
        { "zh-CN": "四星陪跑", "en": "4*Up", "jp": "4*Up" },
        { "type": "placeholder" }),
    new Character("c001", 5, CombatType.physical, Path.destruction,
        { "zh-CN": "未定五星", "en": "5*Up", "jp": "5*Up" },
        { "type": "placeholder" }),
    //1.0
    new Character("arla", 4, CombatType.lightning, Path.destruction,
        { "zh-CN": "阿兰", "en": "Arlan", "jp": "アーラン" },
        { "party": Party.HertaSpaceStation }),
    new Character("asta", 4, CombatType.fire, Path.harmony,
        { "zh-CN": "艾丝妲", "en": "Asta", "jp": "アスター" },
        { "party": Party.HertaSpaceStation }),
    new Character("bail", 5, CombatType.lightning, Path.abundance,
        { "zh-CN": "白露", "en": "Bailu", "jp": "白露" },
        { "exclusiveLc": "timewa5", "party": Party.XianzhouAlliance }),
    new Character("bron", 5, CombatType.wind, Path.harmony,
        { "zh-CN": "布洛妮娅", "en": "Bronya", "jp": "ブローニャ" },
        { "exclusiveLc": "butthe5", "alias": ["鸭", "大鸭鸭"], "party": Party.JariloVI }),
    new Character("clar", 5, CombatType.physical, Path.destruction,
        { "zh-CN": "克拉拉", "en": "Clara", "jp": "クラーラ" },
        { "exclusiveLc": "someth2", "party": Party.JariloVI }),
    new Character("dhen", 4, CombatType.wind, Path.thehunt,
        { "zh-CN": "丹恒", "en": "Dan Heng", "jp": "丹恒" },
        { "party": Party.AstralExpress }),
    new Character("gepa", 5, CombatType.ice, Path.preservation,
        { "zh-CN": "杰帕德", "en": "Gepard", "jp": "ジェパード" },
        { "exclusiveLc": "moment3", "party": Party.JariloVI }),
    new Character("hert", 4, CombatType.ice, Path.erudition,
        { "zh-CN": "黑塔", "en": "Herta", "jp": "ヘルタ" },
        { "party": Party.HertaSpaceStation }),
    new Character("hime", 5, CombatType.fire, Path.erudition,
        { "zh-CN": "姬子", "en": "Himeko", "jp": "姫子" },
        { "exclusiveLc": "nighto5", "party": Party.AstralExpress }),
    new Character("hook", 4, CombatType.fire, Path.destruction,
        { "zh-CN": "虎克", "en": "Hook", "jp": "フック" },
        { "party": Party.JariloVI }),
    new Character("jyua", 5, CombatType.lightning, Path.erudition,
        { "zh-CN": "景元", "en": "Jing Yuan", "jp": "景元" },
        { "exclusiveLc": "before2", "alias": ["将军", "牢景"], "party": Party.XianzhouAlliance }),
    new Character("marP", 4, CombatType.ice, Path.preservation,
        { "zh-CN": "三月七", "en": "March 7th", "jp": "三月なのか" },
        { "party": Party.AstralExpress }),
    new Character("nata", 4, CombatType.physical, Path.abundance,
        { "zh-CN": "娜塔莎", "en": "Natasha", "jp": "ナターシャ" },
        { "party": Party.JariloVI }),
    new Character("pela", 4, CombatType.ice, Path.nihility,
        { "zh-CN": "佩拉", "en": "Pela", "jp": "ペラ" },
        { "party": Party.JariloVI }),
    new Character("qque", 4, CombatType.quantum, Path.erudition,
        { "zh-CN": "青雀", "en": "Qingque", "jp": "青雀" },
        { "party": Party.XianzhouAlliance }),
    new Character("samp", 4, CombatType.wind, Path.nihility,
        { "zh-CN": "桑博", "en": "Sampo", "jp": "サンポ" },
        { "party": Party.JariloVI }),
    new Character("seel", 5, CombatType.quantum, Path.thehunt,
        { "zh-CN": "希儿", "en": "Seele", "jp": "ゼーレ" },
        { "exclusiveLc": "inthen3", "alias": ["希尔", "西尔"], "party": Party.JariloVI }),
    new Character("serv", 4, CombatType.lightning, Path.erudition,
        { "zh-CN": "希露瓦", "en": "Serval", "jp": "セーバル" },
        { "party": Party.JariloVI }),
    new Character("ssha", 4, CombatType.physical, Path.thehunt,
        { "zh-CN": "素裳", "en": "Sushang", "jp": "素裳" },
        { "party": Party.XianzhouAlliance }),
    new Character("tyun", 4, CombatType.lightning, Path.harmony,
        { "zh-CN": "停云", "en": "Tingyun", "jp": "停雲" },
        { "party": Party.XianzhouAlliance }),
    new Character("welt", 5, CombatType.imaginary, Path.nihility,
        { "zh-CN": "瓦尔特", "en": "Welt", "jp": "ヴェルト" },
        { "exclusiveLc": "inthen6", "alias": ["杨叔"], "party": Party.AstralExpress }),
    new Character("yqin", 5, CombatType.ice, Path.thehunt,
        { "zh-CN": "彦卿", "en": "Yanqing", "jp": "彦卿" },
        { "exclusiveLc": "sleepl4", "party": Party.XianzhouAlliance }),
    //1.1
    new Character("lcha", 5, CombatType.imaginary, Path.abundance,
        { "zh-CN": "罗刹", "en": "Luocha", "jp": "羅刹" },
        { "exclusiveLc": "echoes4", "party": Party.XianzhouAlliance }),
    new Character("swol", 5, CombatType.quantum, Path.nihility,
        { "zh-CN": "银狼", "en": "Silver Wolf", "jp": "銀狼" },
        { "exclusiveLc": "incess2", "party": Party.StellaronHunters }),
    new Character("ykon", 4, CombatType.imaginary, Path.harmony,
        { "zh-CN": "驭空", "en": "Yukong", "jp": "御空" },
        { "party": Party.XianzhouAlliance }),
    //1.2
    new Character("blad", 5, CombatType.wind, Path.destruction,
        { "zh-CN": "刃", "en": "Blade", "jp": "刃" },
        { "exclusiveLc": "theunr3", "alias": ["牢刃", "应星"], "party": Party.StellaronHunters }),
    new Character("kafk", 5, CombatType.lightning, Path.nihility,
        { "zh-CN": "卡芙卡", "en": "Kafka", "jp": "カフカ" },
        { "exclusiveLc": "patien5", "alias": ["卡妈", "卡夫卡"], "party": Party.StellaronHunters }),
    new Character("luka", 4, CombatType.physical, Path.nihility,
        { "zh-CN": "卢卡", "en": "Luka", "jp": "ルカ" },
        { "party": Party.JariloVI }),
    //1.3
    new Character("dhil", 5, CombatType.imaginary, Path.destruction,
        { "zh-CN": "丹恒·饮月", "en": "Dan Heng • Imbibitor Lunae", "jp": "丹恒・飲月" },
        { "exclusiveLc": "bright4", "alias": ["饮月君", "丹恒饮月", "sp丹恒", "SP丹恒", "饮月", "青龙", "小青龙", "DHIL", "dhil", "IL", "il"], "party": Party.XianzhouAlliance }),
    new Character("fxua", 5, CombatType.quantum, Path.preservation,
        { "zh-CN": "符玄", "en": "Fu Xuan", "jp": "符玄" },
        { "exclusiveLc": "shealr5", "alias": ["太卜", "傅玄", "福玄"], "party": Party.XianzhouAlliance }),
    new Character("lynx", 4, CombatType.quantum, Path.abundance,
        { "zh-CN": "玲可", "en": "Lynx", "jp": "リンクス" },
        { "party": Party.JariloVI }),
    //1.4
    new Character("guin", 4, CombatType.fire, Path.nihility,
        { "zh-CN": "桂乃芬", "en": "Guinaifen", "jp": "桂乃芬" },
        { "party": Party.XianzhouAlliance }),
    new Character("jliu", 5, CombatType.ice, Path.destruction,
        { "zh-CN": "镜流", "en": "Jingliu", "jp": "鏡流" },
        { "exclusiveLc": "ishall6", "party": Party.XianzhouAlliance }),
    new Character("tonu", 5, CombatType.fire, Path.thehunt,
        { "zh-CN": "托帕&账账", "en": "Topaz & Numby", "jp": "トパーズ＆カブ" },
        { "exclusiveLc": "worris2", "party": Party.IPC }),
    //1.5
    new Character("arge", 5, CombatType.physical, Path.erudition,
        { "zh-CN": "银枝", "en": "Argenti", "jp": "アルジェンティ" },
        { "exclusiveLc": "aninst5", "party": Party.Cosmic }),
    new Character("hany", 4, CombatType.physical, Path.harmony,
        { "zh-CN": "寒鸦", "en": "Hanya", "jp": "寒鴉" },
        { "party": Party.XianzhouAlliance }),
    new Character("hhuo", 5, CombatType.wind, Path.abundance,
        { "zh-CN": "藿藿", "en": "Huohuo", "jp": "フォフォ" },
        { "exclusiveLc": "nighto3", "party": Party.XianzhouAlliance }),
    //1.6
    new Character("rati", 5, CombatType.imaginary, Path.thehunt,
        { "zh-CN": "真理医生", "en": "Dr.Ratio", "jp": "Dr.レイシオ" },
        { "exclusiveLc": "baptis4", "alias": ["义父"], "party": Party.Cosmic }),
    new Character("rmei", 5, CombatType.ice, Path.harmony,
        { "zh-CN": "阮·梅", "en": "Ruan Mei", "jp": "ルアン・メェイ" },
        { "exclusiveLc": "pastse4", "alias": ["阮梅"], "party": Party.HertaSpaceStation }),
    new Character("xuey", 4, CombatType.quantum, Path.destruction,
        { "zh-CN": "雪衣", "en": "Xueyi", "jp": "雪衣" },
        { "party": Party.XianzhouAlliance }),
    //2.0
    new Character("blsw", 5, CombatType.wind, Path.nihility,
        { "zh-CN": "黑天鹅", "en": "Black Swan", "jp": "ブラックスワン" },
        { "exclusiveLc": "reforg2", "alias": ["出手女", "于是我出手了"], "party": Party.Cosmic }),
    new Character("mish", 4, CombatType.ice, Path.destruction,
        { "zh-CN": "米沙", "en": "Misha", "jp": "ミーシャ" },
        { "party": Party.Penacony }),
    new Character("spar", 5, CombatType.quantum, Path.harmony,
        { "zh-CN": "花火", "en": "Sparkle", "jp": "花火" },
        { "exclusiveLc": "earthl2", "party": Party.Cosmic }),
    //2.1
    new Character("ache", 5, CombatType.lightning, Path.nihility,
        { "zh-CN": "黄泉", "en": "Acheron", "jp": "黄泉" },
        { "exclusiveLc": "alongt4", "party": Party.Cosmic }),
    new Character("aven", 5, CombatType.imaginary, Path.preservation,
        { "zh-CN": "砂金", "en": "Aventurine", "jp": "アベンチュリン" },
        { "exclusiveLc": "inhere3", "party": Party.IPC }),
    new Character("gall", 4, CombatType.fire, Path.abundance,
        { "zh-CN": "加拉赫", "en": "Gallagher", "jp": "ギャラガー" },
        { "party": Party.Penacony }),
    //2.2
    new Character("boot", 5, CombatType.physical, Path.thehunt,
        { "zh-CN": "波提欧", "en": "Boothill", "jp": "ブートヒル" },
        { "exclusiveLc": "saling5", "alias": ["牛仔"], "party": Party.Cosmic }),
    new Character("robi", 5, CombatType.physical, Path.harmony,
        { "zh-CN": "知更鸟", "en": "Robin", "jp": "ロビン" },
        { "exclusiveLc": "flowin2", "alias": ["鸟", "牢鸟"], "party": Party.Penacony }),
    //2.3
    new Character("fire", 5, CombatType.fire, Path.destruction,
        { "zh-CN": "流萤", "en": "Firefly", "jp": "ホタル" },
        { "exclusiveLc": "wherea4", "party": Party.StellaronHunters }),
    new Character("jade", 5, CombatType.quantum, Path.erudition,
        { "zh-CN": "翡翠", "en": "Jade", "jp": "ジェイド" },
        { "exclusiveLc": "yethop4", "party": Party.IPC }),
    //2.4
    new Character("jqiu", 5, CombatType.fire, Path.nihility,
        { "zh-CN": "椒丘", "en": "Jiaoqiu", "jp": "椒丘" },
        { "exclusiveLc": "thosem3", "party": Party.XianzhouAlliance }),
    new Character("marH", 4, CombatType.imaginary, Path.thehunt,
        { "zh-CN": "三月七", "en": "March 7th", "jp": "三月なのか" },
        { "party": Party.AstralExpress }),
    new Character("yunl", 5, CombatType.physical, Path.destruction,
        { "zh-CN": "云璃", "en": "Yunli", "jp": "雲璃" },
        { "exclusiveLc": "dancea3", "party": Party.XianzhouAlliance }),
    //2.5
    new Character("fxia", 5, CombatType.wind, Path.thehunt,
        { "zh-CN": "飞霄", "en": "Feixiao", "jp": "飛霄" },
        { "exclusiveLc": "iventu5", "alias": ["飞宵", "将军", "天击将军"], "party": Party.XianzhouAlliance }),
    new Character("lsha", 5, CombatType.fire, Path.abundance,
        { "zh-CN": "灵砂", "en": "Lingsha", "jp": "霊砂" },
        { "exclusiveLc": "scenta4", "alias": ["菱纱", "灵沙"], "party": Party.XianzhouAlliance }),
    new Character("moze", 4, CombatType.lightning, Path.thehunt,
        { "zh-CN": "貊泽", "en": "Moze", "jp": "モゼ" },
        { "party": Party.XianzhouAlliance }),
    //2.6
    new Character("rapp", 5, CombatType.imaginary, Path.erudition,
        { "zh-CN": "乱破", "en": "Rappa", "jp": "乱破" },
        { "exclusiveLc": "ninjut4", "party": Party.Cosmic }),
    //2.7
    new Character("fugu", 5, CombatType.fire, Path.nihility,
        { "zh-CN": "忘归人", "en": "Fugue", "jp": "帰忘の流離人" },
        { "exclusiveLc": "longro4", "alias": ["大停云", "sp停云", "SP停云"], "party": Party.XianzhouAlliance }),
    new Character("sund", 5, CombatType.imaginary, Path.harmony,
        { "zh-CN": "星期日", "en": "Sunday", "jp": "サンデー" },
        { "exclusiveLc": "agroun3", "alias": ["周天哥", "周天子", "牢日"], "party": Party.Cosmic }),
    //3.0
    new Character("agla", 5, CombatType.lightning, Path.remembrance,
        { "zh-CN": "阿格莱雅", "en": "Aglaea", "jp": "アグライア" },
        { "exclusiveLc": "timewo4", "alias": ["阿雅", "Agly", "agly"], "party": Party.Amphoreus }),
    new Character("ther", 5, CombatType.ice, Path.erudition,
        { "zh-CN": "大黑塔", "en": "The Herta", "jp": "マダム・ヘルタ" },
        { "exclusiveLc": "intoth4", "party": Party.HertaSpaceStation }),
    //3.1
    new Character("myde", 5, CombatType.imaginary, Path.destruction,
        { "zh-CN": "万敌", "en": "Mydei", "jp": "モーディス" },
        { "exclusiveLc": "flameo6", "party": Party.Amphoreus }),
    new Character("trib", 5, CombatType.quantum, Path.harmony,
        { "zh-CN": "缇宝", "en": "Tribbie", "jp": "トリビー" },
        { "exclusiveLc": "iftime5", "alias": ["提宝", "题宝"], "party": Party.Amphoreus }),
    //3.2
    new Character("cast", 5, CombatType.quantum, Path.remembrance,
        { "zh-CN": "遐蝶", "en": "Castorice", "jp": "キャストリス" },
        { "exclusiveLc": "makefa4", "alias": ["蝶", "霞蝶", "瑕蝶"], "party": Party.Amphoreus }),
    new Character("anax", 5, CombatType.wind, Path.erudition,
        { "zh-CN": "那刻夏", "en": "Anaxa", "jp": "アナイクス" },
        { "exclusiveLc": "lifesh6", "party": Party.Amphoreus }),
    //3.3
    new Character("hyac", 5, CombatType.wind, Path.remembrance,
        { "zh-CN": "风堇", "en": "Hyacine", "jp": "ヒアンシー" },
        { "exclusiveLc": "longma6", "alias": ["风宝"], "party": Party.Amphoreus }),
    new Character("ciph", 5, CombatType.quantum, Path.nihility,
        { "zh-CN": "赛飞儿", "en": "Cipher", "jp": "サフェル" },
        { "exclusiveLc": "liesda5", "alias": ["飞儿", "赛菲尔", "赛菲儿", "赛飞尔", "塞飞尔", "塞菲尔", "Cifera", "cifera", "cifra"], "party": Party.Amphoreus }),
    //3.4
    new Character("phai", 5, CombatType.physical, Path.destruction,
        { "zh-CN": "白厄", "en": "Phainon", "jp": "ファイノン" },
        { "exclusiveLc": "thusbu4", "alias": ["小白", "白垩", "拜厄", "卡俄斯", "卡厄斯", "卡厄斯兰那", "Khaslana", "khaslana"], "party": Party.Amphoreus }),
    new Character("sabe", 5, CombatType.wind, Path.destruction,
        { "zh-CN": "Saber", "en": "Saber", "jp": "セイバー" },
        { "exclusiveLc": "athank3", "party": Party.Collaboration }),
    new Character("arch", 5, CombatType.quantum, Path.thehunt,
        { "zh-CN": "Archer", "en": "Archer", "jp": "アーチャー" },
        { "exclusiveLc": "thehel5", "party": Party.Collaboration }),
    //3.5
    new Character("hysi", 5, CombatType.physical, Path.nihility,
        { "zh-CN": "海瑟音", "en": "Hysilens", "jp": "セイレンス" },
        { "exclusiveLc": "whydoe5", "party": Party.Amphoreus }),
    new Character("cery", 5, CombatType.wind, Path.harmony,
        { "zh-CN": "刻律德菈", "en": "Cerydra", "jp": "ケリュドラ" },
        { "exclusiveLc": "epoche5", "alias": ["凯撒", "恺撒", "女皇", "Caesar", "caesar"], "party": Party.Amphoreus }),
    //3.6
    new Character("ever", 5, CombatType.ice, Path.remembrance,
        { "zh-CN": "长夜月", "en": "Evernight", "jp": "長夜月" },
        { "exclusiveLc": "toever3", "alias": ["sp三月七", "SP三月七", "伞月七", "黑三月七", "Darch", "darch", "长月夜"], "party": Party.Amphoreus }),
    new Character("dhpt", 5, CombatType.physical, Path.preservation,
        { "zh-CN": "丹恒·腾荒", "en": "Dan Heng • Permansor Terrae", "jp": "丹恒・騰荒" },
        { "exclusiveLc": "though3", "alias": ["sp丹恒", "SP丹恒", "丹恒腾荒", "腾荒", "蛋黄", "盾丹", "荒丹", "腾丹", "DHPT", "dhpt", "PT", "pt"], "party": Party.Amphoreus }),
    //3.7
    new Character("cyre", 5, CombatType.ice, Path.remembrance,
        { "zh-CN": "昔涟", "en": "Cyrene", "jp": "キュレネ" },
        { "exclusiveLc": "thislo3", "alias": ["大昔涟", "牢大", "PhiLia093", "爱莉希雅", "Elysia", "elysia"], "party": Party.Amphoreus }),
    //3.8
    new Character("dahl", 5, CombatType.fire, Path.nihility,
        { "zh-CN": "大丽花", "en": "The Dahlia", "jp": "ダリア" },
        { "alias": ["康士坦丝", "Constance", "コンスタンス"], "party": Party.Upcoming }),
];

var LIGHTCONE_LIST = [
    new Lightcone("l000000", 4, Path.destruction,
        { "zh-CN": "四星陪跑", "en": "4*Up", "jp": "4*Up" },
        { "type": "placeholder" }),
    new Lightcone("NOTAVAI", 4, Path.destruction,
        { "zh-CN": "不可用", "en": "Not Available", "jp": "利用不可" },
        { "type": "placeholder" }),
    // 4 stars
    new Lightcone("aftert4", 4, Path.erudition,
        { "zh-CN": "谐乐静默之后", "en": "After the Charmony Fall", "jp": "調和が沈黙した後" }),
    new Lightcone("asecre3", 4, Path.destruction,
        { "zh-CN": "秘密誓心", "en": "A Secret Vow", "jp": "秘密の誓い" }),
    new Lightcone("boundl2", 4, Path.nihility,
        { "zh-CN": "无边曼舞", "en": "Boundless Choreo", "jp": "終わりなき舞踏" }),
    new Lightcone("concer3", 4, Path.preservation,
        { "zh-CN": "两个人的演唱会", "en": "Concert for Two", "jp": "二人だけのコンサート" }),
    new Lightcone("danced3", 4, Path.harmony,
        { "zh-CN": "舞！舞！舞！", "en": "Dance! Dance! Dance!", "jp": "ダンス！ダンス！ダンス！" }),
    new Lightcone("dayone6", 4, Path.preservation,
        { "zh-CN": "余生的第一天", "en": "Day One of My New Life", "jp": "余生の初日" }),
    new Lightcone("dreams2", 4, Path.abundance,
        { "zh-CN": "梦的蒙太奇", "en": "Dream's Montage", "jp": "夢のモンタージュ" }),
    new Lightcone("eyesof4", 4, Path.nihility,
        { "zh-CN": "猎物的视线", "en": "Eyes of the Prey", "jp": "獲物の視線" }),
    new Lightcone("geniusr", 4, Path.erudition,
        { "zh-CN": "天才们的休憩", "en": "Geniuses' Repose", "jp": "天才たちの休息" }),
    new Lightcone("goodni5", 4, Path.nihility,
        { "zh-CN": "晚安与睡颜", "en": "Good Night and Sleep Well", "jp": "おやすみなさいと寝顔" }),
    new Lightcone("indeli2", 4, Path.destruction,
        { "zh-CN": "铭记于心的约定", "en": "Indelible Promise", "jp": "心に刻まれた約束" }),
    new Lightcone("landau2", 4, Path.preservation,
        { "zh-CN": "朗道的选择", "en": "Landau's Choice", "jp": "ランドゥーの選択" }),
    new Lightcone("maketh4", 4, Path.erudition,
        { "zh-CN": "别让世界静下来", "en": "Make the World Clamor", "jp": "この世界に喧噪を" }),
    new Lightcone("memori4", 4, Path.harmony,
        { "zh-CN": "记忆中的模样", "en": "Memories of the Past", "jp": "記憶の中の姿" }),
    new Lightcone("onlysi3", 4, Path.thehunt,
        { "zh-CN": "唯有沉默", "en": "Only Silence Remains", "jp": "沈黙のみ" }),
    new Lightcone("perfec2", 4, Path.abundance,
        { "zh-CN": "此时恰好", "en": "Perfect Timing", "jp": "今が丁度" }),
    new Lightcone("planet2", 4, Path.harmony,
        { "zh-CN": "与行星相会", "en": "Planetary Rendezvous", "jp": "惑星との出会い" }),
    new Lightcone("poised3", 4, Path.harmony,
        { "zh-CN": "芳华待灼", "en": "Poised to Bloom", "jp": "美しき華よ今咲かん" }),
    new Lightcone("postop2", 4, Path.abundance,
        { "zh-CN": "一场术后对话", "en": "Post-Op Conversation", "jp": "手術後の会話" }),
    new Lightcone("resolu6", 4, Path.nihility,
        { "zh-CN": "决心如汗珠般闪耀", "en": "Resolution Shines As Pearls of Sweat", "jp": "決意は汗のように輝く" }),
    new Lightcone("shadow3", 4, Path.thehunt,
        { "zh-CN": "黑夜如影随行", "en": "Shadowed by Night", "jp": "夜は影のように付き纏う" }),
    new Lightcone("shared2", 4, Path.abundance,
        { "zh-CN": "同一种心情", "en": "Shared Feeling", "jp": "同じ気持ち" }),
    new Lightcone("subscr3", 4, Path.thehunt,
        { "zh-CN": "点个关注吧！", "en": "Subscribe for More!", "jp": "フォローして！" }),
    new Lightcone("swordp1", 4, Path.thehunt,
        { "zh-CN": "论剑", "en": "Swordplay", "jp": "論剣" }),
    new Lightcone("thebir5", 4, Path.erudition,
        { "zh-CN": "「我」的诞生", "en": "The Birth of the Self", "jp": "「私」の誕生" }),
    new Lightcone("themol4", 4, Path.destruction,
        { "zh-CN": "鼹鼠党欢迎你", "en": "The Moles Welcome You", "jp": "モグラ党へようこそ" }),
    new Lightcone("thesto4", 4, Path.remembrance,
        { "zh-CN": "故事的下一页", "en": "The Story's Next Page", "jp": "物語をめくって" }),
    new Lightcone("trendo5", 4, Path.preservation,
        { "zh-CN": "宇宙市场趋势", "en": "Trend of the Universal Market", "jp": "星間市場のトレンド" }),
    new Lightcone("undert4", 4, Path.destruction,
        { "zh-CN": "在蓝天下", "en": "Under the Blue Sky", "jp": "青空の下で" }),
    new Lightcone("geniusg", 4, Path.remembrance,
        { "zh-CN": "天才们的问候", "en": "Geniuses' Greetings", "jp": "天才たちの「挨拶」" }),
    //5 stars
    new Lightcone("agroun3", 5, Path.harmony,
        { "zh-CN": "回到大地的飞行", "en": "A Grounded Ascent", "jp": "大地より天を目指して" }),
    new Lightcone("alongt4", 5, Path.nihility,
        { "zh-CN": "行于流逝的岸", "en": "Along the Passing Shore", "jp": "流れ逝く岸を歩いて" }),
    new Lightcone("aninst5", 5, Path.erudition,
        { "zh-CN": "片刻，留在眼底", "en": "An Instant Before A Gaze", "jp": "その一刻、目に焼き付けて" }),
    new Lightcone("athank3", 5, Path.destruction,
        { "zh-CN": "没有回报的加冕", "en": "A Thankless Coronation", "jp": "報われぬ戴冠" }),
    new Lightcone("baptis4", 5, Path.thehunt,
        { "zh-CN": "纯粹思维的洗礼", "en": "Baptism of Pure Thought", "jp": "純粋なる思惟の洗礼" }),
    new Lightcone("before2", 5, Path.erudition,
        { "zh-CN": "拂晓之前", "en": "Before Dawn", "jp": "夜明け前" }),
    new Lightcone("bright4", 5, Path.destruction,
        { "zh-CN": "比阳光更明亮的", "en": "Brighter Than the Sun", "jp": "陽光より輝くもの" }),
    new Lightcone("butthe5", 5, Path.harmony,
        { "zh-CN": "但战斗还未结束", "en": "But the Battle Isn't Over", "jp": "だが戦争は終わらない" }),
    new Lightcone("dancea3", 5, Path.destruction,
        { "zh-CN": "落日时起舞", "en": "Dance at Sunset", "jp": "夕日に舞う" }),
    new Lightcone("earthl2", 5, Path.harmony,
        { "zh-CN": "游戏尘寰", "en": "Earthly Escapade", "jp": "人生は遊び" }),
    new Lightcone("echoes4", 5, Path.abundance,
        { "zh-CN": "棺的回响", "en": "Echoes of the Coffin", "jp": "棺のこだま" }),
    new Lightcone("epoche5", 5, Path.harmony,
        { "zh-CN": "金血铭刻的时代", "en": "Epoch Etched in Golden Blood", "jp": "黄金の血で刻む時代" }),
    new Lightcone("flameo6", 5, Path.destruction,
        { "zh-CN": "血火啊，燃烧前路", "en": "Flame of Blood, Blaze My Path", "jp": "前途燃やす血の如き炎" }),
    new Lightcone("flowin2", 5, Path.harmony,
        { "zh-CN": "夜色流光溢彩", "en": "Flowing Nightglow", "jp": "光あふれる夜" }),
    new Lightcone("iftime5", 5, Path.harmony,
        { "zh-CN": "如果时间是一朵花", "en": "If Time Were a Flower", "jp": "もしも時が花だったら" }),
    new Lightcone("incess2", 5, Path.nihility,
        { "zh-CN": "雨一直下", "en": "Incessant Rain", "jp": "降りやまぬ雨" }),
    new Lightcone("inhere3", 5, Path.preservation,
        { "zh-CN": "命运从未公平", "en": "Inherently Unjust Destiny", "jp": "運命は常に不公平" }),
    new Lightcone("inthen6", 5, Path.nihility,
        { "zh-CN": "以世界之名", "en": "In the Name of the World", "jp": "世界の名を以て" }),
    new Lightcone("inthen3", 5, Path.thehunt,
        { "zh-CN": "于夜色中", "en": "In the Night", "jp": "夜の帳の中で" }),
    new Lightcone("intoth4", 5, Path.erudition,
        { "zh-CN": "向着不可追问处", "en": "Into the Unreachable Veil", "jp": "触れてはならぬ領域へ" }),
    new Lightcone("ishall6", 5, Path.destruction,
        { "zh-CN": "此身为剑", "en": "I Shall Be My Own Sword", "jp": "この身は剣なり" }),
    new Lightcone("iventu5", 5, Path.thehunt,
        { "zh-CN": "我将，巡征追猎", "en": "I Venture Forth to Hunt", "jp": "我が征く巡狩の道" }),
    new Lightcone("liesda5", 5, Path.nihility,
        { "zh-CN": "谎言在风中飘扬", "en": "Lies Dance on the Breeze", "jp": "風に揺蕩う虚言" }),
    new Lightcone("lifesh6", 5, Path.erudition,
        { "zh-CN": "生命当付之一炬", "en": "Life Should Be Cast to Flames", "jp": "生命、焼滅すべし" }),
    new Lightcone("longma6", 5, Path.remembrance,
        { "zh-CN": "愿虹光永驻天空", "en": "Long May Rainbows Adorn the Sky", "jp": "空の虹が消えぬように" }),
    new Lightcone("longro4", 5, Path.nihility,
        { "zh-CN": "长路终有归途", "en": "Long Road Leads Home", "jp": "長途はやがて帰途へと続く" }),
    new Lightcone("makefa4", 5, Path.remembrance,
        { "zh-CN": "让告别，更美一些", "en": "Make Farewells More Beautiful", "jp": "永訣よ美しくあれ" }),
    new Lightcone("moment3", 5, Path.preservation,
        { "zh-CN": "制胜的瞬间", "en": "Moment of Victory", "jp": "勝利の刹那" }),
    new Lightcone("nighto3", 5, Path.abundance,
        { "zh-CN": "惊魂夜", "en": "Night of Fright", "jp": "驚魂の夜" }),
    new Lightcone("nighto5", 5, Path.erudition,
        { "zh-CN": "银河铁道之夜", "en": "Night on the Milky Way", "jp": "銀河鉄道の夜" }),
    new Lightcone("ninjut4", 5, Path.erudition,
        { "zh-CN": "忍法帖•缭乱破魔", "en": "Ninjutsu Inscription: Dazzling Evilbreaker", "jp": "忍法帖・繚乱破魔" }),
    new Lightcone("pastse4", 5, Path.harmony,
        { "zh-CN": "镜中故我", "en": "Past Self in Mirror", "jp": "鏡の中の私" }),
    new Lightcone("patien5", 5, Path.nihility,
        { "zh-CN": "只需等待", "en": "Patience Is All You Need", "jp": "待つのみ" }),
    new Lightcone("reforg2", 5, Path.nihility,
        { "zh-CN": "重塑时光之忆", "en": "Reforged Remembrance", "jp": "時間の記憶を再構築して" }),
    new Lightcone("saling5", 5, Path.thehunt,
        { "zh-CN": "驶向第二次生命", "en": "Sailing Towards a Second Life", "jp": "二度目の生に向かって" }),
    new Lightcone("scenta4", 5, Path.abundance,
        { "zh-CN": "唯有香如故", "en": "Scent Alone Stays True", "jp": "昔日の香りは今も猶" }),
    new Lightcone("shealr5", 5, Path.preservation,
        { "zh-CN": "她已闭上双眼", "en": "She Already Shut Her Eyes", "jp": "閉ざした瞳" }),
    new Lightcone("sleepl4", 5, Path.thehunt,
        { "zh-CN": "如泥酣眠", "en": "Sleep Like the Dead", "jp": "泥の如き眠り" }),
    new Lightcone("someth2", 5, Path.destruction,
        { "zh-CN": "无可取代的东西", "en": "Something Irreplaceable", "jp": "かけがえのないもの" }),
    new Lightcone("thehel5", 5, Path.thehunt,
        { "zh-CN": "理想燃烧的地狱", "en": "The Hell Where Ideals Burn", "jp": "理想を焼く奈落で" }),
    new Lightcone("theunr3", 5, Path.destruction,
        { "zh-CN": "到不了的彼岸", "en": "The Unreachable Side", "jp": "着かない彼岸" }),
    new Lightcone("thislo3", 5, Path.remembrance,
        { "zh-CN": "爱如此刻永恒", "en": "This Love, Forever", "jp": "愛は永遠の今" }),
    new Lightcone("thosem3", 5, Path.nihility,
        { "zh-CN": "那无数个春天", "en": "Those Many Springs", "jp": "幾度目かの春" }),
    new Lightcone("though3", 5, Path.preservation,
        { "zh-CN": "纵然山河万程", "en": "Though Worlds Apart", "jp": "万里の山河を越えて" }),
    new Lightcone("thusbu4", 5, Path.destruction,
        { "zh-CN": "黎明恰如此燃烧", "en": "Thus Burns the Dawn", "jp": "燃え盛る黎明のように" }),
    new Lightcone("timewa5", 5, Path.abundance,
        { "zh-CN": "时节不居", "en": "Time Waits for No One", "jp": "時節は居らず" }),
    new Lightcone("timewo4", 5, Path.remembrance,
        { "zh-CN": "将光阴织成黄金", "en": "Time Woven Into Gold", "jp": "光陰を織り黄金と成す" }),
    new Lightcone("toever3", 5, Path.remembrance,
        { "zh-CN": "致长夜的星光", "en": "To Evernight's Stars", "jp": "長き夜に光る星へ" }),
    new Lightcone("wherea4", 5, Path.destruction,
        { "zh-CN": "梦应归于何处", "en": "Whereabouts Should Dreams Rest", "jp": "夢が帰り着く場所" }),
    new Lightcone("whydoe5", 5, Path.nihility,
        { "zh-CN": "海洋为何而歌", "en": "Why Does the Ocean Sing", "jp": "海の歌は何がため" }),
    new Lightcone("worris2", 5, Path.thehunt,
        { "zh-CN": "烦恼着，幸福着", "en": "Worrisome, Blissful", "jp": "悩んで笑って" }),
    new Lightcone("yethop4", 5, Path.erudition,
        { "zh-CN": "偏偏希望无价", "en": "Yet Hope Is Priceless", "jp": "されど希望の銘は無価" }),
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

const ALL_ITEM_CODES = CHARACTER_CODES.concat(LIGHTCONE_CODES);


/**
 * 查找与指定光锥对应的角色Code
 * @param {string} lightconeCode 
 * @returns 角色code或null
 */
function findExclusiveCharacterCode(lightconeCode) {
    for (var i = 0; i < CHARACTER_LIST.length; i++) {
        if (CHARACTER_LIST[i].params.exclusiveLc == lightconeCode) {
            return CHARACTER_LIST[i].code;
        }
    }
    return null;
}


var excluded_Scommon = ['blad', 'fxua', 'seel'];
var included_Scommon = ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'];
const DEFAULT_INCLUDED_SCOMMON = ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'];

var ALL_CHARACTER_WARP_POOLS = [];
var CHARACTER_EVENT_WARPS = {
    //3.8
    "C3_8_1": new Pool("C3_8_1", "3.8@1", "character", () => [
        ['dahl'],
        included_Scommon,
        ['c000', 'c000', 'c000'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //3.7
    "C3_7_5": new Pool("C3_7_5", "3.7@2", "character", () => [
        ['cyre'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_7_6": new Pool("C3_7_6", "3.7@2", "character", () => [
        ['phai'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_7_7": new Pool("C3_7_7", "3.7@2", "character", () => [
        ['ciph'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_7_8": new Pool("C3_7_8", "3.7@2", "character", () => [
        ['myde'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_7_1": new Pool("C3_7_1", "3.7@1", "character", () => [
        ['cyre'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_7_2": new Pool("C3_7_2", "3.7@1", "character", () => [
        ['hyac'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_7_3": new Pool("C3_7_3", "3.7@1", "character", () => [
        ['cast'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_7_4": new Pool("C3_7_4", "3.7@1", "character", () => [
        ['trib'],
        included_Scommon,
        ['moze', 'pela', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //3.6
    "C3_6_3": new Pool("C3_6_3", "3.6@2", "character", () => [
        ['dhpt'],
        included_Scommon,
        ['hany', 'ssha', 'serv'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_6_4": new Pool("C3_6_4", "3.6@2", "character", () => [
        ['anax'],
        included_Scommon,
        ['hany', 'ssha', 'serv'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_6_1": new Pool("C3_6_1", "3.6@1", "character", () => [
        ['ever'],
        included_Scommon,
        ['mish', 'guin', 'xuey'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_6_2": new Pool("C3_6_2", "3.6@1", "character", () => [
        ['ther'],
        included_Scommon,
        ['mish', 'guin', 'xuey'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //3.5
    "C3_5_3": new Pool("C3_5_3", "3.5@2", "character", () => [
        ['cery'],
        included_Scommon,
        ['samp', 'qque', 'dhen'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_5_4": new Pool("C3_5_4", "3.5@2", "character", () => [
        ['swol'],
        included_Scommon,
        ['samp', 'qque', 'dhen'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_5_1": new Pool("C3_5_1", "3.5@1", "character", () => [
        ['hysi'],
        included_Scommon,
        ['asta', 'arla', 'hook'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_5_2": new Pool("C3_5_2", "3.5@1", "character", () => [
        ['kafk'],
        included_Scommon,
        ['asta', 'arla', 'hook'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //3.4
    "C3_4_3-1": new Pool("C3_4_3-1", "3.4@2", "character", () => [
        ['fire'],
        included_Scommon,
        ['hany', 'lynx', 'luka'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_3-2": new Pool("C3_4_3-2", "3.4@2", "character", () => [
        ['jliu'],
        included_Scommon,
        ['hany', 'lynx', 'luka'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_3-3": new Pool("C3_4_3-3", "3.4@2", "character", () => [
        ['blad'],
        included_Scommon,
        ['hany', 'lynx', 'luka'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_A-1": new Pool("C3_4_A-1", "3.4@A", "character", () => [
        ['sabe'],
        included_Scommon,
        ['tyun', 'marP', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_A-2": new Pool("C3_4_A-2", "3.4@A", "character", () => [
        ['arch'],
        included_Scommon,
        ['tyun', 'marP', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_1": new Pool("C3_4_1", "3.4@1", "character", () => [
        ['phai'],
        included_Scommon,
        ['tyun', 'marP', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_2-1": new Pool("C3_4_2-1", "3.4@1", "character", () => [
        ['trib'],
        included_Scommon,
        ['tyun', 'marP', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_2-2": new Pool("C3_4_2-2", "3.4@1", "character", () => [
        ['sund'],
        included_Scommon,
        ['tyun', 'marP', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_4_2-3": new Pool("C3_4_2-3", "3.4@1", "character", () => [
        ['spar'],
        included_Scommon,
        ['tyun', 'marP', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_3_3": new Pool("C3_3_3", "3.3@2", "character", () => [
        ['ciph'],
        included_Scommon,
        ['qque', 'xuey', 'ssha'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'samp', 'serv', 'tyun', 'ykon', 'qque', 'xuey', 'ssha',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_3_4": new Pool("C3_3_4", "3.3@2", "character", () => [
        ['agla'],
        included_Scommon,
        ['qque', 'xuey', 'ssha'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'moze', 'nata', 'pela',
            'samp', 'serv', 'tyun', 'ykon', 'qque', 'xuey', 'ssha',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_3_1": new Pool("C3_3_1", "3.3@1", "character", () => [
        ['hyac'],
        included_Scommon,
        ['mish', 'serv', 'nata'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'pela', 'qque', 'samp',
            'ssha', 'tyun', 'xuey', 'ykon', 'mish', 'serv', 'nata',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ],
    ]),
    "C3_3_2": new Pool("C3_3_2", "3.3@1", "character", () => [
        ['ther'],
        included_Scommon,
        ['mish', 'serv', 'nata'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'pela', 'qque', 'samp',
            'ssha', 'tyun', 'xuey', 'ykon', 'mish', 'serv', 'nata',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ],
    ]),
    //3.2
    "C3_2_3": new Pool("C3_2_3", "3.2@2", "character", () => [
        ['anax'],
        included_Scommon,
        ['dhen', 'serv', 'moze'],
        ['arla', 'asta', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'ssha', 'tyun', 'xuey', 'ykon', 'dhen', 'serv', 'moze',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_2_4": new Pool("C3_2_4", "3.2@2", "character", () => [
        ['rati'],
        included_Scommon,
        ['dhen', 'serv', 'moze'],
        ['arla', 'asta', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'ssha', 'tyun', 'xuey', 'ykon', 'dhen', 'serv', 'moze',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_2_1": new Pool("C3_2_1", "3.2@1", "character", () => [
        ['cast'],
        included_Scommon,
        ['pela', 'gall', 'lynx'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'moze',
            'mish', 'nata', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'pela', 'gall', 'lynx',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_2_2-1": new Pool("C3_2_2-1", "3.2@1", "character", () => [
        ['fugu'],
        included_Scommon,
        ['pela', 'gall', 'lynx'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'moze',
            'mish', 'nata', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'pela', 'gall', 'lynx',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_2_2-2": new Pool("C3_2_2-2", "3.2@1", "character", () => [
        ['jqiu'],
        included_Scommon,
        ['pela', 'gall', 'lynx'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'moze',
            'mish', 'nata', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'pela', 'gall', 'lynx',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_2_2-3": new Pool("C3_2_2-3", "3.2@1", "character", () => [
        ['ache'],
        included_Scommon,
        ['pela', 'gall', 'lynx'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'moze',
            'mish', 'nata', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'pela', 'gall', 'lynx',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //3.1
    "C3_1_3": new Pool("C3_1_3", "3.1@2", "character", () => [
        ['myde'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['arla', 'xuey', 'nata'],
        ['asta', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'ykon', 'arla', 'xuey', 'nata',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_1_4": new Pool("C3_1_4", "3.1@2", "character", () => [
        ['hhuo'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['arla', 'xuey', 'nata'],
        ['asta', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'ykon', 'arla', 'xuey', 'nata',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_1_1": new Pool("C3_1_1", "3.1@1", "character", () => [
        ['trib'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['lynx', 'hook', 'guin'],
        ['arla', 'asta', 'dhen', 'gall', 'hany',
            'hert', 'luka', 'marP', 'moze', 'mish',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'lynx', 'hook', 'guin',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_1_2": new Pool("C3_1_2", "3.1@1", "character", () => [
        ['yunl'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['lynx', 'hook', 'guin'],
        ['arla', 'asta', 'dhen', 'gall', 'hany',
            'hert', 'luka', 'marP', 'moze', 'mish',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'lynx', 'hook', 'guin',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //3.0
    "C3_0_3": new Pool("C3_0_3", "3.0@2", "character", () => [
        ['agla'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['tyun', 'hany', 'ssha'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'xuey', 'ykon', 'tyun', 'hany', 'ssha',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_0_4-1": new Pool("C3_0_4-1", "3.0@2", "character", () => [
        ['boot'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['tyun', 'hany', 'ssha'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'xuey', 'ykon', 'tyun', 'hany', 'ssha',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_0_4-2": new Pool("C3_0_4-2", "3.0@2", "character", () => [
        ['robi'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['tyun', 'hany', 'ssha'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'xuey', 'ykon', 'tyun', 'hany', 'ssha',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_0_4-3": new Pool("C3_0_4-3", "3.0@2", "character", () => [
        ['swol'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['tyun', 'hany', 'ssha'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'xuey', 'ykon', 'tyun', 'hany', 'ssha',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_0_1": new Pool("C3_0_1", "3.0@1", "character", () => [
        ['ther'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['nata', 'asta', 'moze'],
        ['arla', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'nata', 'asta', 'moze',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_0_2-1": new Pool("C3_0_2-1", "3.0@1", "character", () => [
        ['lsha'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['nata', 'asta', 'moze'],
        ['arla', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'nata', 'asta', 'moze',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_0_2-2": new Pool("C3_0_2-2", "3.0@1", "character", () => [
        ['fxia'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['nata', 'asta', 'moze'],
        ['arla', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'nata', 'asta', 'moze',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C3_0_2-3": new Pool("C3_0_2-3", "3.0@1", "character", () => [
        ['jade'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['nata', 'asta', 'moze'],
        ['arla', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'nata', 'asta', 'moze',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.7
    "C2_7_3": new Pool("C2_7_3", "2.7@2", "character", () => [
        ['fugu'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['gall', 'ykon', 'mish'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'gall', 'ykon', 'mish',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_7_4": new Pool("C2_7_4", "2.7@2", "character", () => [
        ['fire'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['gall', 'ykon', 'mish'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'moze', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'gall', 'ykon', 'mish',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.7
    "C2_7_1": new Pool("C2_7_1", "2.7@1", "character", () => [
        ['sund'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['qque', 'arla', 'tyun'],
        ['asta', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'moze', 'nata', 'pela', 'samp',
            'serv', 'ssha', 'xuey', 'ykon', 'qque', 'arla', 'tyun',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_7_2": new Pool("C2_7_2", "2.7@1", "character", () => [
        ['jyua'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['qque', 'arla', 'tyun'],
        ['asta', 'dhen', 'gall', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'moze', 'nata', 'pela', 'samp',
            'serv', 'ssha', 'xuey', 'ykon', 'qque', 'arla', 'tyun',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.6
    "C2_6_3": new Pool("C2_6_3", "2.6@2", "character", () => [
        ['ache'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['marP', 'pela', 'samp'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'mish', 'moze', 'nata', 'qque', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'marP', 'pela', 'samp',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_6_4": new Pool("C2_6_4", "2.6@2", "character", () => [
        ['aven'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['marP', 'pela', 'samp',],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'mish', 'moze', 'nata', 'qque', 'serv',
            'ssha', 'tyun', 'xuey', 'ykon', 'marP', 'pela', 'samp',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_6_1": new Pool("C2_6_1", "2.6@1", "character", () => [
        ['rapp'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['lynx', 'xuey', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_6_2": new Pool("C2_6_2", "2.6@1", "character", () => [
        ['dhil'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['lynx', 'xuey', 'ykon'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.5
    "C2_5_3": new Pool("C2_5_3", "2.5@2", "character", () => [
        ['lsha'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['mish', 'nata', 'guin'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_5_4": new Pool("C2_5_3", "2.5@2", "character", () => [
        ['tonu'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['mish', 'nata', 'guin'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_5_1": new Pool("C2_5_1", "2.5@1", "character", () => [
        ['fxia'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['moze', 'asta', 'luka'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_5_2-1": new Pool("C2_5_2-1", "2.5@1", "character", () => [
        ['kafk'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['moze', 'asta', 'luka'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_5_2-2": new Pool("C2_5_2-2", "2.5@1", "character", () => [
        ['blsw'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['moze', 'asta', 'luka'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_5_2-3": new Pool("C2_5_2-3", "2.5@1", "character", () => [
        ['robi'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['moze', 'asta', 'luka'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'moze', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.4
    "C2_4_3": new Pool("C2_4_3", "2.4@2", "character", () => [
        ['jqiu'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hook', 'guin', 'arla'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_4_4": new Pool("C2_4_4", "2.4@2", "character", () => [
        ['spar'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hook', 'guin', 'arla'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'postop2', 'resolu6',
            'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_4_1": new Pool("C2_4_1", "2.4@1", "character", () => [
        ['yunl'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hany', 'ykon', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C2_4_2": new Pool("C2_4_2", "2.4@1", "character", () => [
        ['hhuo'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hany', 'ykon', 'lynx'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'aftert4', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //2.3
    "C2_3_3": new Pool("C2_3_3", "2.3@2", "character", () => [
        ['jade'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['serv', 'nata', 'asta'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_3_4": new Pool("C2_3_4", "2.3@2", "character", () => [
        ['arge'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['serv', 'nata', 'asta'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_3_1": new Pool("C2_3_1", "2.3@1", "character", () => [
        ['fire'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['gall', 'mish', 'xuey'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_3_2": new Pool("C2_3_2", "2.3@1", "character", () => [
        ['rmei'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['gall', 'mish', 'xuey'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.2
    "C2_2_3": new Pool("C2_2_3", "2.2@2", "character", () => [
        ['boot'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['pela', 'luka', 'hook'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_2_4": new Pool("C2_2_4", "2.2@2", "character", () => [
        ['fxua'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['pela', 'luka', 'hook'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_2_1": new Pool("C2_2_1", "2.2@1", "character", () => [
        ['robi'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['marP', 'hany', 'xuey'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_2_2": new Pool("C2_2_2", "2.2@1", "character", () => [
        ['tonu'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['marP', 'hany', 'xuey'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.1
    "C2_1_3": new Pool("C2_1_3", "2.1@2", "character", () => [
        ['aven'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['lynx', 'luka', 'serv'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'mish',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_1_4": new Pool("C2_1_4", "2.1@2", "character", () => [
        ['jliu'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['lynx', 'luka', 'serv'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'mish',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_1_1": new Pool("C2_1_1", "2.1@1", "character", () => [
        ['ache'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['gall', 'pela', 'dhen'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_1_2": new Pool("C2_1_2", "2.1@1", "character", () => [
        ['lcha'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['gall', 'pela', 'dhen'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'lynx', 'xuey',
            'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.0
    "C2_0_3": new Pool("C2_0_3", "2.0@2", "character", () => [
        ['spar'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hany', 'qque', 'samp'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_0_4": new Pool("C2_0_4", "2.0@2", "character", () => [
        ['jyua'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hany', 'qque', 'samp'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_0_1": new Pool("C2_0_1", "2.0@1", "character", () => [
        ['blsw'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['mish', 'guin', 'tyun'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'mish',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "C2_0_2": new Pool("C2_0_2", "2.0@1", "character", () => [
        ['dhil'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['mish', 'guin', 'tyun'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'mish',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //1.6
    "C1_6_3": new Pool("C1_6_3", "1.6@2", "character", () => [
        ['rati'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hook', 'nata', 'ssha'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'nata',
            'pela', 'qque', 'samp', 'serv', 'ssha',
            'tyun', 'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_6_4": new Pool("C1_6_4", "1.6@2", "character", () => [
        ['kafk'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['hook', 'nata', 'ssha'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'nata',
            'pela', 'qque', 'samp', 'serv', 'ssha',
            'tyun', 'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_6_1": new Pool("C1_6_1", "1.6@1", "character", () => [
        ['rmei'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['marP', 'tyun', 'xuey'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'nata',
            'pela', 'qque', 'samp', 'serv', 'ssha',
            'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_6_2": new Pool("C1_6_2", "1.6@1", "character", () => [
        ['blad'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['marP', 'tyun', 'xuey'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'nata',
            'pela', 'qque', 'samp', 'serv', 'ssha',
            'tyun', 'lynx', 'xuey', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //1.5
    "C1_5_2": new Pool("C1_5_2", "1.5@2", "character", () => [
        ['arge'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['asta', 'hany', 'lynx'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'nata',
            'pela', 'qque', 'samp', 'serv', 'ssha',
            'tyun', 'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_5_3": new Pool("C1_5_3", "1.5@2", "character", () => [
        ['swol'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['asta', 'hany', 'lynx'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'marP', 'nata',
            'pela', 'qque', 'samp', 'serv', 'ssha',
            'tyun', 'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_5_1": new Pool("C1_5_1", "1.5@1", "character", () => [
        ['hhuo'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['arla', 'dhen', 'serv'],
        ['arla', 'asta', 'dhen', 'guin',
            'hert', 'hook', 'luka', 'marP', 'nata',
            'pela', 'qque', 'samp', 'serv', 'ssha',
            'tyun', 'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //1.4
    "C1_4_2": new Pool("C1_4_2", "1.4@2", "character", () => [
        ['tonu'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['guin', 'luka', 'ssha'],
        ['arla', 'asta', 'dhen', 'guin', 'hert',
            'hook', 'luka', 'marP', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_4_3": new Pool("C1_4_3", "1.4@2", "character", () => [
        ['seel'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['guin', 'luka', 'ssha'],
        ['arla', 'asta', 'dhen', 'guin', 'hert',
            'hook', 'luka', 'marP', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_4_1": new Pool("C1_4_1", "1.4@1", "character", () => [
        ['jliu'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['qque', 'samp', 'tyun'],
        ['arla', 'asta', 'dhen', 'hert',
            'hook', 'luka', 'marP', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'lynx', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //1.3
    "C1_3_2": new Pool("C1_3_2", "1.3@2", "character", () => [
        ['fxua'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['lynx', 'hook', 'pela'],
        ['arla', 'asta', 'dhen', 'hert', 'hook',
            'lynx', 'luka', 'marP', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "C1_3_1": new Pool("C1_3_1", "1.3@1", "character", () => [
        ['dhil'],
        ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'],
        ['asta', 'marP', 'ykon'],
        ['arla', 'asta', 'dhen', 'hert',
            'hook', 'luka', 'marP', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
};

var ALL_LIGHTCONE_WARP_POOLS = [];
var LIGHTCONE_EVENT_WARPS = {
    //3.7
    "L3_7_5": new Pool("L3_7_5", "3.7@2", "lightcone", () => [
        [findItem("cyre").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_7_6": new Pool("L3_7_6", "3.7@2", "lightcone", () => [
        [findItem("phai").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_7_7": new Pool("L3_7_7", "3.7@2", "lightcone", () => [
        [findItem("ciph").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_7_8": new Pool("L3_7_8", "3.7@2", "lightcone", () => [
        [findItem("myde").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_7_1": new Pool("L3_7_1", "3.7@1", "lightcone", () => [
        [findItem("cyre").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_7_2": new Pool("L3_7_2", "3.7@1", "lightcone", () => [
        [findItem("hyac").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_7_3": new Pool("L3_7_3", "3.7@1", "lightcone", () => [
        [findItem("cast").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_7_4": new Pool("L3_7_4", "3.7@1", "lightcone", () => [
        [findItem("trib").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'concer3', 'boundl2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    //3.6
    "L3_6_3": new Pool("L3_6_3", "3.6@2", "lightcone", () => [
        ['though3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['landau2', 'onlysi3', 'perfec2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_6_4": new Pool("L3_6_4", "3.6@2", "lightcone", () => [
        ['lifesh6'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['landau2', 'onlysi3', 'perfec2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_6_1": new Pool("L3_6_1", "3.6@1", "lightcone", () => [
        ['toever3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['dreams2', 'aftert4', 'danced3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_6_2": new Pool("L3_6_2", "3.6@1", "lightcone", () => [
        ['intoth4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['dreams2', 'aftert4', 'danced3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    //3.5
    "L3_5_3": new Pool("L3_5_3", "3.5@2", "lightcone", () => [
        ['epoche5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thebir5', 'swordp1', 'goodni5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_5_4": new Pool("L3_5_4", "3.5@2", "lightcone", () => [
        ['incess2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thebir5', 'swordp1', 'goodni5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_5_1": new Pool("L3_5_1", "3.5@1", "lightcone", () => [
        ['whydoe5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['eyesof4', 'poised3', 'indeli2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_5_2": new Pool("L3_5_2", "3.5@1", "lightcone", () => [
        ['patien5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['eyesof4', 'poised3', 'indeli2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_4_3-1": new Pool("L3_4_3-1", "3.4@2", "lightcone", () => [
        ['wherea4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_4_3-2": new Pool("L3_4_3-2", "3.4@2", "lightcone", () => [
        ['ishall6'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_4_3-3": new Pool("L3_4_3-3", "3.4@2", "lightcone", () => [
        ['theunr3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_4_A-1": new Pool("L3_4_A-1", "3.4@A", "lightcone", () => [
        ['athank3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['NOTAVAI', 'NOTAVAI', 'NOTAVAI'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L3_4_A-2": new Pool("L3_4_A-2", "3.4@A", "lightcone", () => [
        ['thehel5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['NOTAVAI', 'NOTAVAI', 'NOTAVAI'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L3_4_1": new Pool("L3_4_1", "3.4@1", "lightcone", () => [
        ['thusbu4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_4_2-1": new Pool("L3_4_2-1", "3.4@1", "lightcone", () => [
        ['iftime5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_4_2-2": new Pool("L3_4_2-2", "3.4@1", "lightcone", () => [
        ['agroun3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_4_2-3": new Pool("L3_4_2-3", "3.4@1", "lightcone", () => [
        ['earthl2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['thesto4', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusg', 'geniusr', 'goodni5', 'indeli2',
            'landau2', 'maketh4', 'memori4', 'onlysi3',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'thesto4'
        ]
    ]),
    "L3_3_3": new Pool("L3_3_3", "3.3@2", "lightcone", () => [
        ['liesda5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusg', 'eyesof4', 'shared2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4',
            'geniusg'
        ]
    ]),
    "L3_3_4": new Pool("L3_3_4", "3.3@2", "lightcone", () => [
        ['timewo4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusg', 'eyesof4', 'shared2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'planet2', 'poised3', 'postop2', 'resolu6',
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4',
            'geniusg'
        ]
    ]),
    "L3_3_1": new Pool("L3_3_1", "3.3@1", "lightcone", () => [
        ['longma6'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['maketh4', 'shadow3', 'poised3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'maketh4', 'shadow3', 'poised3'
        ]
    ]),
    "L3_3_2": new Pool("L3_3_2", "3.3@1", "lightcone", () => [
        ['intoth4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['maketh4', 'shadow3', 'poised3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'maketh4', 'shadow3', 'poised3'
        ]
    ]),
    "L3_2_3": new Pool("L3_2_3", "3.2@2", "lightcone", () => [
        ['lifesh6'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['trendo5', 'aftert4', 'themol4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'poised3', 'postop2', 'resolu6', 'shadow3',
            'shared2', "subscr3", 'swordp1', 'thebir5',
            'undert4', 'trendo5', 'aftert4', 'themol4'
        ]
    ]),
    "L3_2_4": new Pool("L3_2_4", "3.2@2", "lightcone", () => [
        ['baptis4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['trendo5', 'aftert4', 'themol4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'poised3', 'postop2', 'resolu6', 'shadow3',
            'shared2', "subscr3", 'swordp1', 'thebir5',
            'undert4', 'trendo5', 'aftert4', 'themol4'
        ]
    ]),
    "L3_2_1": new Pool("L3_2_1", "3.2@1", "lightcone", () => [
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
            'undert4', 'goodni5', 'postop2', 'boundl2'
        ]
    ]),
    "L3_2_2-1": new Pool("L3_2_2-1", "3.2@1", "lightcone", () => [
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
            'undert4', 'goodni5', 'postop2', 'boundl2'
        ]
    ]),
    "L3_2_2-2": new Pool("L3_2_2-2", "3.2@1", "lightcone", () => [
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
            'undert4', 'goodni5', 'postop2', 'boundl2'
        ]
    ]),
    "L3_2_2-3": new Pool("L3_2_2-3", "3.2@1", "lightcone", () => [
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
            'undert4', 'goodni5', 'postop2', 'boundl2'
        ]
    ]),
    "L3_1_3": new Pool("L3_1_3", "3.1@2", "lightcone", () => [
        ['flameo6'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['perfec2', 'asecre3', 'memori4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'onlysi3', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'perfec2', 'asecre3', 'memori4'
        ]
    ]),
    "L3_1_4": new Pool("L3_1_4", "3.1@2", "lightcone", () => [
        ['nighto3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['perfec2', 'asecre3', 'memori4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'onlysi3', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'perfec2', 'asecre3', 'memori4'
        ]
    ]),
    "L3_1_1": new Pool("L3_1_1", "3.1@1", "lightcone", () => [
        ['iftime5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['planet2', 'postop2', 'trendo5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'poised3', 'resolu6', 'shadow3', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'undert4', 'planet2', 'postop2', 'trendo5'
        ]
    ]),
    "L3_1_2": new Pool("L3_1_2", "3.1@1", "lightcone", () => [
        ['dancea3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['planet2', 'postop2', 'trendo5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'geniusr', 'goodni5', 'indeli2', 'landau2',
            'maketh4', 'memori4', 'onlysi3', 'perfec2',
            'poised3', 'resolu6', 'shadow3', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'undert4', 'planet2', 'postop2', 'trendo5'
        ]
    ]),
    "L3_0_3": new Pool("L3_0_3", "3.0@2", "lightcone", () => [
        ['timewo4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusg', "subscr3", 'danced3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'poised3', 'postop2', 'resolu6', 'shadow3',
            'shared2', 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4', 'geniusg', "subscr3", 'danced3'
        ]
    ]),
    "L3_0_4-1": new Pool("L3_0_4-1", "3.0@2", "lightcone", () => [
        ['saling5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusg', "subscr3", 'danced3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'poised3', 'postop2', 'resolu6', 'shadow3',
            'shared2', 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4', 'geniusg', "subscr3", 'danced3'
        ]
    ]),
    "L3_0_4-2": new Pool("L3_0_4-2", "3.0@2", "lightcone", () => [
        ['flowin2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusg', "subscr3", 'danced3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'poised3', 'postop2', 'resolu6', 'shadow3',
            'shared2', 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4', 'geniusg', "subscr3", 'danced3'
        ]
    ]),
    "L3_0_4-3": new Pool("L3_0_4-3", "3.0@2", "lightcone", () => [
        ['incess2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusg', "subscr3", 'danced3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'poised3', 'postop2', 'resolu6', 'shadow3',
            'shared2', 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4', 'geniusg', "subscr3", 'danced3'
        ]
    ]),
    "L3_0_1": new Pool("L3_0_1", "3.0@1", "lightcone", () => [
        ['intoth4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['onlysi3', 'geniusr', 'landau2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'goodni5', 'indeli2', 'maketh4', 'memori4',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'onlysi3', 'geniusr', 'landau2'
        ]
    ]),
    "L3_0_2-1": new Pool("L3_0_2-1", "3.0@1", "lightcone", () => [
        ['scenta4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['onlysi3', 'geniusr', 'landau2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'goodni5', 'indeli2', 'maketh4', 'memori4',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'onlysi3', 'geniusr', 'landau2'
        ]
    ]),
    "L3_0_2-2": new Pool("L3_0_2-2", "3.0@1", "lightcone", () => [
        ['iventu5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['onlysi3', 'geniusr', 'landau2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'goodni5', 'indeli2', 'maketh4', 'memori4',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'onlysi3', 'geniusr', 'landau2'
        ]
    ]),
    "L3_0_2-3": new Pool("L3_0_2-3", "3.0@1", "lightcone", () => [
        ['yethop4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['onlysi3', 'geniusr', 'landau2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'dreams2', 'eyesof4',
            'goodni5', 'indeli2', 'maketh4', 'memori4',
            'perfec2', 'planet2', 'poised3', 'postop2',
            'resolu6', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'onlysi3', 'geniusr', 'landau2'
        ]
    ]),
    "L2_7_3": new Pool("L2_7_3", "2.7@2", "lightcone", () => [
        ['longro4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['indeli2', 'resolu6', 'concer3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    "L2_7_4": new Pool("L2_7_4", "2.7@2", "lightcone", () => [
        ['wherea4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['indeli2', 'resolu6', 'concer3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    "L2_7_1": new Pool("L2_7_1", "2.7@1", "lightcone", () => [
        ['agroun3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['poised3', 'thebir5', 'swordp1'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    "L2_7_2": new Pool("L2_7_2", "2.7@1", "lightcone", () => [
        ['before2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['poised3', 'thebir5', 'swordp1'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    //2.6
    "L2_6_3": new Pool("L2_6_3", "2.6@2", "lightcone", () => [
        ['alongt4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['dayone6', 'boundl2', 'maketh4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    "L2_6_4": new Pool("L2_6_4", "2.6@2", "lightcone", () => [
        ['inhere3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['dayone6', 'boundl2', 'maketh4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    "L2_6_1": new Pool("L2_6_1", "2.6@1", "lightcone", () => [
        ['ninjut4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['dreams2', 'aftert4', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    "L2_6_2": new Pool("L2_6_2", "2.6@1", "lightcone", () => [
        ['bright4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['dreams2', 'aftert4', 'undert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'danced3',
            'dayone6', 'dreams2', 'eyesof4', 'geniusr',
            'goodni5', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'poised3',
            'postop2', 'shadow3', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4', 'indeli2', 'resolu6', 'concer3'
        ]
    ]),
    //2.5
    "L2_5_3": new Pool("L2_5_3", "2.5@2", "lightcone", () => [
        ['scenta4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['shadow3', 'shared2', 'planet2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shadow3', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4'
        ]
    ]),
    "L2_5_4": new Pool("L2_5_4", "2.5@2", "lightcone", () => [
        ['worris2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['shadow3', 'shared2', 'planet2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shadow3', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4'
        ]
    ]),
    "L2_5_1": new Pool("L2_5_1", "2.5@1", "lightcone", () => [
        ['iventu5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['swordp1', 'resolu6', 'thebir5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4'
        ]
    ]),
    "L2_5_2-1": new Pool("L2_5_2-1", "2.5@1", "lightcone", () => [
        ['patien5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['swordp1', 'resolu6', 'thebir5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4'
        ]
    ]),
    "L2_5_2-2": new Pool("L2_5_2-2", "2.5@1", "lightcone", () => [
        ['reforg2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['swordp1', 'resolu6', 'thebir5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4'
        ]
    ]),
    "L2_5_2-3": new Pool("L2_5_2-3", "2.5@1", "lightcone", () => [
        ['flowin2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['swordp1', 'resolu6', 'thebir5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2',
            "subscr3", 'swordp1', 'thebir5', 'themol4',
            'trendo5', 'undert4'
        ]
    ]),
    //2.4
    "L2_4_3": new Pool("L2_4_3", "2.4@2", "lightcone", () => [
        ['thosem3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['poised3', 'eyesof4', 'asecre3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L2_4_4": new Pool("L2_4_4", "2.4@2", "lightcone", () => [
        ['earthl2'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['poised3', 'eyesof4', 'asecre3'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L2_4_1": new Pool("L2_4_1", "2.4@1", "lightcone", () => [
        ['dancea3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['themol4', 'perfec2', 'thebir5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L2_4_2": new Pool("L2_4_2", "2.4@1", "lightcone", () => [
        ['nighto3'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['themol4', 'perfec2', 'thebir5'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'aftert4', 'asecre3', 'boundl2', 'concer3',
            'danced3', 'dayone6', 'eyesof4', 'geniusr',
            'goodni5', 'indeli2', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //2.3
    "L2_3_3": new Pool("L2_3_3", "2.3@2", "lightcone", () => [
        ['yethop4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['shared2', 'trendo5', 'aftert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4',
            'aftert4'
        ]
    ]),
    "L2_3_4": new Pool("L2_3_4", "2.3@2", "lightcone", () => [
        ['aninst5'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['shared2', 'trendo5', 'aftert4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4',
            'aftert4'
        ]
    ]),
    "L2_3_1": new Pool("L2_3_1", "2.3@1", "lightcone", () => [
        ['wherea4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['memori4', 'dayone6', 'eyesof4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_3_2": new Pool("L2_3_2", "2.3@1", "lightcone", () => [
        ['pastse4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['memori4', 'dayone6', 'eyesof4'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela',
            'qque', 'samp', 'serv', 'ssha', 'tyun',
            'xuey', 'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.2
    "L2_2_3": new Pool("L2_2_3", "2.2@2", "lightcone", () => [
        [findItem("boot").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusr', 'asecre3', 'landau2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_2_4": new Pool("L2_2_4", "2.2@2", "lightcone", () => [
        [findItem("fxua").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusr', 'asecre3', 'landau2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_2_1": new Pool("L2_2_1", "2.2@1", "lightcone", () => [
        [findItem("robi").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['swordp1', 'boundl2', 'perfec2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_2_2": new Pool("L2_2_2", "2.2@1", "lightcone", () => [
        [findItem("tonu").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['swordp1', 'boundl2', 'perfec2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'mish', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'xuey',
            'ykon',
            'asecre3', 'boundl2', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.1
    "L2_1_3": new Pool("L2_1_3", "2.1@2", "lightcone", () => [
        [findItem("aven").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['concer3', 'shared2', 'maketh4'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_1_4": new Pool("L2_1_4", "2.1@2", "lightcone", () => [
        [findItem("jliu").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['concer3', 'shared2', 'maketh4'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'concer3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_1_1": new Pool("L2_1_1", "2.1@1", "lightcone", () => [
        [findItem("ache").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['goodni5', 'postop2', 'subscr3'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_1_2": new Pool("L2_1_2", "2.1@1", "lightcone", () => [
        [findItem("lcha").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['goodni5', 'postop2', 'subscr3'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'mish', 'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //2.0
    "L2_0_1": new Pool("L2_0_1", "2.0@1", "lightcone", () => [
        [findItem("blsw").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['indeli2', 'danced3', 'resolu6'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_0_2": new Pool("L2_0_2", "2.0@1", "lightcone", () => [
        [findItem("dhil").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['indeli2', 'danced3', 'resolu6'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'indeli2', 'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_0_3": new Pool("L2_0_3", "2.0@2", "lightcone", () => [
        [findItem("spar").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusr', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    "L2_0_4": new Pool("L2_0_4", "2.0@2", "lightcone", () => [
        [findItem("jyua").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['geniusr', 'planet2', 'undert4'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp',
            'serv', 'ssha', 'tyun', 'xuey', 'ykon',
            'asecre3', 'danced3',
            'dayone6', 'eyesof4', 'geniusr', 'goodni5',
            'landau2', 'maketh4', 'memori4',
            'onlysi3', 'perfec2', 'planet2', 'postop2',
            'resolu6', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
    //1.6
    "L1_6_3": new Pool("L1_6_3", "1.6@2", "lightcone", () => [
        [findItem("rati").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['landau2', 'onlysi3', 'perfec2'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_6_4": new Pool("L1_6_4", "1.6@2", "lightcone", () => [
        [findItem("kafk").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['landau2', 'onlysi3', 'perfec2'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_6_1": new Pool("L1_6_1", "1.6@1", "lightcone", () => [
        [findItem("rmei").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['asecre3', 'dayone6', 'planet2'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_6_2": new Pool("L1_6_2", "1.6@1", "lightcone", () => [
        [findItem("blad").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['asecre3', 'dayone6', 'planet2'],
        ['arla', 'asta', 'dhen', 'guin', 'hany',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //1.5
    "L1_5_2": new Pool("L1_5_2", "1.5@2", "lightcone", () => [
        [findItem("arge").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['postop2', 'thebir5', 'undert4'],
        ['arla', 'asta', 'dhen', 'guin',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_5_3": new Pool("L1_5_3", "1.5@2", "lightcone", () => [
        [findItem("swol").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['postop2', 'thebir5', 'undert4'],
        ['arla', 'asta', 'dhen', 'guin',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_5_1": new Pool("L1_5_1", "1.5@1", "lightcone", () => [
        [findItem("hhuo").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['shared2', 'subscr3', 'trendo5'],
        ['arla', 'asta', 'dhen', 'guin',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //1.4
    "L1_4_2": new Pool("L1_4_2", "1.4@2", "lightcone", () => [
        [findItem("tonu").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['onlysi3', 'resolu6', 'themol4'],
        ['arla', 'asta', 'dhen',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_4_3": new Pool("L1_4_3", "1.4@2", "lightcone", () => [
        [findItem("seel").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['onlysi3', 'resolu6', 'themol4'],
        ['arla', 'asta', 'dhen',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_4_1": new Pool("L1_4_1", "1.4@1", "lightcone", () => [
        [findItem("jliu").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['eyesof4', 'maketh4', 'memori4'],
        ['arla', 'asta', 'dhen',
            'hert', 'hook', 'luka', 'lynx', 'marP',
            'nata', 'pela', 'qque', 'samp', 'serv',
            'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    //1.3
    "L1_3_2": new Pool("L1_3_2", "1.3@2", "lightcone", () => [
        [findItem("fxua").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['perfec2', 'undert4', 'trendo5'],
        ['arla', 'asta', 'dhen', 'hert', 'hook',
            'luka', 'marP', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
    "L1_3_1": new Pool("L1_3_1", "1.3@1", "lightcone", () => [
        [findItem("dhil").params.exclusiveLc],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['danced3', 'landau2', 'planet2'],
        ['arla', 'asta', 'dhen', 'hert', 'hook',
            'luka', 'marP', 'nata', 'pela', 'qque',
            'samp', 'serv', 'ssha', 'tyun', 'ykon',
            'asecre3', 'danced3', 'dayone6', 'eyesof4',
            'geniusr', 'goodni5', 'landau2', 'maketh4',
            'memori4', 'onlysi3', 'perfec2', 'planet2',
            'postop2', 'resolu6', 'shared2', "subscr3",
            'swordp1', 'thebir5', 'themol4', 'trendo5',
            'undert4'
        ]
    ]),
};

var ORDERED_ALL_WARP_CAPTIONS = [];//盛放全部卡池代号："C3_1_2"和upName
var TOTAL_EVENT_WARPS = { ...CHARACTER_EVENT_WARPS, ...LIGHTCONE_EVENT_WARPS };


function getVersionSupCharacters(versionKey) {
    var filteredOutItems = [];
    var allCharaPools = Object.keys(CHARACTER_EVENT_WARPS);
    filteredOutItems = allCharaPools.filter((every) => CHARACTER_EVENT_WARPS[every].versionInfo == versionKey);
    // console.log(versionKey)
    var output = []
    for (var i = 0; i < filteredOutItems.length; i++) {
        output.push(CHARACTER_EVENT_WARPS[filteredOutItems[i]].contents()[0][0]);
    }
    return output;
}
function getVersionSupLightcones(versionKey) {
    var filteredOutItems = [];
    var allLCPools = Object.keys(LIGHTCONE_EVENT_WARPS);
    filteredOutItems = allLCPools.filter((every) => LIGHTCONE_EVENT_WARPS[every].versionInfo == versionKey);
    var output = []
    for (var i = 0; i < filteredOutItems.length; i++) {
        output.push(LIGHTCONE_EVENT_WARPS[filteredOutItems[i]].contents()[0][0]);
    }
    return output;
}

/**
 * 根据所选语言，更新卡池Sup的名字，同时为ORDERED_ALL_WARP_CAPTIONS进行排序
 */
function refreshAllPoolSupCode() {
    ORDERED_ALL_WARP_CAPTIONS = rearrangeAllWarpPools(TOTAL_EVENT_WARPS, OFFICIAL_VERSIONS_KEYS);
    // console.log("refreshAllPoolSupCode:" + ORDERED_ALL_WARP_CAPTIONS.length);
    for (var i = 0; i < ORDERED_ALL_WARP_CAPTIONS.length; i++) {
        ORDERED_ALL_WARP_CAPTIONS[i] = {
            code: ORDERED_ALL_WARP_CAPTIONS[i],
            upName: findItem(TOTAL_EVENT_WARPS[ORDERED_ALL_WARP_CAPTIONS[i]].contents()[0][0]).fullName[LANGUAGE]
        }
    }
}
refreshAllPoolSupCode();

function switchLanguage() {
    if (LANGUAGE == 'zh-CN') {
        LANGUAGE = 'en';
    } else if (LANGUAGE == 'en') {
        LANGUAGE = 'jp';
    } else {
        LANGUAGE = 'zh-CN';
    }
    for (eachPoolCode in TOTAL_EVENT_WARPS) {
        let pool = TOTAL_EVENT_WARPS[eachPoolCode];
        refreshPoolKeywords(pool);
    }
    refreshAllPoolSupCode();
    refreshFilterBoxDisplay();
    refreshPoolSelector(E_Form_CharacterPoolInput);
    refreshPoolSelector(P_Form_PFS);
    modifiedScommonVersionDetection();
}



var SELECTED_POOL_NAME = "";
/**
 * 为Sup,Scommon,Rup,Rcommon根据库存的卡池代号进行赋值
 * @param {string} poolName - 从TOTAL_EVENT_WARPS中选取的卡池代号，如"C2_6_2"
 */
function selectPool(poolName) {
    if (TOTAL_EVENT_WARPS[poolName] == undefined) return;
    SELECTED_POOL_NAME = poolName;
    CURRENT_POOLTYPE = TOTAL_EVENT_WARPS[poolName].type;
    Sup = deepClone(TOTAL_EVENT_WARPS[poolName].contents()[0]);
    Scommon = deepClone(TOTAL_EVENT_WARPS[poolName].contents()[1]);
    /**
     * 在之前(vβ5.2.0)，我为了使Scommon能直接获取最新的included的数据，不得不
     * 添加了一个判断版本时间的逻辑。即，若版本大于3.2，更新Scommon的contents的
     * [1]对included的地址引用，然后再进行一次deepClone，这显然是非常繁琐的。
     * 而在vβ5.2.1，我采用了Getter函数动态管理included的引用，解决了此处的所有问
     * 题，代码得以统一。
     * Getter函数在处理动态的对象成员数据时，的确非常好用。
     */
    if (Scommon.length != 7) {
        alert("错误：允许获取的5星常驻项目的数目不为7。");
        throw new Error("selectPool: Scommon的元素数目不为7！");
    }
    Rup = deepClone(TOTAL_EVENT_WARPS[poolName].contents()[2]);
    let temp = new Set(Rup);
    Rcommon = new Set(deepClone(TOTAL_EVENT_WARPS[poolName].contents()[3]));
    Rcommon = [...temp.getComplimentFrom(Rcommon)];
}
