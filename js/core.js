/**
 * 随机0-1之间的小数。
 * @returns 小数。
 */
function getRandomDecimal() {
    return Math.random();
}

function isInteger() {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] % 1 != 0) return false;
    }
    return true;
}

function getQuotient(dividend, divisor) {
    if (!isInteger(dividend, divisor)) throw new Error("不允许接收小数！");
    if (dividend < 0 || divisor < 0) throw new Error("不允许接收负数！");
    var remainder = dividend % divisor;
    return (dividend - remainder) / divisor;
}

/**
 * 通过角色识别名获取角色对象。
 * @param {String} characterCode 
 * @returns 角色(Character)类型的值，若未找到则返回false。
 */
function findCharacter(characterCode) {
    var _chara = characterMap[characterCode];
    return _chara;
}

function findLightcone(lightconeCode) {
    var _lc = lightconeMap[lightconeCode];
    return _lc;
}

function isCharacter(item) {
    return item instanceof Character;
}

function isLightcone(item) {
    return item instanceof Lightcone;
}

function findItem(code) {
    if (characterMap.hasOwnProperty(code)) return findCharacter(code);
    if (lightconeMap.hasOwnProperty(code)) return findLightcone(code);
    throw new Error("findItem: 没有找到代号为" + code + "的对象。");
}

/**
 * 为了防止形成类似于C++指针的效果而设计的函数
 * 用于整个数组赋值
 * @param {Array} valueArray 
 */
function doValue(valueArray) {
    var temp = [];
    for (var i = 0; i < valueArray.length; i++) {
        temp.push(valueArray[i]);
    }
    return temp;
}

/**
 * 随机返回数组中的一个元素
 * @param {Array} arr 
 * @returns 
 */
function getRandomElement(arr) {
    // 生成一个随机索引
    const randomIndex = Math.floor(Math.random() * arr.length);
    // 返回对应索引的元素
    return arr[randomIndex];
}

function deepClone(target) {
    if (typeof target === 'object' && target !== null) {
        return JSON.parse(JSON.stringify(target));
    } else {
        return target;
    }
}

//角色查询
/**
 * 从OBTAINED_ITEMS获取指定角色
 * @param {object} repository 
 * @param {string} codeName 
 */
function collectRecordsByCodeName(repository, targetCodeName) {
    const result = repository.filter((obj) => obj.rStatus.codeName == targetCodeName);
    return result;
}

/**
 * 实现数组去重
 * @param {Array} _arr 
 * @returns 
 */
function findUnique(_arr) {
    const seen = Object.create(null); // 使用无原型的对象提升性能
    const result = [];
    const len = _arr.length;
    for (let i = 0; i < len; i++) {
        const num = _arr[i];
        if (!seen[num]) {
            seen[num] = true;
            result.push(num);
        }
    }
    return result;
}


function findUniqueWithCount(_arr) {
    const seen = Object.create(null);  // 记录元素是否已首次出现
    const countMap = Object.create(null);  // 统计元素总次数
    const result = [];
    const len = _arr.length;

    for (let i = 0; i < len; i++) {
        const num = _arr[i];
        // 统计元素次数
        countMap[num] = (countMap[num] || 0) + 1;
        // 维护唯一顺序
        if (!seen[num]) {
            seen[num] = true;
            result.push(num);
        }
    }

    // 转换为对象数组
    return result.map(element => ({
        element: element,
        duplication: countMap[element]
    }));
}

/**
 * 格式化浮点数
 * @param {number} value - 原始值
 * @param {number} decimals - 要保留的小数位数
 * @param {boolean} returnString - 是否返回字符串（默认 true）
 * @returns {string|number}
 */
function formatFloat(value, decimals = 4, returnString = true) {
    if (isNaN(value)) return returnString ? "NaN" : NaN;

    const factor = Math.pow(10, decimals);
    const rounded = Math.round(value * factor) / factor;

    return returnString
        ? rounded.toFixed(decimals)
        : rounded;
}

/**
 * 获取该集合对于全集的补集。
 * @param {Set} U 全集
 * @returns 
 */
Set.prototype.getComplimentFrom = function (U) {
    return new Set([...U].filter((element) => !this.has(element)));
}

/**
 * 
 * @param {number} test 
 * @param {number} mjd_start 
 * @param {number} mjd_end 
 * @returns 0：在期间   1：在之后    -1：在之前
 */
function ofPeriod(test, mjd_start, mjd_end) {
    if (!test || !mjd_start || !mjd_end) {
        throw new Error("ofPeriod: MJD指定出现错误：\n" + test + "\n" + mjd_start + "\n" + mjd_end);
    }
    if (mjd_start <= test && test <= mjd_end) return 0;
    if (test > mjd_end) return 1;
    if (test < mjd_start) return -1;
}

Array.prototype.remove = function (val) {
    const index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
}

Array.prototype.toRemoved = function (val) {
    const index = this.indexOf(val);
    if (index > -1) {
        return this.toSpliced(index, 1);
    }
}

/**
 * 
 * @param {string} path 
 * @param {*} callback 接受一个布尔值参数，表示图片是否存在
 * 应用示例：
 * checkImageExists('path/to/image.jpg', function(exists) {
 *     if (exists) {
 *         console.log('图片存在');
 *     } else {
 *        console.log('图片不存在');
 *     }
 */
function checkImageExists(path, callback) {
    const img = new Image();
    img.onload = function () {
        callback(true); // 图片存在
    };
    img.onerror = function () {
        callback(false); // 图片不存在
    };
    img.src = path;
}