/**
 * @file
 * @author renjian
 * @date 2016/6/21
 */
var nativeApi = require('nativeApi');
// import {APIS} from 'src/public/config';
export default {
  /**
   * 分页列表查询
   * @param list 列表数据
   * @param option 操作选项 'loadMore'：加载下一页,'refresh':刷新
   */
  listReq: function (list, option, callback) {
    var postData = {
      url: list.url,
      param: list.searchObject,
      type: list.type || 'POST',
      success: function (response) {
        if (response.status) {
          if (response.rows) {
            list.hasmore = response.rows.length === list.searchObject.s;
            if (option === 'loadMore') {
              list.data = list.data.concat(response.rows);
            } else if (option === 'refresh') {
              list.data = response.rows;
              callback && callback(response.rows);
            } else {
              if (response.rows.length === 0 || !list.hasmore) {
                list.scroll.disablePullupToRefresh();
              } else {
                list.scroll.enablePullupToRefresh();
                list.scroll.refresh(true);
              }
              list.data = response.rows;
              list.scroll.scrollTo(0, 0, 100);
              callback && callback(response.rows);
            }
            list.isEmpty = list.data.length === 0;
          } else {
            mui.toast('未找到数据');
          }
        } else {
          console.error('网络请求失败——>' + response.errorMsg);
          mui.toast('网络请求失败');
        }
        if (option === 'loadMore') {
          list.scroll.endPullupToRefresh(!list.hasmore);
        } else if (option === 'refresh') {
          list.scroll.endPulldownToRefresh();
          list.scroll.refresh(true);
        }
      },
      error: function (response) {
        if (option === 'loadMore') {
          list.scroll.endPullupToRefresh(!list.hasmore);
        } else if (option === 'refresh') {
          list.scroll.endPulldownToRefresh();
        }
        console.error('error——>' + response);
        mui.toast('网络连接失败');
      }
    };
    nativeApi.ajax(postData);
  },
  /**
   * 设置列表滚动对象
   */
  setListScroll: function (list, scroll) {
    list.scroll = scroll;
  },
  /**
   * 列表刷新
   */
  listRefresh: function (list) {
    list.searchObject.p = 1;
    this.listReq(list, 'refresh');
  },
  /**
   * 列表加载下一页
   */
  listLoadMore: function (list) {
    list.searchObject.p++;
    this.listReq(list, 'loadMore');
  },
  /**
   * 通过url加载js库
   * @param url
   * @returns {Promise} 返回一个promiss
   */
  load: function (url) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
};
