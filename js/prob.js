/**
 * 以targetSUpCount和warpStatus为变量的函数。求至少获得targetSUpCount个五星Up的概率（动态规划实现）
 * @param {PoolType} poolType 卡池类型
 * @param {number} maxTimes 投入票数
 * @param {number} targetSUpCount 目标五星Up数量
 * @param {WarpStatus} warpStatus 当前抽卡状态
 * @returns 
 */
// 计算抽卡概率的主函数（支持自定义初始状态）
function getOverallProbability(poolType, maxTimes, targetSUpCount, warpStatus = GLOBAL_WARP_STATUS) {
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
/**
 * 计算从特定状态开始，抽到N个五星Up角色/光锥的期望抽数 (AI)
 * @param {number} targetCount 目标五星Up数量 (N)
 * @param {Object} warpStatus 当前抽卡状态 { SCount: number, SupSwitch: number }
 * @param {PoolType} poolType 卡池类型 (PoolType.Character 或 PoolType.LightCone)
 * @returns {number} 期望抽数
 */
function calculateExpectedPulls(targetCount, warpStatus, poolType) {
    // 根据卡池类型设置参数
    const isLightCone = poolType === PoolType.LightCone;
    const PITY_MAX = isLightCone ? 80 : 90;
    const G = isLightCone ? 0.78125 : 0.5625;
    const initialPity = warpStatus.SCount;
    const initialGuarantee = warpStatus.SupSwitch;

    // 如果目标数量为0，则期望为0
    if (targetCount <= 0) {
        return 0;
    }

    // 使用动态规划计算期望
    // dp[pity][guarantee][upCount] = 从该状态开始的期望抽数
    let dp = new Array(PITY_MAX);
    for (let i = 0; i < PITY_MAX; i++) {
        dp[i] = new Array(2);
        for (let j = 0; j < 2; j++) {
            dp[i][j] = new Array(targetCount + 1).fill(-1);
        }
    }

    // 递归计算期望
    function dfs(pity, guarantee, upCount) {
        // 如果已经达到或超过目标，期望为0
        if (upCount >= targetCount) {
            return 0;
        }

        // 如果已经计算过，直接返回结果
        if (dp[pity][guarantee][upCount] >= 0) {
            return dp[pity][guarantee][upCount];
        }

        // 获取当前垫数下的五星概率
        const p = calculateSProbability(pity, poolType);

        let expected = 1; // 当前这一抽

        // 不出五星的情况
        if (pity < PITY_MAX - 1) {
            expected += (1 - p) * dfs(pity + 1, guarantee, upCount);
        } else {
            // 保底抽必出五星，所以不会进入这个分支
        }

        if (isLightCone) {
            // 光锥池的特殊规则
            if (guarantee === 0) { // 无保底
                // 出Up光锥
                expected += p * G * dfs(0, 0, upCount + 1);
                // 出非Up光锥
                expected += p * (1 - G) * dfs(0, 1, upCount);
            } else { // 有保底
                // 必出Up光锥
                expected += p * dfs(0, 0, upCount + 1);
            }
        } else {
            // 角色池的规则
            if (guarantee === 0) { // 小保底
                // 出Up角色
                expected += p * G * dfs(0, 0, upCount + 1);
                // 出非Up角色
                expected += p * (1 - G) * dfs(0, 1, upCount);
            } else { // 大保底
                // 必出Up角色
                expected += p * dfs(0, 0, upCount + 1);
            }
        }

        // 缓存结果
        dp[pity][guarantee][upCount] = expected;
        return expected;
    }

    // 从初始状态开始计算
    return dfs(initialPity, initialGuarantee, 0);
}