var net = require('net');
var socketPath = '/home/volumio/raat/cross/vrst_daemon.sock';

var VrstLib = {};

// module.exports = VrstLib;
VrstLib.cmd_type = Object.freeze({
  PING:"PING", 
  PONG:"PONG",
  ECHO:"ECHO",
  PLAY:"PLAY",
  PAUSE:"PAUS",
  STOP:"STOP",
  NEXT:"NEXT",
  PREVIOUS:"PREV",
  VOLUME_UP:"VOL+",
  VOLUME_DOWN:"VOL-",
  VOLUME_SET:"VOL=",
  REQ_SILENCE:"RSIL",
  NONE:"NONE"
});

VrstLib.cmd = function(cmd_id){
  this.bytes = new Uint8Array(6);
  this.cmd_id = cmd_id.substring(0, 4);
  this.bytes.set(Buffer.from(this.cmd_id), 'utf8');
  this.bytes.set([0xAF,0xC9], 4)
  this.type = VrstLib.cmd_type.NONE;
  for(var type in VrstLib.cmd_type){
    if(cmd_id == type){
      this.type = type;
    }
  }
}

VrstLib.cmd.prototype.get = function(){
  return new Buffer(this.bytes);
}

VrstLib.cmd.fromBuffer = function(buf) {
  var bytes = new Uint8Array(buf);
  var cmd_id = String.fromCharCode.apply(null, bytes.subarray(0, 4));
  var cmd = new VrstLib.cmd(cmd_id);
  cmd.bytes = bytes;
  return cmd;
}

VrstLib.cmd_echo_macro = function(){
  this.cmd = new VrstLib.cmd("ECHO");
}

VrstLib.cmd_echo_macro.prototype.get = function(string){
  var len = string.length + 2 + this.cmd.bytes.length;
  var bytes = new Uint8Array(len);
  bytes.set(this.cmd.bytes);
  bytes.set([string.length & 0xff,
        (string.length & 0xff00) / 256],
      this.cmd.bytes.length);
  bytes.set(Buffer.from(string, 'utf8'), this.cmd.bytes.length + 2);
  return new Buffer(bytes);
}

VrstLib.cmd_volume_set_macro = function(){
  this.cmd = new VrstLib.cmd("VOL=");
}

VrstLib.cmd_volume_set_macro.prototype.get = function(volume){
  len = 1 + this.cmd.bytes.length;
  bytes = new Uint8Array(len);
  bytes.set(this.cmd.bytes);
  bytes.set([volume], this.cmd.bytes.length);
  return new Buffer(bytes);
}

VrstLib.cmd_ping = new VrstLib.cmd("PING");
VrstLib.cmd_pong = new VrstLib.cmd("PONG");
VrstLib.cmd_echo = new VrstLib.cmd_echo_macro();
VrstLib.cmd_play = new VrstLib.cmd("PLAY");
VrstLib.cmd_pause = new VrstLib.cmd("PAUS");
VrstLib.cmd_next = new VrstLib.cmd("NEXT");
VrstLib.cmd_stop = new VrstLib.cmd("STOP");
VrstLib.cmd_previous = new VrstLib.cmd("PREV");
VrstLib.cmd_volume_up = new VrstLib.cmd("VOL+");
VrstLib.cmd_volume_down = new VrstLib.cmd("VOL-");
VrstLib.cmd_volume_set= new VrstLib.cmd_volume_set_macro();
VrstLib.cmd_request_silence = new VrstLib.cmd("RSIL");

var vrst = VrstLib;
var ctype = vrst.cmd_type;

function hexdump(str)
  {
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++){
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	 }
	return arr1.join('');
 }

 client = net.createConnection(socketPath);

 client.on("connect", function() {
   console.log("connected\n");
   
   client.write(vrst.cmd_ping.get());
 });

 client.on("data", function(data) {
   console.log("data: " + data.toString('utf8') + "\n");
   var read = vrst.cmd.fromBuffer(data);
   console.log("Command id: " + read.cmd_id);
   if(read.type == ctype.PONG){
     console.log("Write: " + vrst.cmd_echo.get("Pong received! " + read.type));
     client.write(vrst.cmd_echo.get("Pong received! " + read.type));
     client.write(vrst.cmd_play.get());
     client.write(vrst.cmd_volume_set.get(50));
   }
 });

 client.on("drain", function(){
   if(vrst.length > 0){
     client.write(self.vrst.shift());
   }
 });

