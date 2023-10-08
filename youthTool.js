// ==UserScript==
// @name        智慧团建名单批量导出
// @namespace   Violentmonkey Scripts
// @match       https://zhtj.youth.cn/zhtj/*
// @grant       none
// @version     1.0
// @author      zx108wl
// @description 2023/10/3 20:16:27
// @require    https://cdn.staticfile.org/jszip/3.5.0/jszip.min.js
// @license MIT
// ==/UserScript==
var creatFlag = true;
function forloop(){
  if('https://zhtj.youth.cn/zhtj/center/tuanyuantw/memberlist' == window.location.href.toString()){
    if(creatFlag == true){
      creatFlag = false;
      downloadFile();
    }
  }
  else{
    creatFlag = true;
  }
  setTimeout(forloop,1000);
}
window.addEventListener("load", forloop);
function downloadFile(){
    var schoolID = "";
    var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
    httpRequest.open('POST', 'https://zhtj.youth.cn/v1/center/queryLeagueCadres', true); //第二步：打开连接
    //设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
    httpRequest.setRequestHeader('Accept','application/json, text/plain, */*');
    httpRequest.send();//发送请求 将情头体写在send中
    // 获取数据后的处理程序
    httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
        if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
            schoolID = JSON.parse(httpRequest.responseText)['results']['queryLeagueId'];
        }
    };

    var button = document.createElement("a"); //创建一个按钮
    button.textContent = "一键下载";          //按钮内容
    button.setAttribute('data-v-4b8b3d08','');
    button.className="el-button blue  el-button--medium";
    button.style="margin-bottom: 10px; margin-left: 16px;";
    button.addEventListener("click", function(){
      var zip = new JSZip();
      setTimeout(function(){
          var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象
          var counter = 0;
          httpRequest.open('POST', 'https://zhtj.youth.cn/v1/center/getorgtree', true); //第二步：打开连接
          //设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）
          httpRequest.setRequestHeader('Accept','application/json, text/plain, */*');
          httpRequest.send('queryLeagueId = ' + schoolID);//发送请求 将情头体写在send中
          // 获取数据后的处理程序
          httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中
              if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功
                  var list = JSON.parse(httpRequest.responseText)["results"]["leagueList"];//获取到服务端返回的数据
                  for(element in list){
                      zip.file(list[element]['leagueName']+'.xlsx', fetchBlob('https://zhtj.youth.cn/v1/center/tuanweiexportmembers/'+list[element]['leagueId'], 'GET'));
                  }
                  alert("成功导出"+list.length+"个团支部数据！")
                  zip.generateAsync({type: 'blob'}).then(function(content) {
                      var filename = '批量下载.zip';// 下载的文件名
                      var eleLink = document.createElement('a');// 创建隐藏的可下载链接
                      eleLink.download = filename;
                      eleLink.style.display = 'none';
                      eleLink.href = URL.createObjectURL(content);// 下载内容转变成blob地址
                      document.body.appendChild(eleLink);// 触发点击
                      eleLink.click();
                      document.body.removeChild(eleLink);// 然后移除
                  });
              }
          };
        },100);// setTimeout 0.1秒后执行
  });   //监听按钮点击事件

    var like_comment = document.getElementsByClassName('row')[0]; //getElementsByClassName 返回的是数组，所以要用[] 下标
    like_comment.appendChild(button); //把按钮加入到 x 的子节点中
    }



// 先封装一个方法，请求返回文件blob
async function fetchBlob(fetchUrl, method = "POST", body = null) {
    const response = await window.fetch(fetchUrl, {
        method,
        body: body ? JSON.stringify(body) : null,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
        },
    });
    const blob = await response.blob();
    return blob;
}
