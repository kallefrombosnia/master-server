const fetch = require("node-fetch");
const Gamedig = require('gamedig');
let Server = require('./models/server');


// Fetch user personal info by ip
const userInfo = async (url) => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      return json
    } catch (error) {
        return error
    }
};


// Query CS 1.6 Server for info
const queryServer = async (ip, port) => {
  
  try{
      const data = await Gamedig.query({
        type: 'cs16',
        host: ip,
        port: port
      });
    
    return data

  }catch (error) {

    return error

  }
    
}

// Convert seconds to minutes/hours/days
const formatTime = (time) =>{   
 
  let hrs = ~~(time / 3600);
  let mins = ~~((time % 3600) / 60);
  let secs = ~~time % 60;

  let ret = "";
  
  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;

  return ret;
}

// Get all servers from db
const getAllServerFromDB = async () => {


  try{

    const serverList = await Server.find({}, async(err, serverlist) =>{

          if(err){

            console.log(`Error while fetching all servers: ${err}`);
          }
        });

    let servers = [];
    
    serverList.forEach(server => {
      servers.push(server.ip);
    })

    return await servers

  }catch(error){

    console.log(error)

  }
}

module.exports = {userInfo, queryServer, formatTime, getAllServerFromDB};