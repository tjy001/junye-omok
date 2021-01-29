import React from 'react';
import {socket, SocketContext} from './components/socket'
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Home from './components/Home';
import Game from './components/Game';

const App = () => (
  <Router>
    <Route path="/" exact component={Home} />
    <SocketContext.Provider value = {socket}>
      <Route path="/game" component={Game} />
    </SocketContext.Provider>
  </Router>
)

export default App;