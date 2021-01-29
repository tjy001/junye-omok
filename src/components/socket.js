import io from 'socket.io-client';
import React from 'react';

var connectionOptions =  {
    "force new connection" : false,
    "reconnectionAttempts": "Infinity", 
    "timeout" : 10000,                  
    "transports" : ["websocket", "polling", "flashsocket"]
  };
  var ENDPOINT = '';

export const socket = io(ENDPOINT, connectionOptions);
export const SocketContext = React.createContext();