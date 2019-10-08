const child = require('child_process');
export default {

  deleteBat() {
    child.execFile('BindingShortcut.bat', null, { cwd: '../' }, function(error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
    })
  },

};