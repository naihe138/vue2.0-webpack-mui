/**
 * @file 配置文件
 * @author hewnelin
 * @date 2016/6/12
 */

var serviceList = [
  {
    dataService: 'http://www.shjhome.cn:9010/xsimple/',// 业务数据请求接口
    appid: '8aaf0708573c3ddd015741603c34046d'// 容联服务
  },
];

var serviceIndex = 0;
// var appid = serviceList[serviceIndex].appid;
var service = serviceList[serviceIndex].dataService;
var APIS = {
  /**
   * @author mahuanhuan
   * @name  添加客户
   * @api   /customer
   * @method POST
   * @param {String} name 姓名
   * @param {String} mobile 手机号码
   * @param {String} sex 姓别（0未知；1男；2女)
   * @param {String} qq qq
   * @param {String} wxCode 微信
   */
  addCustomer: service + 'api/customer',

};

export {service, APIS};
