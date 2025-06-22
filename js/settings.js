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