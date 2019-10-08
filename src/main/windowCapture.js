import { shell, clipboard } from 'electron';

const path = require('path');
const child = require('child_process');
var workFlag = true;
const winCapture = {
  openScreenShot: function(callback) {
    const _this = this;
    if (_this.isWindows()) {
      /*var screenShotExePath = './static/NiuniuCapture.exe';*/
      var screenShotExePath = './NiuniuCapture.exe';
      if (workFlag) {
        workFlag = false;
        var workerProcess = child.execFile(screenShotExePath, function(err, data) {
          if (err == null) {  //完成截图
            _this.finishShot(err.code, callback);
          } else {
            _this.finishShot(err.code, callback);
          }
        });
        workerProcess.on('exit', function(code) {
          workFlag = true;
        });
      }
    } else { //MacOS
      var screenShotExePath = './static/ScreenCapture.app/Contents/MacOS/ScreenCapture';
      var screenShotPatharam = ['startfromlocal,' + path.join(__dirname, 'set.info ') + ',' + path.join(__dirname, 'response.info') + ',0,3,0,0,0,0,0'];
      if (workFlag) {
        workFlag = false;
        var workerProcess = child.spawn(screenShotExePath, screenShotPatharam, { stdio: 'inherit' }).on('close', function(code) {
          _this.finishShot(code, callback);
        });
        workerProcess.on('exit', function(code) {
          workFlag = true;
        });
      }
    }
  },

  finishShot: function(code, callback) {
    if (code == 1) {
      let nativeImage = clipboard.readImage('selection');
      if (nativeImage.getSize().width > 0) //粘贴图片
      {
        var image = clipboard.readImage();
        // let nativeImageSrc = image.toDataURL();
        // let html = "<img  src='" + nativeImageSrc + "' alt='' />";
        if (typeof callback === 'function') {
          callback(image);
        }
      }
    } else if (code == 2) {//取消截图
    } else if (code == 3) {//保存截图
    }
  },

  isWindows: function() {
    var os = require('os');
    return os.platform() == 'win32';
  }
};
export default winCapture;
