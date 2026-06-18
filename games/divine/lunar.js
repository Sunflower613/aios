
// 农历转换函数
function getLunarDate(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    
    // 农历数据
    var lunarData = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,//1900-1909
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,//1910-1919
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,//1920-1929
    0x06566, 0x0d4a0, 0x0ea50, 0x16a95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,//1930-1939
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,//1940-1949
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,//1950-1959
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,//1960-1969
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,//1970-1979
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,//1980-1989
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,//1990-1999
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,//2000-2009
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,//2010-2019
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,//2020-2029
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,//2030-2039
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,//2040-2049
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,//2050-2059
    0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,//2060-2069
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,//2070-2079
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,//2080-2089
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,//2090-2099
    0x0d520];//2100

    function lYearDays(year) {
        let sum = 348; // 29*12
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (lunarData[year - 1900] & i) ? 1 : 0;
        }
        return sum + leapDays(year);
    }
    
    function leapMonth(year) {
        return (lunarData[year - 1900] & 0xf);
    }
    
    function leapDays(year) {
        if (leapMonth(year)) {
            return (lunarData[year - 1900] & 0x10000) ? 30 : 29;
        }
        return 0;
    }
    
    function monthDays(year, month) {
        return (lunarData[year - 1900] & (0x10000 >> month)) ? 30 : 29;
    }
    
    // 公历日期转换为农历日期
    function solarToLunar(year, month, day) {
        let y = parseInt(year);
        let m = parseInt(month);
        let d = parseInt(day);
    
        //年份限定、上限
        if (y < 1900 || y > 2100) {
            return -1;
        }
        //公历传参最下限
        if (y === 1900 && m === 1 && d < 31) {
            return -1;
        }
    
        let i, leap = 0, temp = 0;
        let offset = (Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 31)) / 86400000;
        for (i = 1900; i < 2101 && offset > 0; i++) {
            temp = lYearDays(i);
            offset -= temp;
        }
        if (offset < 0) {
            offset += temp;
            i--;
        }
    
        //农历年
        const lunarYear = i;
        leap = leapMonth(i); //闰哪个月
        let isLeap = false;
    
        //效验闰月
        for (i = 1; i < 13 && offset > 0; i++) {
            //闰月
            if (leap > 0 && i === (leap + 1) && !isLeap) {
                --i;
                isLeap = true;
                temp = leapDays(lunarYear); //计算农历闰月天数
            } else {
                temp = monthDays(lunarYear, i);//计算农历普通月天数
            }
            //解除闰月
            if (isLeap && i === (leap + 1)) {
                isLeap = false;
            }
            offset -= temp;
        }
        // 闰月导致数组下标重叠取反
        if (offset === 0 && leap > 0 && i === leap + 1) {
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                --i;
            }
        }
        if (offset < 0) {
            offset += temp;
            --i;
        }
        //农历月
        let lunarMonth = i;
        if (isLeap) {
            lunarMonth = -lunarMonth;
        }
        //农历日
        const lunarDay = offset + 1;
    
        console.log("公历日期：", year, month, day);
        console.log("农历日期：", lunarYear, lunarMonth, lunarDay);
        return [lunarMonth, lunarDay];
    }
// 测试
//solarToLunar(2024, 4, 24); // 输出：农历日期： 2024 3 16

    var hour = date.getHours();
    // 将小时转换为农历时辰
    function getLunarHour(hour) {
        if (hour == 23) return 1;
        else return Math.ceil(hour/2)+1;
    }
    // 测试
    // console.log("hour=23, lunarHour=" + getLunarHour(23)); // 输出：hour=23, lunarHour=1
    // console.log("hour=1, lunarHour=" + getLunarHour(1));   // 输出：hour=1, lunarHour=2
    // console.log("hour=19, lunarHour=" + getLunarHour(19)); 
    // console.log("hour=22, lunarHour=" + getLunarHour(22)); 

    var lunarDate = solarToLunar(year, month, day);
    //var lunarDate = solarToLunar(2023, 3, 25);
    lunarDate.push(getLunarHour(hour));
    return lunarDate;
}
function setLunarTime() {
var date = new Date();
var lunarDate = getLunarDate(date);
var month = lunarDate[0];
var day = lunarDate[1];
var hour = lunarDate[2];
console.log("获取日期：", month, day, hour);


// 添加月份选项
var monthSelect = document.getElementById("lMonth");
var chineseMonths = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];
for (var i = 0; i < 12; i++) {
    var option = document.createElement("option");
    option.value = i + 1;
    option.text = chineseMonths[i];
    if (month>0&&i == month-1) option.selected = true;
    monthSelect.appendChild(option);
}
for (var i = 0; i < 12; i++) {
    var option = document.createElement("option");
    option.value = -(i + 1);
    option.text = "闰"+chineseMonths[i];
    if (month<0&&i == Math.abs(month)-1) option.selected = true;
    monthSelect.appendChild(option);
}

// 添加日选项
var daySelect = document.getElementById("lDay");
var chineseDays = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
for (var i = 0; i < 30; i++) {
    var option = document.createElement("option");
    option.value = i + 1;
    option.text = chineseDays[i];
    if (i === day-1) option.selected = true;
    daySelect.appendChild(option);
}

// 添加时辰选项
var hourSelect = document.getElementById("lHour");
var chineseHours = ["子时", "丑时", "寅时", "卯时", "辰时", "巳时", "午时", "未时", "申时", "酉时", "戌时", "亥时"];
for (var i = 0; i < 12; i++) {
    var option = document.createElement("option");
    option.value = i + 1;
    option.text = chineseHours[i];
    if (i === hour-1) option.selected = true;
    hourSelect.appendChild(option);
}
}

function displayTime() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    // 添加前导零
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    var currentTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    document.getElementById('time').innerText = currentTime;
    }

function calresult(month, day, hour) {
    var m, d, h, t;
    m=(Math.abs(month)-1)%6;
    d=(day-1)%6;
    h=(hour-1)%6;
    console.log(m, d, h);
    t = (m+d+h) % 6;
    return t;
}
function displayResult() {
    var result = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"];
    var month = document.getElementById('lMonth').value;
    var day = document.getElementById('lDay').value;
    var hour = document.getElementById('lHour').value;
    var t = calresult(month, day, hour);
    
    document.getElementById('calresult').innerText = "计算结果：" + result[t];
    alert(result[t]);
}
