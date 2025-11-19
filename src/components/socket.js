import io from 'socket.io-client';
import React from 'react';

const ENDPOINT = window.location.origin;

var connectionOptions =  {
    "force new connection" : false,
    "reconnectionAttempts": "Infinity", 
    "timeout" : 10000,                  
    "transports" : ["websocket", "polling"] // Removed 'flashsocket' as it's ancient
  };

export const socket = io(ENDPOINT, connectionOptions);
export const SocketContext = React.createContext();