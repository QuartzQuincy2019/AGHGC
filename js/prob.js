/**
 * 返回投入票数times时，至少获得targetSUpCount个五星Up的概率（动态规划实现）
 * @param {PoolType} poolType 卡池类型
 * @param {number} maxTimes 投入票数
 * @param {number} targetSUpCount 目标五星Up数量
 * @param {WarpStatus} warpStatus 当前抽卡状态
 * @returns 
 */
// 计算抽卡概率的主函数（支持自定义初始状态）
function getProbabilityArray(poolType, maxTimes, targetSUpCount, warpStatus = GLOBAL_WARP_STATUS) {
    var PITY_MAX = (poolType === PoolType.LightCone) ? 80 : 90;
    var g = (poolType === PoolType.LightCone) ? 0.78125 : 0.5625; // 五星中Up的概率

    // 初始化DP数组
    var dp = new Array(maxTimes + 1);
    for (var i = 0; i <= maxTimes; ++i) {
        dp[i] = new Array(PITY_MAX);
        for (var j = 0; j < PITY_MAX; ++j) {
            dp[i][j] = new Array(2);
            for (var k = 0; k < 2; ++k) {
                dp[i][j][k] = new Array(targetSUpCount + 1).fill(0.0);
            }
        }
    }

    // 根据 warpStatus 设置初始状态
    var initialSCount = warpStatus.SCount;
    var initialK = warpStatus.SupSwitch ? 1 : 0;
    var initialL = 0; // 初始已获得Up数量，假设为0

    // 设置初始状态概率为1.0
    dp[0][initialSCount][initialK][initialL] = 1.0;

    // 创建一个数组来存储每个抽数下的概率
    var probabilityArray = new Array(maxTimes + 1).fill(0.0);

    // 动态规划主循环
    for (var i = 0; i < maxTimes; ++i) {
        for (var j = 0; j < PITY_MAX; ++j) {
            for (var k = 0; k < 2; ++k) {
                for (var l = 0; l <= targetSUpCount; ++l) {
                    var current_prob = dp[i][j][k][l];
                    if (current_prob === 0) continue;

                    // 获取当前垫数下的五星概率
                    var p = calculateSProbability(j, poolType);

                    // 不出五星的情况
                    if (j < PITY_MAX - 1) {
                        var new_j = j + 1;
                        dp[i + 1][new_j][k][l] += current_prob * (1 - p);
                    }

                    // 出五星的情况
                    if (k === 0) { // 小保底
                        // 出Up角色
                        var new_l_up = Math.min(l + 1, targetSUpCount);
                        dp[i + 1][0][0][new_l_up] += current_prob * p * g;

                        // 出非Up角色
                        dp[i + 1][0][1][l] += current_prob * p * (1 - g);
                    } else { // 大保底
                        // 必出Up角色
                        var new_l_up = Math.min(l + 1, targetSUpCount);
                        dp[i + 1][0][0][new_l_up] += current_prob * p;
                    }
                }
            }
        }

        // 计算当前抽数下的概率
        for (var j = 0; j < PITY_MAX; ++j) {
            for (var k = 0; k < 2; ++k) {
                probabilityArray[i + 1] += dp[i + 1][j][k][targetSUpCount];
            }
        }
    }

    return probabilityArray;
}