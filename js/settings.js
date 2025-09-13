var LANGUAGE = "zh-CN";
var testMaximum = 100000;

/**
 * 今天对应的简化儒略日(MJD)
 */
var TODAY = 0;
{
    let now = new Date();
    TODAY = dateToMJD(now);
}
// TODAY=60870;

const BOXED_COLUMN = 15;//每行展示的记录数
const PRECISION = 5; //概率显示精度(百分比小数点后x位)