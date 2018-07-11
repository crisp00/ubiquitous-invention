'use strict';
var libQ = require('kew');
var net = require('net');
var fs = require('fs');
var vlib = require('./vrstlib.js');
var socketPath = '/home/volumio/raat/cross/vrst_daemon.sock';

//VRCP: Volumio RAAT Client Plugin

module.exports = VolumioRaat;

function VolumioRaat(context) {
  var self = this;
  self.context = context;
  self.commandRouter = this.context.coreCommand;
  self.client = net.createConnection(socketPath);

  self.client.on("connect", function() {
    console.log("       [VRCP] connected to VRST");
    setTimeout(()=>{
      self.commandRouter.pushToastMessage('info', "VRCP", "sending PING");
      self.client.write(vlib.cmd_ping.get());
    }, 3000);
  });

  self.client.on("data", function(data) {
    var cmd = vlib.cmd.fromBuffer(data);
    switch(cmd.type){
      case vlib.msg_type.PONG:
        self.commandRouter.pushToastMessage('info', "VRCP", "got PONG");
        break;
    }
  });
}

VolumioRaat.prototype.onVolumioStart = function () {
  var self = this;
  //Perform startup tasks here
  setTimeout(()=>{
    self.commandRouter.pushToastMessage('info', "RAAT", "Plugin loaded!");
  }, 2000);
  return libQ.resolve();
};

VolumioRaat.prototype.onStop = function () {
  var self = this;
  self.client.end();
  //Perform stop tasks here
  return libQ.resolve();
};

VolumioRaat.prototype.onRestart = function () {
  var self = this;
  //Perform restart tasks here
};

VolumioRaat.prototype.onInstall = function () {
  var self = this;
  //Perform your installation tasks here
};

VolumioRaat.prototype.onUninstall = function () {
  var self = this;
  //Perform your deinstallation tasks here
};

VolumioRaat.prototype.getUIConfig = function () {
  var self = this;

  return {success: true, plugin: "example_plugin"};
};

VolumioRaat.prototype.setUIConfig = function (data) {
  var self = this;
  //Perform your UI configuration tasks here
};

VolumioRaat.prototype.getConf = function (varName) {
  var self = this;
  //Perform your tasks to fetch config data here
};

VolumioRaat.prototype.setConf = function (varName, varValue) {
  var self = this;
  //Perform your tasks to set config data here
};

//Optional functions exposed for making development easier and more clear
VolumioRaat.prototype.getSystemConf = function (pluginName, varName) {
  var self = this;
  //Perform your tasks to fetch system config data here
};

VolumioRaat.prototype.setSystemConf = function (pluginName, varName) {
  var self = this;
  //Perform your tasks to set system config data here
};

VolumioRaat.prototype.getAdditionalConf = function () {
  var self = this;
  //Perform your tasks to fetch additional config data here
};

VolumioRaat.prototype.setAdditionalConf = function () {
  var self = this;
  //Perform your tasks to set additional config data here
};
