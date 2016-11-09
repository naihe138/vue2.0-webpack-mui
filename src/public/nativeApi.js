/**
 * Created by huangjun on 16-4-25.
 * 原生API
 */
import Vue from 'vue';
import resource from 'vue-resource';
// 测试角色配置
Vue.use(resource);
define(function (require, exports, module) {
  /**
   * 判断系统环境
   * */
  var os = getOSInfo();
  function getOSInfo () {
    var os = {};
    var ua = navigator.userAgent;
    var wechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i);
    if (wechat) {
      os.wechat = {
        version: wechat[2].replace(/_/g, '.')
      };
    }
    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    if (android) {
      os.android = true;
      os.version = android[2];
      os.isBadAndroid = !(
        /Chrome\/\d/.test(window.navigator.appVersion)
      );
    }
    var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    if (iphone) {
      os.ios = os.iphone = true;
      os.version = iphone[2].replace(/_/g, '.');
    } else if (ipad) {
      os.ios = os.ipad = true;
      os.version = ipad[2].replace(/_/g, '.');
    }
    if (/win|mac/i.test(navigator.platform)) {
      os.ios = false;
      os.android = false;
    }
    var uaWechat = navigator.userAgent.toLowerCase();
    if (uaWechat.match(/MicroMessenger/i) == 'micromessenger') {
      os.ios = false;
      os.android = false;
    }
    return os;
  }

  /**
   * 1.代理请求
   */
  var requestCount = 0;

  function ajax (option) {
    console.log('----------------', JSON.stringify(option));
    option.type = option.type || 'post';
    var param = option.param;
    var arr = [];
    var flag = option.url.indexOf('.json') === (
        option.url.length - 5
      );
    if (option.type.toLowerCase() === 'get') {
      if (param) {
        for (var key in param) {
          arr.push(key + '=' + param[key]);
        }
        param = arr.join('&');
        /*
         转义*/
        if (param) {
          if (os.ios) {
            param = encodeURI(encodeURI(param));
          } else if (os.android) {
            param = encodeURI(param);
          }
          option.url = option.url + '?' + param;
        }
        option.param = '';
      }
    } else {
      // if (param) {
      //   for (var name in param) {
      //     if (name == 'pageNo' || name === 'pageSize') {
      //       arr.push(name + '=' + param[name]);
      //     }
      //   }
      //   if (arr.length > 0) {
      //     param = arr.join('&');
      //     option.url = option.url + (
      //         param ? (
      //                  '?' + param
      //         ) : ''
      //       );
      //   }
      // }
    }
    if (!option.param) {
      option.param = '';
    }
    console.log('接口路径-------=' + option.url, '接口参数=' + JSON.stringify(option.param));
    loading.show('努力加载中...');
    requestCount++;
    var funcName = 'requestFinish' + requestCount;
    // console.log('接口回调名-----' + funcName);
    var errorName = 'requestFinishError' + requestCount;
    var postData = {
      'header': option.header || {
        'content-Type': 'application/json'
      },
      'reqURL': option.url,
      'reqType': option.type,
      'sCallback': funcName,
      'fCallback': errorName
    };
    // 刘勇增加去null  与 '' 处理 后台不允许空字符
    var dataClearNull = {};
    for (var key in option.param) {
      if (option.param[key] !== '' && option.param[key] !== null) {
        dataClearNull[key] = option.param[key];
      };
    };
    // modify by liyang
    if (postData.header['content-Type'] && postData.header['content-Type'].toLowerCase() == 'application/json') {
      postData['body'] = dataClearNull;
    } else {
      postData['datas'] = dataClearNull;
    }

    window[funcName] = function (retData) {
      console.log('成功回调---------', JSON.stringify(retData));
      setTimeout(function () {
        loading.hide();
      }, 100);
      /* 请求成功*/
      if (typeof retData === 'string' && retData) {
        retData = JSON.parse(retData);
      }
      option.success(retData);
    };
    window[errorName] = function (retData) {
      /* 请求失败*/
      setTimeout(function () {
        loading.hide();
      }, 100);
      option.error(retData);
    };
    if (os.ios && !flag) {

      setTimeout(function () {
        console.log('发起IOS请求iframe  reqInterfaceProxy(' + JSON.stringify(postData) + ')');
        // window.location.href = 'reqInterfaceProxy(' + JSON.stringify(postData) + ')';
        // 动态创建框架
        var iframe = document.createElement('iframe');
        // 框架中加载的页面
        iframe.src = 'reqInterfaceProxy(' + JSON.stringify(postData) + ')';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }, 50);
    } else if (os.android && !flag) {
      kndfunc.reqInterfaceProxy(JSON.stringify(postData));
    } else {
      Vue.http({
        headers: option.header || {},
        url: option.url,
        method: option.type,
        emulateJSON: option.emulateJSON,
        data: option.param
      }).then(function (retData) {
        window[funcName](retData.data);
      }, function (retData) {
        window[errorName](retData);
      });
      // $.ajax({
      //     'url' : option.url,
      //     'type' : option.type,
      //     'data' : JSON.stringify(option.param),
      //     'contentType': 'application/json',
      //     success : function( retData ) {
      //         window[funcName](retData);
      //     },
      //     error : function() {
      //         window[errorName]();
      //     }
      // });
    }
  }
  function ajaxWeb (option) {
    console.log('1111111111111----------------', JSON.stringify(option));
    option.type = option.type || 'post';
    var param = option.param;
    var arr = [];
    var flag = option.url.indexOf('.json') === (
        option.url.length - 5
      );
    if (option.type.toLowerCase() === 'get') {
      if (param) {
        for (var key in param) {
          arr.push(key + '=' + param[key]);
        }
        param = arr.join('&');
        /*
         转义*/
        if (param) {
          if (os.ios) {
            param = encodeURI(encodeURI(param));
          } else if (os.android) {
            param = encodeURI(param);
          }
          option.url = option.url + '?' + param;
        }
        option.param = '';
      }
    } else {
    }
    if (!option.param) {
      option.param = '';
    }
    console.log('接口路径-------=' + option.url, '接口参数=' + JSON.stringify(option.param));
    loading.show('努力加载中...');
    requestCount++;
    var funcName = 'requestFinish' + requestCount;
    // console.log('接口回调名-----' + funcName);
    var errorName = 'requestFinishError' + requestCount;
    var postData = {
      'header': option.header || {
        'content-Type': 'application/json'
      },
      'reqURL': option.url,
      'reqType': option.type,
      'sCallback': funcName,
      'fCallback': errorName
    };
    // 刘勇增加去null  与 '' 处理 后台不允许空字符
    var dataClearNull = {};
    for (var key in option.param) {
      if (option.param[key] !== '' && option.param[key] !== null) {
        dataClearNull[key] = option.param[key];
      };
    };
    // modify by liyang
    if (postData.header['content-Type'] && postData.header['content-Type'].toLowerCase() == 'application/json') {
      postData['body'] = dataClearNull;
    } else {
      postData['datas'] = dataClearNull;
    }

    window[funcName] = function (retData) {
      console.log('成功回调---------', JSON.stringify(retData));
      setTimeout(function () {
        loading.hide();
      }, 100);
      /* 请求成功*/
      if (typeof retData === 'string' && retData) {
        retData = JSON.parse(retData);
      }
      option.success(retData);
    };
    window[errorName] = function (retData) {
      /* 请求失败*/
      setTimeout(function () {
        loading.hide();
      }, 100);
      option.error(retData);
    };
    Vue.http({
      headers: option.header || {},
      url: option.url,
      method: option.type,
      emulateJSON: option.emulateJSON,
      data: option.param
    }).then(function (retData) {
      window[funcName](retData.data);
    }, function (retData) {
      window[errorName](retData);
    });

  }
  var frameCount = 0;

  function uploadFilePC (potions) {
    document.querySelector('#uploadPc') && document.querySelector('#uploadPc').remove();
    var frag = document.createDocumentFragment();
    var $form = document.createElement('form');
    $form.setAttribute('id', 'uploadPc');
    $form.setAttribute('action', potions.url);
    $form.setAttribute('method', 'post');
    $form.setAttribute('enctype', 'multipart/form-data');
    $form.style.display = 'none';
    var $input = document.createElement('input');
    $input.setAttribute('id', 'uploadFiles');
    $input.setAttribute('name', 'file');
    $input.setAttribute('type', 'file');
    $form.appendChild($input);
    frag.appendChild($form);
    document.body.appendChild(frag);
    $input.addEventListener('chance', function () {
      fileUpload();
    });
    $input.click();
    return;

    function fileUpload () {
      var fileValue = $input.val();
      // var imgExt = fileValue.substring(fileValue.lastIndexOf('.'), fileValue.length);
      var imgSize = document.getElementById('uploadFiles').files[0].size / 1024;
      if (!fileValue) {
        return;
      }
      /* if ('.jpg|.jpeg|.gif|.bmp|.png|'.indexOf(imgExt.toLocaleLowerCase() + '|') == -1) {
       mui.alert('上传图片格式不正确，请重新上传！', '提示', function(){});
       return;
       }*/
      if (!(
          imgSize > 0 && imgSize <= 2048
        )) {
        potions.error();
        return;
      }
      var form = $form;
      var id = 'jqFormIO' + frameCount++;
      var $io = document.createElement('iframe');
      $io.setAttribute('id', id);
      $io.setAttribute('name', id);
      $io.style.position = 'absolute';
      $io.style.top = '-1000px';
      $io.style.left = '-1000px';
      var io = $io;
      setTimeout(function () {
        document.body.appendChild($io);
        $io.attachEvent ? $io.attachEvent('onload', cb) : $io.addEventListener('load', cb, false);
        // var encAttr = form.encoding ? 'encoding' : 'enctype';
        var t = $form.getAttribute('target');
        $form.setAttribute('target', id);
        $form.setAttribute('method', 'POST');
        $form.setAttribute('encAttr', 'multipart/form-data');
        $form.setAttribute('action', potions.url);
        potions.onSend();
        form.submit();
        $form.setAttribute('target', t); // reset target
      }, 10);

      function cb () {
        io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);
        var ok = true;
        try {
          var data, doc;
          doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
          data = doc.body ? doc.body.innerText : null;
          if (potions.dataType === 'json') {
            data = JSON.parse(data) || {};
          }
        } catch (e) {
          ok = false;
        }

        if (ok) {
          if (data) {
            console.log('===上次结果===' + data);
            potions.success(data);
          } else {
            potions.error();
          }
        } else {
          potions.error();
        }
        setTimeout(function () {
          $io.remove();
          $form.remove();
        }, 100);
      }
    }
  }

  /**
   * 2.获取用户信息
   */
  function getLoginInfo (param) {
    window['setLoginInfo'] = function (result) {
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['setLoginInfo'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'setLoginInfo';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      setTimeout(function () {
        var iframe = document.createElement('iframe');
        // 框架中加载的页面
        iframe.src = 'getLoginInfo(' + jsonParam + ')';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
      }, 10);
    } else if (os.android) {
      kndfunc.getLoginInfo(jsonParam);
    } else {
      window['setLoginInfo']({
        'id': 59,
        'loginName': '8000159',
        'userName': '程小娟',
        'email': 'hehp@coracle.com',
        'imageAddress': '',
        'address': '',
        'sex': 'NONE',
        'phone': '',
        'telephone': '',
        'signature': '',
        'orgName': '',
        'userSystem': 'BORCCI',
        'userType': 'employee',
        'roles': [
          {
            'code': 'A003',
            'roleId': '8003192',
            'roleName': '张三'
          }
        ]
      });
    }
  }

  /**
   * 3.拍照
   */
  function goPhoto (param) {
    window['photoFinish'] = function (result) {
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
      if (result.isUpload) {
        loading.show('正在上传...');
        return;
      }
      loading.hide();
      if (result.status === 'cancel') {
        window['photoFinish'] = null;
        return;
      }
      if (+result.status === 1 || (
          result.code !== 200 && param.uploadUrl
        )) {
        param.error(result);
        window['photoFinish'] = null;
        return;
      }
      if (!result.imgPath && (
          os.ios || os.android
        )) {
        window['photoFinish'] = null;
        return;
      }
      param.success(result);
      window['photoFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'photoFinish';
    jsonParam.fCallback = 'photoFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'goPhoto(' + jsonParam + ')';
    } else if (os.android) {
      capturefunc.goPhoto(jsonParam);
    } else {
      uploadFilePC({
        'url': JSON.parse(jsonParam).uploadUrl,
        onSend: function () {
          window['photoFinish']({
            'isUpload': true
          });
        },
        success: function (retData) {
          loading.hide();
          if ('string' == typeof retData) {
            retData = JSON.parse(retData);
          }
          window['photoFinish'](retData);
        },
        error: function (result) {
          loading.hide();
          param.error(result);
        }
      });
    }
  }

  /**
   * 4.相册
   */
  function fromImgLibrary (param) {
    window['photoFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      if (result.isUpload) {
        loading.show('正在上传...');
        return;
      }
      loading.hide();
      if (result.status == 'cancel') {
        window['photoFinish'] = null;
        return;
      }
      if (result.status == 1 || (
          result.code != 200 && param.uploadUrl
        )) {
        param.error(result);
        window['photoFinish'] = null;
        return;
      }
      if (!result.imgPath && (
          os.ios || os.android
        )) {
        window['photoFinish'] = null;
        // return;
      }
      param.success(result);
      window['photoFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'photoFinish';
    jsonParam.fCallback = 'photoFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'fromImgLibrary(' + jsonParam + ')';
    } else if (os.android) {
      capturefunc.fromImgLibrary(jsonParam);
    } else {
      uploadFilePC({
        'url': JSON.parse(jsonParam).uploadUrl,
        onSend: function () {
          window['photoFinish']({
            'isUpload': true
          });
        },
        success: function (retData) {
          loading.hide();
          if ('string' == typeof retData) {
            retData = JSON.parse(retData);
          }
          window['photoFinish'](retData);
        },
        error: function () {
          loading.hide();
          param.error(result);
        }
      });
    }
  }

  /**
   * 5.录音
   */
  function goRecord (param) {
    window['videoFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      if (result.isUpload) {
        loading.show('正在上传...');
        return;
      }
      loading.hide();
      if (result.status == 'cancel') {
        /*取消，不处理*/
        window['videoFinish'] = null;
        return;
      }
      if (result.status == 1 || (
          result.code != 200 && param.uploadUrl
        )) {
        param.error(result);
        window['videoFinish'] = null;
        return;
      }
      if (!result.recordPath && (
          os.ios || os.android
        )) {
        window['videoFinish'] = null;
        return;
      }
      var recordTime = (
        parseFloat(result.recordTime)
      ).toFixed(1);
      if (recordTime > 60) {
        var m = parseInt(recordTime / 60),
          s = parseInt(recordTime % 60);
        recordTime = m + '′' + s + '″';
      } else {
        recordTime = recordTime + '″';
      }
      result.recordTime = recordTime;
      param.success(result);
      window['videoFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'videoFinish';
    jsonParam.fCallback = 'videoFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'goRecord(' + jsonParam + ')';
    } else if (os.android) {
      recordingfunc.goRecord(jsonParam);
    } else {
      uploadFilePC({
        'url': JSON.parse(jsonParam).uploadUrl,
        onSend: function () {
          window['videoFinish']({
            'isUpload': true
          });
        },
        success: function (retData) {
          loading.hide();
          if ('string' == typeof retData) {
            retData = JSON.parse(retData);
          }
          retData.recordTime = 2;
          window['videoFinish'](retData);
        },
        error: function (retData) {
          loading.hide();
          param.error(retData)
        }
      });
    }
  }

  /**
   * 6.播放录音
   * 支持先下载，然后播放
   */
  function openRecord (param) {
    var jsonParam = param.apiJson || {};
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'openRecord(' + jsonParam + ')';
    } else if (os.android) {
      recordingfunc.openRecord(jsonParam);
    }
  }

  /**
   * 7.语音录入
   */
  function cloundVol (param) {
    window['cloundVolFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['cloundVolFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'cloundVolFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'cloundVol(' + jsonParam + ')';
    } else if (os.android) {
      cloundvolfunc.cloundVol(jsonParam);
    }
  }

  /**
   * 8.名片扫描
   */
  function bcardScan (param) {
    window['scanFinish'] = function (result) {
      if (os.ios) {
        result = decodeURI(result);
      }
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      if (result.isUpload) {
        loading.show('正在解析...');
        return;
      }
      loading.hide();
      if (result.status == 'cancel') {
        window['scanFinish'] = null;
        return;
      }
      if (result.status == 1 || (
          result.code != 200 && param.uploadUrl
        )) {
        param.error(result)

        window['scanFinish'] = null;
        return;
      }
      param.success(result);
      window['scanFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'scanFinish';
    jsonParam.fCallback = 'scanFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'bcardScan(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.bcardScan(jsonParam);
    } else {
      window['scanFinish'](JSON.stringify({
        'code': '200',
        'fId': '1402',
        'fileUrl': 'http://192.168.8.24:8080/uf/2016/06/19/1466325193009_t.png',
        'address': '深圳市南山区高新南一道深圳市南山区高新南一道()深圳市宝安区',
        'email': 'luoi@coracle.com',
        'company': '圆舟科技',
        'tel': '18954867254()8675523982505',
        'name': '华晃'
      }));
    }
  }

  /**
   * 9.查询手机通讯录
   * 应用 联系人联系人快捷新建
   */
  function getContacts (param) {
    window['contactsFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['contactsBack'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'contactsFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'getContacts(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.getContacts(jsonParam);
    } else {
      param.success([
        {
          'name': '肖磊',
          'phone': '132554764646'
        },
        {
          'name': '王兰芳',
          'phone': '13693083972'
        },
        {
          'name': '李四',
          'phone': '13693224881'
        },
        {
          'name': '王五',
          'phone': '15645345654'
        }
      ]);
    }
  }

  /**
   * 10.打开地图，显示经纬度位置与当前位置
   * 支持 导航
   */
  function showMap (param) {
    var jsonParam = param.apiJson || {};
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'showMap(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.showMap(jsonParam);
    }
  }

  /**
   * 11.位置纠偏
   */
  function correctLocation (param) {
    window['correctLocationFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['contactsBack'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'correctLocationFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'correctLocation(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.correctLocation(jsonParam);
    } else {
      window['correctLocationFinish']({
        'address': '广东省深圳市福田中心区卓越大厦2202室',
        'province': '广东',
        'city': '深圳',
        'district': '福田区',
        'cityCode': '0755',
        'adcode': '440304',
        'longitude': '114.057782',
        'latitude': '22.543597'
      });
    }
  }

  /**
   * 12.打电话
   */
  function openPhone (param) {
    var jsonParam = param.apiJson || {};
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'openPhone(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.openPhone(jsonParam);
    } else {
      console.log('打电话', JSON.parse(jsonParam).phoneNum);
    }
  }

  /**
   * 13.发短信
   */
  function openMsg (param) {
    var jsonParam = param.apiJson || {};
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'openMsg(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.openMsg(jsonParam);
    }
  }

  /**
   * 14.发邮件
   */
  function openEmail (param) {
    var jsonParam = param.apiJson || {};
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'openEmail(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.openEmail(jsonParam);
    }
  }

  /**
   * 15.返回前一个webView
   */
  function goNative (param) {
    param = param || {};
    var jsonParam = param.apiJson;
    jsonParam = jsonParam ? JSON.stringify(jsonParam) : '';
    if (os.ios) {
      setTimeout(function () {
        window.location.href = 'goNative(' + jsonParam + ')';
      }, 50)
    } else if (os.android) {
      kndfunc.goNative();
    } else {
      console.log('==返回==')
    }
  }

  /**
   * 16.附件上传
   */
  function goUpload (param) {
    window['uploadSuccess'] = function (result) {
      loading.hide();
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['uploadSuccess'] = null;
    };
    window['uploadError'] = function (result) {
      loading.hide();
      if (typeof result === 'string') {
        result = JSON.parse(result);
      }
      param.error(result);
      window['uploadError'] = null;
    };
    loading.show('上传中...');
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'uploadSuccess';
    jsonParam.fCallback = 'uploadError';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'goUpload(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.goUpload(jsonParam);
    } else {
      console.log('pc暂不支持附件上传');
    }
  }

  /**
   * 17.导出到通讯录
   * 需要导出5个字段到通讯录：姓名、职位、手机、座机、公司
   */
  function insertContact (param) {
    window['insertConFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['insertConFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'insertConFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'insertContact(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.insertContact(jsonParam);
    }
  }

  /**
   * 18.查看附件
   */
  function openFile (param) {
    var jsonParam = param.apiJson || {};
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'openFile(' + jsonParam + ')';
    } else if (os.android) {
      accessoryfunc.openFile(jsonParam);
    }
  }

  /**
   * 19.下载附件
   */
  function goDownload (param) {
    // loading.show('下载中...');
    window['downLoadFinish'] = function (result) {
      // loading.hide();
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['downLoadFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'downLoadFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'goDownload(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.goDownload(jsonParam);
    } else {
      console.log('==========下载==========');
    }
  }

  /**
   * 20.获取当前位置
   */
  function getQDLocationInfo (param) {
    loading.show('地址获取中...');
    window['getQDLocationInfoFinish'] = function (result) {
      loading.hide();
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      if (result.notOpenLocation == 1) {
        param.error(result)
        window['getQDLocationInfoFinish'] = null;
        return;
      }
      param.success(result);
      window['getQDLocationInfoFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'getQDLocationInfoFinish';
    jsonParam.fCallback = 'getQDLocationInfoFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'getQDLocationInfo(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.getQDLocationInfo(jsonParam);
    } else {
      window['getQDLocationInfoFinish']({
        'address': '深圳市南山区高新南一道',
        'province': '广东',
        'city': '深圳',
        'district': '南山区',
        'adcode': '440305',
        'cityCode': '0755',
        'longitude': '113.954465',
        'latitude': '22.544644'
      });
    }
  }

  /**
   * 21.打开新的webView，并跳用新webView中页面上的funtion
   * 2016-08-03 Leo
   *  var data = {
            apiJson: {
              function: 'test',  //功能模块名称
              sCallback: '#!/customerDetail', //额外添加到地址栏的地址
              openType: ''  //打开地址的方式  1/新开webview  0/当前webview地址切换  默认是1
            }
          };
   nativeApi.goView(data);
   //实际被打开的地址  file://host/test/index.html#!/customerDetail
   */
  function goView (param) {
    var jsonParam = param.apiJson || {};
    jsonParam.param = jsonParam.param || '';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'goView(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.goView(jsonParam);
    } else {
      localStorage.setItem('go_view_param_' + JSON.parse(jsonParam).sCallback,
        JSON.stringify(JSON.parse(jsonParam).param));
      window.location.href = '../' + JSON.parse(jsonParam).function + '/index.html' + JSON.parse(jsonParam).sCallback;
    }
  }

  /**
   * 22.原生键盘
   * @param value
   * @returns {boolean}
   */
  function showKeyboard (param) {
    window['showKeyboardFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
      window['showKeyboardFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'showKeyboardFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'showKeyboard(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.showKeyboard(jsonParam);
    } else {
      console.log('键盘＝＝＝＝＝＝')
    }
  }

  /**
   * 23.隐藏键盘
   * @param value
   * @returns {boolean}
   */
  function hideKeyboard () {
    if (os.ios) {
      window.location.href = 'hideKeyboard()';
    } else if (os.android) {
      kndfunc.hideKeyboard();
    }
  }

  /**
   * 24.查看通讯录详情
   * @param value
   * @returns {boolean}
   */
  function checkBook (param) {
    var jsonParam = param.apiJson || {};
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      window.location.href = 'checkBook(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.checkBook(jsonParam);
    } else {
      console.log('通讯录＝＝＝＝＝＝')
    }
  }

  /**
   * 25.返回搜索客户数据 客户地图
   * @param {}
   * @returns {boolean}
   */
  function setCustomerData (param) {
    window['setCustomerDataFinish'] = function () {
      param.success();
      window['setCustomerDataFinish'] = null;
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'setCustomerDataFinish';
    jsonParam = JSON.stringify(jsonParam);
    if (os.android) {
      kndfunc.setAccountData(jsonParam);
    } else if (os.ios) {
      window.location.href = 'setAccountData(' + jsonParam + ')';
    } else {
      console.log('返回搜索后的客户数据' + JSON.stringify(jsonParam));
    }
  }

  /**
   * 26.本地数据库 批量插入 500一页（sqlite只支持一次批量插入500）
   * @param param
   */
  function executeSqls (param) {
    window['executesFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'executesFinish';
    if (os.android) {
      sqLitefunc.executeSqls(JSON.stringify(jsonParam));
    } else {
      /*ios与pc用sqLite*/
      window.$sqlite.db.query(jsonParam.sql, function (result) {
        window['executesFinish'](result);
      });
    }
  }

  /**
   * 27.本地数据库 单调语句运行
   * @param param
   */
  function execute (param) {
    window['executeFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'executeFinish';
    if (os.android) {
      sqLitefunc.execute(JSON.stringify(jsonParam));
    } else {
      /*ios与pc用sqLite*/
      window.$sqlite.db.query(jsonParam.sql, function (result) {
        window['executeFinish'](result);
      });
    }
  }

  /**
   * 28.本地数据库 查询
   * @param param
   */
  function executeQuery (param) {
    window['executeQueryFinish'] = function (result) {
      if (typeof result == 'string') {
        result = JSON.parse(result);
      }
      param.success(result);
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'executeQueryFinish';
    if (os.android) {
      sqLitefunc.executeQuery(JSON.stringify(jsonParam));
    } else {
      /*ios与pc用sqLite*/
      window.$sqlite.db.query(jsonParam.sql, function (result) {
        window['executeQueryFinish'](result);
      });
    }
  }

  /**
   * 29.webview之间通信
   * jsonParams :
   {
     "flag": "",
     "callBack": "",
     "data": {}
   }
   */
  function notifyOtherWeb (param, router) {
    var jsonParam = param.apiJson || {};
    // jsonParam.param = jsonParam.param || '';
    jsonParam = JSON.stringify(jsonParam);

    if (os.ios) {
      window.location.href = 'notifyOtherWeb(' + jsonParam + ')';
    } else if (os.android) {
      kndfunc.notifyOtherWeb(jsonParam);
    } else {
      // localStorage.setItem('go_view_param_' + JSON.parse(jsonParam).sCallback,
      // JSON.stringify(JSON.parse(jsonParam).param));
      // window.location.href = '../' + JSON.parse(jsonParam).flag + '/index.html#!' + router;
      console.log('网页不支持此API');
    }
  }

  /**
   * 30.扫描二维码
   */
  function qcodeScan (param) {
    console.log('qcodeScan:' + JSON.stringify(param));
    window['qcodeScanFinish'] = function (result) {
      param.success(result);
    };
    window['qcodeScanError'] = function (result) {
      param.error(result);
    };
    var jsonParam = param.apiJson || {};
    jsonParam.sCallback = 'qcodeScanFinish';
    jsonParam.fCallback = 'qcodeScanError';
    //1 单次扫描,2连续扫描
    jsonParam.type = param.type || '1';
    jsonParam = JSON.stringify(jsonParam);
    if (os.ios) {
      console.log('if os.ios:' + JSON.stringify(param));
      window.location.href = 'openQcode(' + jsonParam + ')';
    } else if (os.android) {
      qcodefunc.openQcode(jsonParam);
    }
  }

  /**非空判断**/
  function isNotNull (value) {
    if (value == undefined || value == null || value.length == 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 替换特殊字符
   * @param val
   */
  function replaceAllCh (val, type) {
    if (!val) {
      return '';
    }
    if (type) {
      val = val.replace(/x0a/g, '\n').replace(/@#$/g, '\\');
    } else {
      val = val.replace(/\n/g, 'x0a').replace(/\\/g, '@#$');
    }
    return val;
  }

  /*
   * 加载中
   *
   * */
  var loading = {
    show: function (title) {
      document.querySelector('#loading #loading-title').innerHTML = title;
      document.querySelector('#loading').style.display = 'block';
      document.querySelector('#loading #loadingDelete').addEventListener('click', function () {
        loading.hide();
      });
    },
    hide: function () {
      document.querySelector('#loading').style.display = 'none';
    }
  };
  /**
   * 设置旗标
   * 2016-09-10 Leo
   * param
   * var data={
        // 模块名称
        flagName:"prossCenter",
        //是否显示旗标 0/显示 -1/隐藏  默认是隐藏
        showFlag:0,
        //显示旗标内容 传什么显示什么
        numble:"10"
      }
      nativeApi.setFlagNumber(data);
   **/
  var setFlagNumber = function (data) {
    if (os.ios) {
      window.location.href = 'setFlagNumber(' + JSON.stringify(data) + ')';
    } else if (os.android) {
      kndfunc.setFlagNumber(JSON.stringify(data));
    } else {
      console.log('设置旗标');
    }
  };
  var nativeApi = {
    os: os,
    ajax: ajax,
    ajaxWeb: ajaxWeb,
    goNative: goNative,
    getLoginInfo: getLoginInfo,
    goPhoto: goPhoto,
    fromImgLibrary: fromImgLibrary,
    goRecord: goRecord,
    openRecord: openRecord,
    cloundVol: cloundVol,
    bcardScan: bcardScan,
    getContacts: getContacts,
    showMap: showMap,
    correctLocation: correctLocation,
    openPhone: openPhone,
    openMsg: openMsg,
    openEmail: openEmail,
    goUpload: goUpload,
    insertContact: insertContact,
    openFile: openFile,
    goDownload: goDownload,
    getQDLocationInfo: getQDLocationInfo,
    goView: goView,
    showKeyboard: showKeyboard,
    hideKeyboard: hideKeyboard,
    checkBook: checkBook,
    setCustomerData: setCustomerData,
    loading: loading,
    executeSqls: executeSqls,
    execute: execute,
    executeQuery: executeQuery,
    replaceAllCh: replaceAllCh,
    setFlagNumber: setFlagNumber,
    notifyOtherWeb: notifyOtherWeb,
    qcodeScan: qcodeScan
  };

  module.exports = nativeApi;

  window.nativeApi = nativeApi;

});
