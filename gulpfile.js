/* jshint node: true, strict: true */
'use strict';
/*
 =====================================
 =        Default Configuration        =
 =====================================*/
var serviceList = [
  {
    url: 'http://xxxx/',// 域名生产环境 0
    loginInfo: {
      username: 'xxxx',
      password: 'xxxx'
    }
  },
  {
    url: 'http://xxxx/',// 域名生产环境 0
    loginInfo: {
      username: 'xxxx',
      password: 'xxxx'
    }
  }
];
// Please use config.js to override these selectively:
var configIndex = 0;
var config = {
  dest: 'dist',
  url: serviceList[configIndex].url,
  urlParam: '/mxm',
  loginfo: serviceList[configIndex].loginInfo,
  publicName: 'public'
};
if (require('fs').existsSync('./config.js')) {
  var configFn = require('./config');
  configFn(config);
}
/*
 ========================================
 =            Requiring stuffs            =
 ========================================*/
var baseWebpackConfig = require('./build/webpack.base.conf');
var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var zip = require('gulp-zip');
var fs = require('fs');
var request = require('request');
var inquirer = require('inquirer');
var JSESSIONID = '';
var data = {};
var upload_modules = [];
var defaultModuleNamesFlag = false;
/*
 ================================================
 =            Report Errors to Console            =
 ================================================*/
gulp.on('error', function (e) {
  throw (
    e);
});
/*
 ====================================
 =            clean dist Task            =
 ====================================*/
gulp.task('clean_dist', function () {
  return gulp.src(
    ['./zip'], {read: false}
  ).pipe(rimraf());
});
// 是否需要全选
gulp.task('before_test_select', function (done) {
  inquirer.prompt(
    [{
      type: 'confirm',
      name: 'defaultModuleNames',
      message: '是否全选  ()',
      default: false
    }]
  ).then(function (answers) {
    if (answers.defaultModuleNames) {
      defaultModuleNamesFlag = true;
    }
    ;
    done();
  });
});
/*
 ====================================
 =             Task            =
 ====================================*/
gulp.task('test_select', ['before_test_select'], function (done) {
  console.log('开始选择包');
  var moduleNames = [];
  var defaultModuleNames = [];
  for (var name in baseWebpackConfig.entry) {
    moduleNames.push(name);
  }
  if (defaultModuleNamesFlag) {
    defaultModuleNames = moduleNames;
  }
  /*
   inquirer.prompt([
   {
   type: 'confirm',
   name: 'defaultModuleNames',
   message: '是否全选  ()',
   default: false
   }]
   ).then(function (answers) {
   if (answers.defaultModuleNames) {
   defaultModuleNames = moduleNames;
   }
   done();
   });
   */
  inquirer.prompt([
    {
      type: 'checkbox',
      name: 'moduleNames',
      message: '选择要上传的模块             ()',
      choices: moduleNames,
      default: defaultModuleNames
    }, {
      type: 'confirm',
      name: 'public',
      message: '是否需要上传公共包  public             ()',
      default: false
    }]
  ).then(function (answers) {
    upload_modules = answers.moduleNames;
    console.log('选择的包' + upload_modules);
    if (answers.public) {
      upload_modules.push(config.publicName);
    }
    done();
  });
});
gulp.task('select_modules', function (done) {
  var moduleNames = [];
  for (var i = 0, l = config.modules.length; i < l; i++) {
    if (config.modules[i].usable) {
      moduleNames.push(config.modules[i].module);
    }
  }
  inquirer.prompt([
    {
      type: 'checkbox',
      name: 'moduleNames',
      message: '选择要上传的模块             ()',
      choices: moduleNames,
      default: moduleNames
    }, {
      type: 'confirm',
      name: 'publick',
      message: '是否需要上传公共包  public             ()',
      default: false
    }], function (answers) {
    moduleNames = answers.moduleNames;
    for (var i = 0, l = moduleNames.length; i < l; i++) {
      for (var j = 0, m = config.modules.length; j < m; j++) {
        if (moduleNames[i] === config.modules[j].module) {
          upload_modules.push(config.modules[j]);
        }
      }
    }
    ;
    if (answers.publick) {
      upload_modules.push(config.publicName);
    }
    done();
  });
});
/*
 ====================================
 =            zip Task            =
 ====================================*/
gulp.task('zip', ['clean_dist'], function (done) {
  for (var key in baseWebpackConfig.entry) {
    gulp.src(['!**/*.map', './' + config.dest + '/' + key + '/**'], {base: config.dest})
        .pipe(zip(key + '.zip'))
        .pipe(gulp.dest('./zip'));
  }
  gulp.src(['!**/*.map', './' + config.dest + '/public/**'], {base: config.dest})
      .pipe(zip('public.zip'))
      .pipe(gulp.dest('./zip'));
  done();
});
/*
 ====================================
 =         login Task            =
 ====================================*/
