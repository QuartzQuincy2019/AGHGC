/**
 * 
 * @param {string} dateStr - 日期字符串(YYYY-MM-dd)
 * @returns 简化儒略日(MJD)
 */
function dateStringToMJD(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    let y = year;
    let m = month;

    // 处理月份为1月或2月的情况
    if (m < 3) {
        y -= 1;
        m += 12;
    }

    // 计算格里高利历的参数
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);

    // 计算儒略日（JD）
    const jd = Math.floor(365.25 * (y + 4716))
        + Math.floor(30.6001 * (m + 1))
        + day + b - 1524.5;

    // 转换为简化儒略日（MJD）
    const mjd = jd - 2400000.5;
    return mjd;
}


/**
 * 
 * @param {Date} _date 
 * @returns 
 */
function dateToMJD(_date) {
    if (typeof _date == 'string') {
        // let reg = new RegExp("/\d{4}-\d{1,2}-\d{1,2}/gm");
        // if (reg.test(_date) == true) 
        return dateStringToMJD(_date);
    }
    var y = _date.getFullYear();
    var M = _date.getMonth() + 1;
    var d = _date.getDate();
    var dateString = y + '-' + M + '-' + d;
    return dateStringToMJD(dateString);
}

function MJDToDateString(mjd) {
    return new Date((mjd - 40587) * 86400000).toISOString().slice(0, 10);
}