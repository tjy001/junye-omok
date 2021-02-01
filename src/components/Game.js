import React, { useState, useEffect, useContext } from 'react';
import queryString from 'query-string';
import {SocketContext} from './socket';
import { useHistory } from "react-router-dom";
import Swal from 'sweetalert2';

let size = 19;
var omok;

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

const Game = ({ location }) => {
  const loc = queryString.parse(location.search);
  const [name, setName] = useState(loc.name);
  const [gameid, setGameID] = useState(loc.gameid);
  const [host, setHost] = useState(loc.host);
  const socket = useContext(SocketContext);
  const history = useHistory();

  useEffect(() => {
    
    setName(loc.name);
    setGameID(loc.gameid);
    setHost(loc.host);
  
    if (host) {
      socket.emit('hostgame', {name, gameid}); 
    } else {
      socket.emit('joingame', {name, gameid});
    }
    socket.on('hosted', (gameid) => {
      Swal.fire({
        icon: 'success',
        title: 'Game Created!',
        html: `Your Game ID is:<br>${gameid}<br>Share it with a friend!`,
        confirmButtonText: "Copy Game ID",
      }).then((copy) => {
        if (copy.isConfirmed) {
          try {
            navigator.clipboard.writeText(gameid);
            Swal.fire({
              icon: 'success',
              title: 'Copied!',
            });
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: 'Oops, something went wrong',
              text: "You may get the Game ID from the URL instead",
            });
          }
        }
      });
    })

    socket.on('hostfail', (msg) => {
      Swal.fire({
        icon: 'error',
        title: 'Error Creating Game',
        text: msg,
      });
    })

    socket.on("joined", (hostname) => {
      Swal.fire({
        icon: 'success',
        title: 'Game Joined!',
        text: `Successfully joined ${hostname}'s game!`,
      });
    })

    socket.on("guestjoined", (guestname) => {
      Swal.fire({
        title: 'Player Joined',
        text: `${guestname} joined your game!`,
      });
    })

    socket.on("nogame", (msg) => {
      Swal.fire({
        icon: 'error',
        title: 'Error Joining Game',
        text: msg,
      });
    })
  }, []);

  useEffect(() => {
    socket.on("startgame", () => {
      if (omok.state.prevwinner) {
        omok.setState({
          turn: ((name === omok.state.prevwinner) ? false : true)
        });
      } else {
        omok.setState({
          turn: (host ? true : false)
        });
      }
      omok.setState({
        squares: Array(361).fill(null),
        xisnext: true,
        winner: null,
      });
    })

    socket.on("getmove", (i) => {
      const squares = omok.state.squares.slice();
      squares[i] = omok.state.xisnext ? 'X' : 'O';
      omok.setState({
        squares: squares,
        xisnext: !omok.state.xisnext,
        turn: !omok.state.turn,
      });
    })
  
    socket.on("winner", (winner) => {
      omok.setState({
        winner: winner,
        prevwinner: winner
      })
  
      if (name === winner) {
        alert("You Win!");
      } else {
        alert("You Lose!");
      }
      //Reset Start/Ready Button
    })
  
    socket.on("nowinner", (msg) => {
      alert(msg);
      //Reset Start/Ready Button
    })

    socket.on("left", (leaver) => {
      alert(leaver + " has disconnected...");
      if (!host) {
        history.push("/");
      }
    })
    
  }, []);

  function LeaveButton() {
  
    function leave() {
      socket.emit('leave', (gameid));
      history.push("/");
    }
  
    return (
      <button className="btn btn-danger mb-2 mt-2" onClick={leave}>Leave</button>
      );
  }

  class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(361).fill(null),
            xisnext: false,
            winner: null,
            turn: false,
            prevwinner: null
        };
    }
  
    renderSquare(i) {
        return <Square 
            value={this.state.squares[i]}
            onClick={() => this.handleClick(i)}
        />
    }
  
    render() {
        let status;
        let XorO = (this.state.turn != this.state.xisnext ? "You are: O" : "You are: X");
        if (this.state.winner != null) {
            status = 'Winner: ' + this.state.winner;
        } else {
            status = (this.state.turn ? 'Your Turn' : "Opponent's Turn");
        }
    
        let sqrs = []
        for (let row = 0; row < size; row++) {
            let cols = []
            for (let col = 0; col < size; col++) {
                cols.push(this.renderSquare(row*size+col))
            }
            sqrs.push(<div className="board-row">{cols}</div>)
        }
        omok = this;

        return (
            <div>
                <LeaveButton />
                <div className="card w-25 mb-2">
                  <div className="card-body px-2 py-2"><b>{XorO}</b></div>
                </div>
                <div className="card-subtitle px-2 mb-2 text-muted">{status}</div>
                {sqrs}
            </div>
        );
    }

    checkWinner(squares, i) {
        let hlen = 1
        let vlen = 1
        let drlen = 1
        let dllen = 1
        
        let u = 1;
        while (squares[i+u] === squares[i] && Math.floor((i+u)/size) === Math.floor(i/size) && (i+u) < size**2) {
            hlen += 1;
            u++;
        }
        u = 1
        while (squares[i-u] === squares[i] && Math.floor((i-u)/size) === Math.floor(i/size) && (i-u) >= 0) {
            hlen += 1;
            u++;
        }
        if (hlen === 5) {
            return name;
        }
      
        u = 1;
        while (squares[i+u*size] === squares[i] && (i+size) < size**2) {
            vlen += 1;
            u++;
        }
        u = 1;
        while (squares[i-u*size] === squares[i] && (i-size) >= 0) {
            vlen += 1;
            u++;
        }
        if (vlen === 5) {
            return name;
        }
      
        u = 1;
        while (squares[i+u*(size-1)] === squares[i] && Math.floor((i+u*(size-1))/size) != Math.floor(i/size) && (i+u*(size-1)) < size**2) {
            drlen += 1;
            u++;
        }
        u = 1;
        while (squares[i-u*(size-1)] === squares[i] && Math.floor((i-u*(size-1))/size) != Math.floor(i/size) && (i-u*(size-1)) >= 0) {
            drlen += 1;
            u++;
        }
        if (drlen === 5) {
            return name;
        }
      
        u = 1;
        while (squares[i+u*(size+1)] === squares[i] && Math.floor((i+u*(size+1))/size) != Math.floor(i/size) && (i+u*(size+1)) < size**2) {
            dllen += 1;
            u++;
        }
        u = 1;
        while (squares[i-u*(size+1)] === squares[i] && Math.floor((i-u*(size+1))/size) != Math.floor(i/size) && (i-u*(size+1)) >= 0) {
            dllen += 1;
            u++;
        }
        if (dllen === 5) {
            return name;
        }
            return null;
    }
    
    handleClick(i) {
        const squares = this.state.squares.slice();
        if (squares[i] || this.state.winner != null || !this.state.turn) {
            return;
        }
        squares[i] = this.state.xisnext ? 'X' : 'O';
        this.setState({
            squares: squares,
            xisnext: !this.state.xisnext,
            winner: this.checkWinner(squares, i),
            turn: !this.state.turn,
        }, () => socket.emit('move', {gameid: gameid, i: i, winner: this.state.winner}));
        if (!squares.some(function(x) {return x === null})) {
            socket.emit("draw", gameid);
        }
           
    }
  }

  return (
    <div className="game">
      <div className="container-sm">
        <Board />
      </div>
    </div>
  )

}

export default Game;