gulp.task('login', ['test_select'], function (done) {
  request(
    {
      url: config.url + config.urlParam + '/login',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      form: {
        username: config.loginfo.username,
        password: config.loginfo.password
      }
    },
    function (err, httpResponse, body) {
      console.log(JSON.stringify(httpResponse));
      if (err) {
        return console.error('failed:', err);
      }
      JSESSIONID = httpResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
      done();
    }
  );
});
/*
 ====================================
 =         upload zip Task            =
 ====================================*/
gulp.task('upload', ['getFid'], function (done) {
  var cookie = request.cookie('JSESSIONID=' + JSESSIONID);
  var j = request.jar();
  var count = 0;
  j.setCookie(cookie, config.url + config.urlParam + '/application/function-version/save-func-version');
  for (var i = 0, l = upload_modules.length; i < l; i++) {
    var module = upload_modules[i];
    console.log('准备上传模块' + module);
    if (!data[module]) {
      continue;
    }
    var formData = {
      clientVersion: '',
      id: data[module],
      interfaceUrl: '',
      functionId: data[module],
      remark: '',
      workStatus: 'usable',
      zipUrl: '',
      uploadFile: {
        value: fs.createReadStream(__dirname + '/zip/' + module + '.zip'),
        options: {
          filename: module + '.zip',
          contentType: 'application/x-zip-compressed'
        }
      }
    };
    request.post({
      url: config.url + config.urlParam + '/application/function-version/save-func-version',
      formData: formData,
      jar: j
    }, function optionalCallback (err, httpResponse, body) {
      if (err) {
        return console.error('failed:', err);
      }
      console.log('successful!' + body + ' has upload');
      count += 1;
      if (count === l) {
        done();
      }
    });
  }
});
gulp.task('getFid', ['login'], function (done) {
  console.log('会话ID  JSESSIONID=' + JSESSIONID);
  console.log('请求地址' + config.url + config.urlParam + '/application/function/func-list');
  var j = request.jar();
  var cookie = request.cookie('JSESSIONID=' + JSESSIONID);
  j.setCookie(cookie, config.url + config.urlParam + '/application/function/func-list');
  request({
    url: config.url + config.urlParam + '/application/function/func-list',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': config.url + config.urlParam + '/application/function'
    },
    jar: j,
    method: 'POST',
    form: {
      'sEcho': '1',
      'iColumns': '8',
      'sColumns': '',
      'iDisplayStart': '0',
      'iDisplayLength': '100',
      'mDataProp_0': 'id',
      'mDataProp_1': 'icon',
      'mDataProp_2': 'name',
      'mDataProp_3': 'version',
      'mDataProp_4': 'markName',
      'mDataProp_5': 'active',
      'mDataProp_6': 'createTimeStr',
      'mDataProp_7': 'id',
      'sSearch': '',
      'bRegex': 'false',
      'sSearch_0': '',
      'bRegex_0': 'false',
      'bSearchable_0': 'true',
      'sSearch_1': '',
      'bRegex_1': 'false',
      'bSearchable_1': 'true',
      'sSearch_2': '',
      'bRegex_2': 'false',
      'bSearchable_2': 'true',
      'sSearch_3': '',
      'bRegex_3': 'false',
      'bSearchable_3': 'true',
      'sSearch_4': '',
      'bRegex_4': 'false',
      'bSearchable_4': 'true',
      'sSearch_5': '',
      'bRegex_5': 'false',
      'bSearchable_5': 'true',
      'sSearch_6': '',
      'bRegex_6': 'false',
      'bSearchable_6': 'true',
      'sSearch_7': '',
      'bRegex_7': 'false',
      'bSearchable_7': 'true',
      'iSortCol_0': '1',
      'sSortDir_0': 'asc',
      'iSortingCols': '1',
      'bSortable_0': 'false',
      'bSortable_1': 'false',
      'bSortable_2': 'true',
      'bSortable_3': 'true',
      'bSortable_4': 'true',
      'bSortable_5': 'true',
      'bSortable_6': 'true',
      'bSortable_7': 'false'
    }
  }, function (err, httpResponse, body) {
    //console.log(httpResponse);
    if (err) {
      return console.error('failed:', err);
    }
    if (!err && httpResponse.statusCode === 200) {
      body = JSON.parse(body);
      for (var i = 0, l = body.aaData.length; i < l; i++) {
        data[body.aaData[i].markName.trim()] = body.aaData[i].id;
      }
      done();
    }
  });
});

