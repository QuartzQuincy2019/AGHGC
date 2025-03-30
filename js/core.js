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
    if (_chara == undefined) {
        throw new Error("findCharacter：没有找到代号为" + characterCode + "的角色。");
    }
    return _chara;
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