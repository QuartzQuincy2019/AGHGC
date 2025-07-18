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
                if (item && item.params && item.params.exclusiveLc) {
                    output = output.union(findItem(item.params.exclusiveLc).keywords);
                }
                output = output.union(item.keywords);
            }
            if (getItemType(item) == 'Lightcone') {
                output = output.union(item.keywords);
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
            output.add(OFFICIAL_VERSIONS[this.versionCode].versionCode);
            let startDateMJD = OFFICIAL_VERSIONS[this.versionCode].dateMJD;
            let endDateMJD = dateStringToMJD(OFFICIAL_VERSIONS[this.versionCode].endDate);
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
    versionInfo;
    type;
    contents;
    keywords = new Set();
    constructor(_code, _versionInfo, _type, _contents) {
        this.code = _code;
        this.versionInfo = _versionInfo;
        this.type = _type;
        this.contents = _contents;
        let kg = new KeywordsGenerator();
        kg.itemCode = this.contents()[0][0];
        kg.versionCode = this.versionInfo;
        kg.insdinctiveCode = this.code;
        this.keywords = kg.keywords;
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
    //1.0
    new Character("arla", 4, CombatType.lightning, Path.destruction, { "zh-CN": "阿兰", "en": "Arlan", "jp": "アーラン" }),
    new Character("asta", 4, CombatType.fire, Path.harmony, { "zh-CN": "艾丝妲", "en": "Asta", "jp": "アスター" }),
    new Character("bail", 5, CombatType.lightning, Path.abundance, { "zh-CN": "白露", "en": "Bailu", "jp": "白露" }, { "exclusiveLc": "timewa5" }),
    new Character("bron", 5, CombatType.wind, Path.harmony, { "zh-CN": "布洛妮娅", "en": "Bronya", "jp": "ブローニャ" }, { "exclusiveLc": "butthe5" }),
    new Character("clar", 5, CombatType.physical, Path.destruction, { "zh-CN": "克拉拉", "en": "Clara", "jp": "クラーラ" }, { "exclusiveLc": "someth2" }),
    new Character("dhen", 4, CombatType.wind, Path.thehunt, { "zh-CN": "丹恒", "en": "Dan Heng", "jp": "丹恒" }),
    new Character("gepa", 5, CombatType.ice, Path.preservation, { "zh-CN": "杰帕德", "en": "Gepard", "jp": "ジェパード" }, { "exclusiveLc": "moment3" }),
    new Character("hert", 4, CombatType.ice, Path.erudition, { "zh-CN": "黑塔", "en": "Herta", "jp": "ヘルタ" }),
    new Character("hime", 5, CombatType.fire, Path.erudition, { "zh-CN": "姬子", "en": "Himeko", "jp": "姫子" }, { "exclusiveLc": "nighto5" }),
    new Character("hook", 4, CombatType.fire, Path.destruction, { "zh-CN": "虎克", "en": "Hook", "jp": "フック" }),
    new Character("jyua", 5, CombatType.lightning, Path.erudition, { "zh-CN": "景元", "en": "Jing Yuan", "jp": "景元" }, { "exclusiveLc": "before2", "alias": ["将军", "牢景"] }),
    new Character("marP", 4, CombatType.ice, Path.preservation, { "zh-CN": "三月七", "en": "March 7th", "jp": "三月なのか" }),
    new Character("nata", 4, CombatType.physical, Path.abundance, { "zh-CN": "娜塔莎", "en": "Natasha", "jp": "ナターシャ" }),
    new Character("pela", 4, CombatType.ice, Path.nihility, { "zh-CN": "佩拉", "en": "Pela", "jp": "ペラ" }),
    new Character("qque", 4, CombatType.quantum, Path.erudition, { "zh-CN": "青雀", "en": "Qingque", "jp": "青雀" }),
    new Character("samp", 4, CombatType.wind, Path.nihility, { "zh-CN": "桑博", "en": "Sampo", "jp": "サンポ" }),
    new Character("seel", 5, CombatType.quantum, Path.thehunt, { "zh-CN": "希儿", "en": "Seele", "jp": "ゼーレ" }),
    new Character("serv", 4, CombatType.lightning, Path.erudition, { "zh-CN": "希露瓦", "en": "Serval", "jp": "セーバル" }),
    new Character("ssha", 4, CombatType.physical, Path.thehunt, { "zh-CN": "素裳", "en": "Sushang", "jp": "素裳" }),
    new Character("tyun", 4, CombatType.lightning, Path.harmony, { "zh-CN": "停云", "en": "Tingyun", "jp": "停雲" }),
    new Character("welt", 5, CombatType.imaginary, Path.nihility, { "zh-CN": "瓦尔特", "en": "Welt", "jp": "ヴェルト" }, { "exclusiveLc": "inthen6" }),
    new Character("yqin", 5, CombatType.ice, Path.thehunt, { "zh-CN": "彦卿", "en": "Yanqing", "jp": "彦卿" }, { "exclusiveLc": "sleepl4" }),
    //1.1
    new Character("lcha", 5, CombatType.imaginary, Path.abundance, { "zh-CN": "罗刹", "en": "Luocha", "jp": "羅刹" }),
    new Character("swol", 5, CombatType.quantum, Path.nihility, { "zh-CN": "银狼", "en": "Silver Wolf", "jp": "銀狼" }, { "exclusiveLc": "incess2" }),
    new Character("ykon", 4, CombatType.imaginary, Path.harmony, { "zh-CN": "驭空", "en": "Yukong", "jp": "御空" }),
    //1.2
    new Character("blad", 5, CombatType.wind, Path.destruction, { "zh-CN": "刃", "en": "Blade", "jp": "刃" }, { "alias": ["牢刃"] }),
    new Character("kafk", 5, CombatType.lightning, Path.nihility, { "zh-CN": "卡芙卡", "en": "Kafka", "jp": "カフカ" }, { "alias": ["卡妈"] }),
    new Character("luka", 4, CombatType.physical, Path.nihility, { "zh-CN": "卢卡", "en": "Luka", "jp": "ルカ" }),
    //1.3
    new Character("dhil", 5, CombatType.imaginary, Path.destruction, { "zh-CN": "丹恒·饮月", "en": "Dan Heng • Imbibitor Lunae", "jp": "丹恒・飲月" }, { "alias": ["饮月君", "丹恒饮月"] }),
    new Character("fxua", 5, CombatType.quantum, Path.preservation, { "zh-CN": "符玄", "en": "Fu Xuan", "jp": "符玄" }, { "alias": ["太卜"] }),
    new Character("lynx", 4, CombatType.quantum, Path.abundance, { "zh-CN": "玲可", "en": "Lynx", "jp": "リンクス" }),
    //1.4
    new Character("guin", 4, CombatType.fire, Path.nihility, { "zh-CN": "桂乃芬", "en": "Guinaifen", "jp": "桂乃芬" }),
    new Character("jliu", 5, CombatType.ice, Path.destruction, { "zh-CN": "镜流", "en": "Jingliu", "jp": "鏡流" }),
    new Character("tonu", 5, CombatType.fire, Path.thehunt, { "zh-CN": "托帕&账账", "en": "Topaz & Numby", "jp": "トパーズ＆カブ" }),
    //1.5
    new Character("arge", 5, CombatType.physical, Path.erudition, { "zh-CN": "银枝", "en": "Argenti", "jp": "アルジェンティ" }),
    new Character("hany", 4, CombatType.physical, Path.harmony, { "zh-CN": "寒鸦", "en": "Hanya", "jp": "寒鴉" }),
    new Character("hhuo", 5, CombatType.wind, Path.abundance, { "zh-CN": "藿藿", "en": "Huohuo", "jp": "フォフォ" }, { "exclusiveLc": "nighto3" }),
    //1.6
    new Character("rati", 5, CombatType.imaginary, Path.thehunt, { "zh-CN": "真理医生", "en": "Dr.Ratio", "jp": "Dr.レイシオ" }, { "exclusiveLc": "baptis4" }),
    new Character("rmei", 5, CombatType.ice, Path.harmony, { "zh-CN": "阮·梅", "en": "Ruan Mei", "jp": "ルアン・メェイ" }, { "alias": ["阮梅"] }),
    new Character("xuey", 4, CombatType.quantum, Path.destruction, { "zh-CN": "雪衣", "en": "Xueyi", "jp": "雪衣" }),
    //2.0
    new Character("blsw", 5, CombatType.wind, Path.nihility, { "zh-CN": "黑天鹅", "en": "Black Swan", "jp": "ブラックスワン" }),
    new Character("mish", 4, CombatType.ice, Path.destruction, { "zh-CN": "米沙", "en": "Misha", "jp": "ミーシャ" }),
    new Character("spar", 5, CombatType.quantum, Path.harmony, { "zh-CN": "花火", "en": "Sparkle", "jp": "花火" }, { "exclusiveLc": "earthl2" }),
    //2.1
    new Character("ache", 5, CombatType.lightning, Path.nihility, { "zh-CN": "黄泉", "en": "Acheron", "jp": "黄泉" }, { "exclusiveLc": "alongt4" }),
    new Character("aven", 5, CombatType.imaginary, Path.preservation, { "zh-CN": "砂金", "en": "Aventurine", "jp": "アベンチュリン" }, { "exclusiveLc": "inhere3" }),
    new Character("gall", 4, CombatType.fire, Path.abundance, { "zh-CN": "加拉赫", "en": "Gallagher", "jp": "ギャラガー" }),
    //2.2
    new Character("boot", 5, CombatType.physical, Path.thehunt, { "zh-CN": "波提欧", "en": "Boothill", "jp": "ブートヒル" }, { "exclusiveLc": "saling5", "alias": ["牛仔"] }),
    new Character("robi", 5, CombatType.physical, Path.harmony, { "zh-CN": "知更鸟", "en": "Robin", "jp": "ロビン" }, { "exclusiveLc": "flowin2", "alias": ["鸟", "牢鸟"] }),
    //2.3
    new Character("fire", 5, CombatType.fire, Path.destruction, { "zh-CN": "流萤", "en": "Firefly", "jp": "ホタル" }, { "exclusiveLc": "wherea4" }),
    new Character("jade", 5, CombatType.quantum, Path.erudition, { "zh-CN": "翡翠", "en": "Jade", "jp": "ジェイド" }, { "exclusiveLc": "yethop4" }),
    //2.4
    new Character("jqiu", 5, CombatType.fire, Path.nihility, { "zh-CN": "椒丘", "en": "Jiaoqiu", "jp": "椒丘" }, { "exclusiveLc": "thosem3" }),
    new Character("marH", 4, CombatType.imaginary, Path.thehunt, { "zh-CN": "三月七", "en": "March 7th", "jp": "三月なのか" }),
    new Character("yunl", 5, CombatType.physical, Path.destruction, { "zh-CN": "云璃", "en": "Yunli", "jp": "雲璃" }, { "exclusiveLc": "dancea3" }),
    //2.5
    new Character("fxia", 5, CombatType.wind, Path.thehunt, { "zh-CN": "飞霄", "en": "Feixiao", "jp": "飛霄" }, { "exclusiveLc": "iventu5", "alias": ["将军", "天击将军"] }),
    new Character("lsha", 5, CombatType.fire, Path.abundance, { "zh-CN": "灵砂", "en": "Lingsha", "jp": "霊砂" }, { "exclusiveLc": "scenta4" }),
    new Character("moze", 4, CombatType.lightning, Path.thehunt, { "zh-CN": "貊泽", "en": "Moze", "jp": "モゼ" }),
    //2.6
    new Character("rapp", 5, CombatType.imaginary, Path.erudition, { "zh-CN": "乱破", "en": "Rappa", "jp": "乱破" }, { "exclusiveLc": "ninjut4" }),
    //2.7
    new Character("fugu", 5, CombatType.fire, Path.nihility, { "zh-CN": "忘归人", "en": "Fugue", "jp": "帰忘の流離人" }, { "exclusiveLc": "longro4", "alias": ["大停云"] }),
    new Character("sund", 5, CombatType.imaginary, Path.harmony, { "zh-CN": "星期日", "en": "Sunday", "jp": "サンデー" }, { "exclusiveLc": "agroun3", "alias": ["周天哥", "周天子", "牢日"] }),
    //3.0
    new Character("agla", 5, CombatType.lightning, Path.remembrance, { "zh-CN": "阿格莱雅", "en": "Aglaea", "jp": "アグライア" }, { "exclusiveLc": "timewo4", "alias": ["金织"] }),
    new Character("ther", 5, CombatType.ice, Path.erudition, { "zh-CN": "大黑塔", "en": "The Herta", "jp": "マダム・ヘルタ" }, { "exclusiveLc": "intoth4" }),
    //3.1
    new Character("myde", 5, CombatType.imaginary, Path.destruction, { "zh-CN": "万敌", "en": "Mydei", "jp": "モーディス" }, { "exclusiveLc": "flameo6"}),
    new Character("trib", 5, CombatType.quantum, Path.harmony, { "zh-CN": "缇宝", "en": "Tribbie", "jp": "トリビー" }, { "exclusiveLc": "iftime5"}),
    //3.2
    new Character("cast", 5, CombatType.quantum, Path.remembrance, { "zh-CN": "遐蝶", "en": "Castorice", "jp": "キャストリス" }, { "exclusiveLc": "makefa4", "alias": ["蝶"] }),
    new Character("anax", 5, CombatType.wind, Path.erudition, { "zh-CN": "那刻夏", "en": "Anaxa", "jp": "アナイクス" }, { "exclusiveLc": "lifesh6"}),
    //3.3
    new Character("hyac", 5, CombatType.wind, Path.remembrance, { "zh-CN": "风堇", "en": "Hyacine", "jp": "ヒアンシー" }, { "exclusiveLc": "longma6"}),
    new Character("ciph", 5, CombatType.quantum, Path.nihility, { "zh-CN": "赛飞儿", "en": "Cipher", "jp": "サフェル" }, { "exclusiveLc": "liesda5", "alias": ["猫猫"] }),
    //3.4
    new Character("phai", 5, CombatType.physical, Path.destruction, { "zh-CN": "白厄", "en": "Phainon", "jp": "ファイノン" }, { "exclusiveLc": "thusbu4" }),
    new Character("sabe", 5, CombatType.wind, Path.destruction, { "zh-CN": "Saber", "en": "Saber", "jp": "セイバー" }, { "exclusiveLc": "athank3" }),
    new Character("arch", 5, CombatType.quantum, Path.thehunt, { "zh-CN": "Archer", "en": "Archer", "jp": "アーチャー" }, { "exclusiveLc": "thehel5" }),
    //3.5
    new Character("hysi", 5, CombatType.physical, Path.nihility, { "zh-CN": "海瑟音", "en": "Hysilens", "jp": "セイレンス" }),
    new Character("cery", 5, CombatType.wind, Path.harmony, { "zh-CN": "刻律德菈", "en": "Cerydra", "jp": "ケリュドラ" }),
    /*
    new Character("", 5, CombatType., Path., { "zh-CN": "■■■", "en": "█ █ █", "jp": "■■■" }),
    new Character("terr", 5, CombatType., Path., { "zh-CN": "荒笛", "en": "Terravox", "jp": "荒笛" }),
    new Character("cyre", 5, CombatType., Path., { "zh-CN": "昔涟", "en": "Cyrene", "jp": "キュレネ" }),
    */


];

var LIGHTCONE_LIST = [
    new Lightcone("placeho", 4, Path.destruction, { "zh-CN": "*占位符", "en": "*placeholder", "jp": "*placeholder" }),
    new Lightcone("aftert4", 4, Path.erudition, { "zh-CN": "谐乐静默之后", "en": "After the Charmony Fall", "jp": "調和が沈黙した後" }),
    new Lightcone("asecre3", 4, Path.destruction, { "zh-CN": "秘密誓心", "en": "A Secret Vow", "jp": "秘密の誓い" }),
    new Lightcone("boundl2", 4, Path.nihility, { "zh-CN": "无边曼舞", "en": "Boundless Choreo", "jp": "終わりなき舞踏" }),
    new Lightcone("concer3", 4, Path.preservation, { "zh-CN": "两个人的演唱会", "en": "Concert for Two", "jp": "二人だけのコンサート" }),
    new Lightcone("danced3", 4, Path.harmony, { "zh-CN": "舞！舞！舞！", "en": "Dance! Dance! Dance!", "jp": "ダンス！ダンス！ダンス！" }),
    new Lightcone("dayone6", 4, Path.preservation, { "zh-CN": "余生的第一天", "en": "Day One of My New Life", "jp": "余生の初日" }),
    new Lightcone("dreams2", 4, Path.abundance, { "zh-CN": "梦的蒙太奇", "en": "Dream's Montage", "jp": "夢のモンタージュ" }),
    new Lightcone("eyesof4", 4, Path.nihility, { "zh-CN": "猎物的视线", "en": "Eyes of the Prey", "jp": "獲物の視線" }),
    new Lightcone("geniusr", 4, Path.erudition, { "zh-CN": "天才们的休憩", "en": "Geniuses' Repose", "jp": "天才たちの休息" }),
    new Lightcone("goodni5", 4, Path.nihility, { "zh-CN": "晚安与睡颜", "en": "Good Night and Sleep Well", "jp": "おやすみなさいと寝顔" }),
    new Lightcone("indeli2", 4, Path.destruction, { "zh-CN": "铭记于心的约定", "en": "Indelible Promise", "jp": "心に刻まれた約束" }),
    new Lightcone("landau2", 4, Path.preservation, { "zh-CN": "朗道的选择", "en": "Landau's Choice", "jp": "ランドゥーの選択" }),
    new Lightcone("maketh4", 4, Path.erudition, { "zh-CN": "别让世界静下来", "en": "Make the World Clamor", "jp": "この世界に喧噪を" }),
    new Lightcone("memori4", 4, Path.harmony, { "zh-CN": "记忆中的模样", "en": "Memories of the Past", "jp": "記憶の中の姿" }),
    new Lightcone("onlysi3", 4, Path.thehunt, { "zh-CN": "唯有沉默", "en": "Only Silence Remains", "jp": "沈黙のみ" }),
    new Lightcone("perfec2", 4, Path.abundance, { "zh-CN": "此时恰好", "en": "Perfect Timing", "jp": "今が丁度" }),
    new Lightcone("planet2", 4, Path.harmony, { "zh-CN": "与行星相会", "en": "Planetary Rendezvous", "jp": "惑星との出会い" }),
    new Lightcone("poised3", 4, Path.harmony, { "zh-CN": "芳华待灼", "en": "Poised to Bloom", "jp": "美しき華よ今咲かん" }),
    new Lightcone("postop2", 4, Path.abundance, { "zh-CN": "一场术后对话", "en": "Post-Op Conversation", "jp": "手術後の会話" }),
    new Lightcone("resolu6", 4, Path.nihility, { "zh-CN": "决心如汗珠般闪耀", "en": "Resolution Shines As Pearls of Sweat", "jp": "決意は汗のように輝く" }),
    new Lightcone("shadow3", 4, Path.thehunt, { "zh-CN": "黑夜如影随行", "en": "Shadowed by Night", "jp": "夜は影のように付き纏う" }),
    new Lightcone("shared2", 4, Path.abundance, { "zh-CN": "同一种心情", "en": "Shared Feeling", "jp": "同じ気持ち" }),
    new Lightcone("subscr3", 4, Path.thehunt, { "zh-CN": "点个关注吧！", "en": "Subscribe for More!", "jp": "フォローして！" }),
    new Lightcone("swordp1", 4, Path.thehunt, { "zh-CN": "论剑", "en": "Swordplay", "jp": "論剣" }),
    new Lightcone("thebir5", 4, Path.erudition, { "zh-CN": "「我」的诞生", "en": "The Birth of the Self", "jp": "「私」の誕生" }),
    new Lightcone("themol4", 4, Path.destruction, { "zh-CN": "鼹鼠党欢迎你", "en": "The Moles Welcome You", "jp": "モグラ党へようこそ" }),
    new Lightcone("thesto4", 4, Path.remembrance, { "zh-CN": "故事的下一页", "en": "The Story's Next Page", "jp": "物語をめくって" }),
    new Lightcone("trendo5", 4, Path.preservation, { "zh-CN": "宇宙市场趋势", "en": "Trend of the Universal Market", "jp": "星間市場のトレンド" }),
    new Lightcone("undert4", 4, Path.destruction, { "zh-CN": "在蓝天下", "en": "Under the Blue Sky", "jp": "青空の下で" }),
    new Lightcone("geniusg", 4, Path.remembrance, { "zh-CN": "天才们的问候", "en": "Geniuses' Greetings", "jp": "天才たちの「挨拶」" }),
    //5 stars
    new Lightcone("agroun3", 5, Path.harmony, { "zh-CN": "回到大地的飞行", "en": "A Grounded Ascent", "jp": "大地より天を目指して" }),
    new Lightcone("alongt4", 5, Path.nihility, { "zh-CN": "行于流逝的岸", "en": "Along the Passing Shore", "jp": "流れ逝く岸を歩いて" }),
    new Lightcone("athank3", 5, Path.destruction, { "zh-CN": "没有回报的加冕", "en": "A Thankless Coronation", "jp": "報われぬ戴冠" }),
    new Lightcone("baptis4", 5, Path.thehunt, { "zh-CN": "纯粹思维的洗礼", "en": "Baptism of Pure Thought", "jp": "純粋なる思惟の洗礼" }),
    new Lightcone("before2", 5, Path.erudition, { "zh-CN": "拂晓之前", "en": "Before Dawn", "jp": "夜明け前" }),
    new Lightcone("bright4", 5, Path.destruction, { "zh-CN": "比阳光更明亮的", "en": "Brighter Than the Sun", "jp": "陽光より輝くもの" }),
    new Lightcone("butthe5", 5, Path.harmony, { "zh-CN": "但战斗还未结束", "en": "But the Battle Isn't Over", "jp": "だが戦争は終わらない" }),
    new Lightcone("dancea3", 5, Path.destruction, { "zh-CN": "落日时起舞", "en": "Dance at Sunset", "jp": "夕日に舞う" }),
    new Lightcone("earthl2", 5, Path.harmony, { "zh-CN": "游戏尘寰", "en": "Earthly Escapade", "jp": "人生は遊び" }),
    new Lightcone("flameo6", 5, Path.destruction, { "zh-CN": "血火啊，燃烧前路", "en": "Flame of Blood, Blaze My Path", "jp": "前途燃やす血の如き炎" }),
    new Lightcone("flowin2", 5, Path.harmony, { "zh-CN": "夜色流光溢彩", "en": "Flowing Nightglow", "jp": "光あふれる夜" }),
    new Lightcone("iftime5", 5, Path.harmony, { "zh-CN": "如果时间是一朵花", "en": "If Time Were a Flower", "jp": "もしも時が花だったら" }),
    new Lightcone("incess2", 5, Path.nihility, { "zh-CN": "雨一直下", "en": "Incessant Rain", "jp": "降りやまぬ雨" }),
    new Lightcone("inhere3", 5, Path.preservation, { "zh-CN": "命运从未公平", "en": "Inherently Unjust Destiny", "jp": "運命は常に不公平" }),
    new Lightcone("inthen6", 5, Path.nihility, { "zh-CN": "以世界之名", "en": "In the Name of the World", "jp": "世界の名を以て" }),
    new Lightcone("intoth4", 5, Path.erudition, { "zh-CN": "向着不可追问处", "en": "Into the Unreachable Veil", "jp": "触れてはならぬ領域へ" }),
    new Lightcone("iventu5", 5, Path.thehunt, { "zh-CN": "我将，巡征追猎", "en": "I Venture Forth to Hunt", "jp": "我が征く巡狩の道" }),
    new Lightcone("liesda5", 5, Path.nihility, { "zh-CN": "谎言在风中飘扬", "en": "Lies Dance on the Breeze", "jp": "風に揺蕩う虚言" }),
    new Lightcone("lifesh6", 5, Path.erudition, { "zh-CN": "生命当付之一炬", "en": "Life Should Be Cast to Flames", "jp": "生命、焼滅すべし" }),
    new Lightcone("longma6", 5, Path.abundance, { "zh-CN": "愿虹光永驻天空", "en": "Long May Rainbows Adorn the Sky", "jp": "空の虹が消えぬように" }),
    new Lightcone("longro4", 5, Path.nihility, { "zh-CN": "长路终有归途", "en": "Long Road Leads Home", "jp": "長途はやがて帰途へと続く" }),
    new Lightcone("makefa4", 5, Path.remembrance, { "zh-CN": "让告别，更美一些", "en": "Make Farewells More Beautiful", "jp": "永訣よ美しくあれ" }),
    new Lightcone("moment3", 5, Path.preservation, { "zh-CN": "制胜的瞬间", "en": "Moment of Victory", "jp": "勝利の刹那" }),
    new Lightcone("nighto3", 5, Path.abundance, { "zh-CN": "惊魂夜", "en": "Night of Fright", "jp": "驚魂の夜" }),
    new Lightcone("nighto5", 5, Path.erudition, { "zh-CN": "银河铁道之夜", "en": "Night on the Milky Way", "jp": "銀河鉄道の夜" }),
    new Lightcone("ninjut4", 5, Path.erudition, { "zh-CN": "忍法帖•缭乱破魔", "en": "Ninjutsu Inscription: Dazzling Evilbreaker", "jp": "忍法帖・繚乱破魔" }),
    new Lightcone("saling5", 5, Path.thehunt, { "zh-CN": "驶向第二次生命", "en": "Sailing Towards a Second Life", "jp": "二度目の生に向かって" }),
    new Lightcone("scenta4", 5, Path.abundance, { "zh-CN": "唯有香如故", "en": "Scent Alone Stays True", "jp": "昔日の香りは今も猶" }),
    new Lightcone("sleepl4", 5, Path.thehunt, { "zh-CN": "如泥酣眠", "en": "Sleep Like the Dead", "jp": "泥の如き眠り" }),
    new Lightcone("someth2", 5, Path.destruction, { "zh-CN": "无可取代的东西", "en": "Something Irreplaceable", "jp": "かけがえのないもの" }),
    new Lightcone("thehel5", 5, Path.thehunt, { "zh-CN": "理想燃烧的地狱", "en": "The Hell Where Ideals Burn", "jp": "理想を焼く奈落で" }),
    new Lightcone("thosem3", 5, Path.nihility, { "zh-CN": "那无数个春天", "en": "Those Many Springs", "jp": "幾度目かの春" }),
    new Lightcone("thusbu4", 5, Path.destruction, { "zh-CN": "黎明恰如此燃烧", "en": "Thus Burns the Dawn", "jp": "燃え盛る黎明のように" }),
    new Lightcone("timewa5", 5, Path.abundance, { "zh-CN": "时节不居", "en": "Time Waits for No One", "jp": "時節は居らず" }),
    new Lightcone("timewo4", 5, Path.remembrance, { "zh-CN": "将光阴织成黄金", "en": "Time Woven Into Gold", "jp": "光陰を織り黄金と成す" }),
    new Lightcone("wherea4", 5, Path.destruction, { "zh-CN": "梦应归于何处", "en": "Whereabouts Should Dreams Rest", "jp": "夢が帰り着く場所" }),
    new Lightcone("worris2", 5, Path.thehunt, { "zh-CN": "烦恼着，幸福着", "en": "Worrisome, Blissful", "jp": "悩んで笑って" }),
    new Lightcone("yethop4", 5, Path.erudition, { "zh-CN": "偏偏希望无价", "en": "Yet Hope Is Priceless", "jp": "されど希望の銘は無価" }),
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
    dateMJD;
    endDate;
    /**
     * 
     * @param {string} _code - 版本号
     * @param {number} _session - 上半：1；下半：2
     * @param {session} _date - 更新日期
     * @param {session} _endDate - 结束日期 
     */
    constructor(_code, _session, _date) {
        this.versionCode = _code;
        this.session = _session;
        this.date = _date;
        this.dateMJD = dateToMJD(_date);
        this.endDate = MJDToDateString(dateStringToMJD(_date) + 20);
    }
}
var _TBP = "2026-04-26";
var OFFICIAL_VERSIONS = {
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
var OFFICIAL_VERSIONS_KEYS = Object.keys(OFFICIAL_VERSIONS);
var CURRENT_STAGE = "";

/**
 * 确定当前所处的版本（分上半和下半）
 * @param {number} mjd - 指定日期对应的MJD
 * @returns OFFICIAL_VERSIONS中的key，注意不是一个对象
 */
function detectStage(mjd) {
    var thisDay = mjd;
    var target = -1;
    for (var i = 0; i < OFFICIAL_VERSIONS_KEYS.length; i++) {
        var iterring = OFFICIAL_VERSIONS[OFFICIAL_VERSIONS_KEYS[i]];
        if (iterring.dateMJD <= thisDay && dateStringToMJD(iterring.endDate) >= thisDay) {
            target = i;
            break;
        }
    }
    if (target == -1) {
        console.log("未能找到MJD为" + mjd + "对应的版本。");
    }
    return OFFICIAL_VERSIONS_KEYS[target];
}

var excluded_Scommon = ['blad', 'fxua', 'seel'];
var included_Scommon = ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'];
const DEFAULT_INCLUDED_SCOMMON = ['bail', 'bron', 'clar', 'gepa', 'hime', 'welt', 'yqin'];

var ALL_CHARACTER_WARP_POOLS = [];
var CHARACTER_EVENT_WARPS = {
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
    //2024-12-04
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
    //2024-11-13
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
            'shadow3', 'shared2', "subscr3", 'swordp1',
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
            'shadow3', 'shared2', "subscr3", 'swordp1',
            'thebir5', 'themol4', 'trendo5', 'undert4'
        ]
    ]),
}

