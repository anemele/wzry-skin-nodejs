module.exports = {
    // 数据接口
    dataAPI: 'https://pvp.qq.com/web201605/js/herolist.json',
    // 图片地址接口
    imageURL: function (ename, id) {
        return 'https://game.gtimg.cn/images/yxzj/img201606/skin/hero-info/'
            + `${ename}/${ename}-bigskin-${id}.jpg`
    },
    // 每个英雄主页
    heroPage: function (ename) {
        return 'https://pvp.qq.com/web201605/herodetail/' + ename + '.shtml'
    },
    // 本地保存目录
    savePath: 'D:\\Pictures\\game\\wzry-skin',
}