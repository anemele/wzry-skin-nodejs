/**
 * Download wzry skin pictures
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const request = require('./request');
const config = require('./config');
const logger = require('./logger');

function mkdirSync(path) {
    if (!fs.existsSync(path)) {
        logger.info('MKDIR', path)
        fs.mkdirSync(path)
    }
}

(function main() {
    logger.info('SAVE AT', config.savePath)
    mkdirSync(config.savePath)

    logger.info('START')
    request.getHtml(config.dataAPI).then(function (response) {

        JSON.parse(response).forEach(function (hero) {

            let heroPath = `${hero.cname}_${hero.title}`
            heroPath = path.join(config.savePath, heroPath)
            mkdirSync(heroPath)

            let heroPageUrl = config.heroPage(hero.ename)

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
                        let skinUrl = config.imageURL(hero.ename, index + 1)

                        request.getBytes(skinUrl, skinPath)
                    })

            }).catch(err => {
                logger.error(err, heroPageUrl)
            })
        })
    })

})()