var ALL_LIGHTCONE_WARP_POOLS = [];
var LIGHTCONE_EVENT_WARPS = {
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
    "L2_5_3": new Pool("L2_5_3", "2.5@2", "lightcone", () => [
        ['scenta4'],
        ['butthe5', 'inthen6', 'moment3', 'nighto5', 'sleepl4', 'someth2', 'timewa5'],
        ['shadow3', 'shared2', 'planet2'],
        ['arla', 'asta', 'dhen', 'gall', 'guin',
            'hany', 'hert', 'hook', 'luka', 'lynx',
            'marP', 'moze', 'mish', 'nata', 'pela',
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
            'marP', 'moze', 'mish', 'nata', 'pela',
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
};

var ALL_WARP_POOLS = [];//盛放全部卡池代号："C3_1_2"和upName
var TOTAL_EVENT_WARPS = { ...CHARACTER_EVENT_WARPS, ...LIGHTCONE_EVENT_WARPS };

/**
 * 镶嵌型函数。必须与refreshAllPoolSupCode合用
 * 对ALL_WARP_POOLS进行排序
 */
function rearrangeAllWarpPools() {
    ALL_CHARACTER_WARP_POOLS = Object.keys(CHARACTER_EVENT_WARPS);
    ALL_LIGHTCONE_WARP_POOLS = Object.keys(LIGHTCONE_EVENT_WARPS);
    ALL_WARP_POOLS = Object.keys(TOTAL_EVENT_WARPS);
    rearranged = [];
    for (var i = 0; i < OFFICIAL_VERSIONS_KEYS.length; i++) {
        let inThisVersion = ALL_WARP_POOLS.filter((every) => TOTAL_EVENT_WARPS[every].versionInfo == OFFICIAL_VERSIONS_KEYS[i]);
        rearranged = [...rearranged, ...inThisVersion];
    }
    ALL_WARP_POOLS = rearranged;
}

function getVersionSupCharacters(versionKey) {
    var filteredOutItems = [];
    var allCharaPools = Object.keys(CHARACTER_EVENT_WARPS);
    filteredOutItems = allCharaPools.filter((every) => CHARACTER_EVENT_WARPS[every].versionInfo == versionKey);
    var output = []
    for (var i = 0; i < filteredOutItems.length; i++) {
        output.push(CHARACTER_EVENT_WARPS[filteredOutItems[i]].contents()[0]);
    }
    return output;
}
function getVersionSupLightcones(versionKey) {
    var filteredOutItems = [];
    var allLCPools = Object.keys(LIGHTCONE_EVENT_WARPS);
    filteredOutItems = allLCPools.filter((every) => LIGHTCONE_EVENT_WARPS[every].versionInfo == versionKey);
    var output = []
    for (var i = 0; i < filteredOutItems.length; i++) {
        output.push(LIGHTCONE_EVENT_WARPS[filteredOutItems[i]].contents()[0]);
    }
    return output;
}

/**
 * 根据所选语言，更新卡池Sup的名字，同时为ALL_WARP_POOLS进行排序
 */
function refreshAllPoolSupCode() {
    rearrangeAllWarpPools();
    for (var i = 0; i < ALL_WARP_POOLS.length; i++) {
        ALL_WARP_POOLS[i] = {
            code: ALL_WARP_POOLS[i],
            upName: findItem(TOTAL_EVENT_WARPS[ALL_WARP_POOLS[i]].contents()[0][0]).fullName[LANGUAGE]
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