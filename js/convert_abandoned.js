const fs = require('fs');
const path = require('path');

// 配置部分
// const SOURCE_FILE = './database.js'; // 源文件路径
// const OUTPUT_FILE = './converted.js'; // 输出文件路径
// const BACKUP_FILE = './database_backup.js'; // 备份文件路径

// 增强版正则表达式 - 同时匹配两种形式的对象
const PATTERN = /"(\S+)":\s*\{\s*"versionInfo":\s*"([^"]+)",\s*"type":\s*"([^"]+)",\s*(?:(?:get contents\(\)\s*\{\s*return\s*(\[[\s\S]*?\]);?\s*\})|(?:"contents"\s*:\s*(\[[\s\S]*?\])))\s*\}/g;

// 主转换函数 - 处理两种形式的对象
function convertPoolObjects(content) {
    return content.replace(PATTERN, (match, key, version, type, getterContents, normalContents) => {
        // 确定使用哪种内容格式
        const contents = getterContents || normalContents;
        
        // 返回转换后的格式
        return `"${key}": new Pool("${key}", "${version}", "${type}", () => ${contents})`;
    });
}

// 执行转换
try {
    // 读取源文件
    const content = fs.readFileSync(SOURCE_FILE, 'utf8');
    
    // 创建备份
    fs.copyFileSync(SOURCE_FILE, BACKUP_FILE);
    console.log(`备份已创建: ${BACKUP_FILE}`);
    
    // 执行转换
    const convertedContent = convertPoolObjects(content);
    
    // 写入输出文件
    fs.writeFileSync(OUTPUT_FILE, convertedContent, 'utf8');
    console.log(`转换完成! 输出文件: ${OUTPUT_FILE}`);
    
    console.log('注意：数组格式已完全保留，包括换行和缩进');
    
} catch (error) {
    console.error('转换过程中出错:', error);
}