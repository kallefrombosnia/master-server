const config = require('./config.js');
const EventEmitter = require("events");
const udp = require('dgram');
const pack = require('locutus/php/misc/pack');
const inet_pton = require('locutus/php/network/inet_pton');

const {SERVERS_END,SERVERS_START} = require('./constants.js');

class HL_MasterServer extends EventEmitter {
    
  constructor(port = 27050) {
    super();

    // Init socket and port using
    this.port = port;
    this.server = udp.createSocket('udp4'); 

    // Lisy of servers in master
    this.servers = [];

    // Local state managment vars
    this._started = false;
    this._running = false;
    this._error = false;
    this._lastError = null;

    // Register event listeners
    this.eventRegister();

    // Init all servers from database to our local array
    this.emit('requestServerListAll', 'test');
    
  }

  // Global function for start of master
  startMasterServer(){

    // Check if master is started or running
    if(!this._started && !this._running){
      
      // Check if socket already assigned. Important.
      if(this.server === null){
        
        // If its null assign new one 
        this.server = udp.createSocket('udp4'); 
      }

      // Bind socket port
      this.bindPort(this.port);

      // Call main function for resolving client requests
      this.resolveClient();

      // Init on error event
      this.onError();

      // Finnaly start listening for requests
      this.listenSocket();
    
    }
    
  }

  // Main function for stopping master
  stopMasterServer(){
    
    // Check if master is live and running
    if(this._started && this._running){

      // If its running close it
      this.server.close();

      // Null socket object
      this.server = null;

      // Set state to not running
      this._started = false;
      this._running = false;
    }
  }

  // Main function for restart of the master
  restartMasterServer(){
    
    // Call stop
    this.stopMasterServer();

    //  Call start again and all good
    this.startMasterServer();
  }

  /*
    Main function for resolving client requests.

    Notes: some of the clients when connecting sends first ip in format 10.0.0.0:0 or 0.0.0.0:0 so hanlde both cases

    Everything is in ascii so handle data like that

  */

  resolveClient(){
    
    // Socket listen for new message from remote host 
    this.server.on('message', (msg,info) => {
      
      // When message is received we get two parameters in callback, one is actual message and other is remote host info

      // First convert it to ascii for easy read
      msg = msg.toString('ascii');
    
      // Search with regex for known request ip (first request) and if its ip
      const message = msg.match('[0-9]+(?:\.[0-9]+){3}:[0-9]+');
    
      // If message is undefined or null return as bad request
      if(message === null) return;
     
      // If message contains good address assign index default 0 (first request)
      let index = 0;
      
      if(message[0] != '10.0.0.0:0' || message[0] != '0.0.0.0:0') {
        
        //If its not first request handle old ip address and add plus one for new one in order
        index = this.servers.indexOf(message[0])+1;
        
      }

      // Send user request to frontend
      if(index === 0) io.emit('newMasterRequest', {ip: info.address})

      // Check if index exists in array 
      if(this.servers[index]) { 
        
        // If it exists handle this and send user new ip address
        return this.send_reply([SERVERS_START,this.servers[index]], info);

      }else{

        // If it doesnt exists send user 'end of the list' message
        return this.send_reply(SERVERS_START+SERVERS_END, info);

      }
    
    })
  }

  onError(){

    this.server.on('error', error =>{

      console.log('Error: ' + error);

      this._running = false;
      this._error = true;
      this._lastError = error;

    })
  }

  onClose(){
    this.server.on('close', () => {
      this._running = false;
      this._error = false;
    })
  }

  listenSocket() {
    this.server.on("listening", () => {
      const address = this.server.address();
      this._started = true;
      this._running = true;
      console.log(`Master server started listening on ${address.address}:${address.port}`);
    })
  }

  bindPort() {
    this.server.bind(this.port);
  }

  send_reply(outputValue, info){

    let value = "";
    
    if (outputValue.constructor.name == "Array"){
      
      value += outputValue[0];
      const address = outputValue[1].split(":");
      value += inet_pton(address[0]);
      value += pack('n*', address[1]);
      value += outputValue[2] ? p[2] : "";

    } else {

      value = outputValue;

    }

    const replyHex = new Buffer.from(value, 'ascii');

    this.server.send(replyHex, 0, replyHex.length, info.port, info.address, (err, bytes) =>{
        if(err){
            console.error("Error sending OK buffer to client", err);
        }
    })

  }

  // event register
  eventRegister(){
  
    // Register add single server event listener
    this.on('addServerToMaster', (ip) =>{
      this.servers.push(ip);
    });

    // Register once waiting for all server list deploy
    this.once('addServerToMasterAll', serverList =>{
      this.servers = serverList
    });

    // Called when panel invoked remove of server from masterk

  }

}

module.exports = {
  HL_MasterServer
}


  
  