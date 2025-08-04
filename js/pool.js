// pool.js
// 置于version.js之后

/**
 * 重新排列所有卡池，使其按照版本开始日期顺序排列
 * @param {object} allPoolsObj - 所有卡池对象
 * @param {Array[Version]} referenceVersions - 参考半版本数组，要求数组已经按照时间排列！
 * @returns {Array} - 重新排列后的卡池数组，注意，返回值不再是对象！
 */
function rearrangeAllWarpPools(allPoolsObj, referenceVersions) {
    var ingredients = Object.keys(allPoolsObj);//poolnames
    rearranged = [];
    for (eachVersion of referenceVersions) {
        let results = ingredients.filter((eachPoolName) => allPoolsObj[eachPoolName].versionInfo == eachVersion);
        if (results.length > 0) {
            rearranged = [...rearranged, ...results];
        }
    }
    return rearranged;
}