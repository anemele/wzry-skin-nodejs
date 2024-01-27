const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const log = require('log4js');
const request = require('./request');

let logger = log.getLogger()
logger.level = 'INFO'

module.exports = logger

// 数据接口
const dataAPI = 'https://pvp.qq.com/web201605/js/herolist.json'
// 图片地址接口
function imageURL(ename, id) {
    return 'https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/'
        + `${ename}/${ename}-bigskin-${id}.jpg`
}
// 每个英雄主页
function heroPage(ename) {
    return 'https://pvp.qq.com/web201605/herodetail/' + ename + '.shtml'
}

function mkdirSync(path) {
    if (!fs.existsSync(path)) {
        logger.info('MKDIR', path)
        fs.mkdirSync(path)
    }
}

// 读取配置文件
const configFile = './config.json';
const config = JSON.parse(fs.readFileSync(configFile))
let savePath = config.savePath

// 创建保存路径目录
mkdirSync(savePath)
logger.info('SAVE AT', savePath)

logger.info('START')
request.getHtml(dataAPI).then(function (response) {

    JSON.parse(response).forEach(function (hero) {

        let heroPath = `${hero.cname}_${hero.title}`
        heroPath = path.join(savePath, heroPath)
        mkdirSync(heroPath)

        let heroPageUrl = heroPage(hero.ename)

        logger.info('GET', heroPageUrl)
        request.getHtml(heroPageUrl, 'gbk').then(function (html) {

            // html 转换为 dom 对象
            cheerio.load(html)
                /* 此处参看网页源码，devtool 有部分代码是动态生成的 */
                ('ul.pic-pf-list.pic-pf-list3').attr('data-imgname')
                // 去除冗余信息
                .split(/[&\d\|\s]+/).slice(0, -1)
                .forEach(function (skin, index) {
                    let skinPath = `${index + 1}_${skin}.jpg`
                    skinPath = path.join(heroPath, skinPath)
                    if (fs.existsSync(skinPath)) {
                        // logger.warn('EXIST', skinPath)

                        // 跳出本次循环用 return 相当于 continue
                        // 跳出整个循环用 throw 抛出错误，相当于 break
                        return
                    }

                    logger.info('SAVE', skinPath)
                    let skinUrl = imageURL(hero.ename, index + 1)

                    request.getBytes(skinUrl, skinPath)
                })

        }).catch(err => {
            logger.error(err, heroPageUrl)
        })
    })
})
