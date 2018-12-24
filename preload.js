let RVNBOXCli = require('rvnbox-cli/lib/rvnboxcli').default;
window.electron = require('electron');

window.Store = require('electron-store');
window.rvnbox = new RVNBOXCli({
  protocol: 'http',
  host: '127.0.0.1',
  port: 8767,
  username: '',
  password: ''
});

window.store = new window.Store();
