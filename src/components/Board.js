import React from 'react';


function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}
  
let size = 19
  
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

        return (
            <div>
                <div className="status">{status}</div>     
                {sqrs}
            </div>
        );
    }

    checkWinner(squares, i) {
        let hlen = 1
        let vlen = 1
        let drlen = 1
        let dllen = 1

        let name = squares[i]
        
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
        if (hlen == 5) {
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
        if (vlen == 5) {
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
        if (drlen == 5) {
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
        if (dllen == 5) {
            return name;
        }
            return null;
    }
    
    handleClick(i) {
        const squares = this.state.squares.slice();
        if (squares[i] || this.state.winner != null /*|| !this.state.turn*/) {
            return;
        }
        squares[i] = this.state.xisnext ? 'X' : 'O';
        this.setState({
            squares: squares,
            xisnext: !this.state.xisnext,
            winner: this.checkWinner(squares, i),
            turn: !this.state.turn,
        });
        /*
        socket.emit('move', {gameid: gameid, i: i, winner: this.state.winner});
        if (!squares.some(null)) {
            socket.emit("draw", gameid);
        }
        */
    }
}
  
class game extends React.Component {

    render() {
        return (
        <div className="game">
            <div className="game-board">
            <Board />
            </div>
        </div>
        );
    }
}

/*
socket.on("startgame", () => {
    if (this.state.prevwinner) {
        this.state.turn = ((name === this.state.prevwinner) ? false : true);
    } else {
        this.state.turn = (host ? true : false);
    }
    this.setState({
        squares: Array(361).fill(null),
        xisnext: (host ? true : false),
        winner: null,
    });
});

socket.on("getmove", (i) => {
    const squares = this.state.squares.slice();
    squares[i] = this.state.xisnext ? 'X' : 'O';
    this.setState({
        squares: squares,
        xisnext: !this.state.xisnext,
        turn: !this.state.turn,
    });
});

socket.on("winner", (winner) => {
    this.setState({
        winner: winner,
        prevwinner: winner
    });

    if (name === winner) {
        alert("You Win!");
    } else {
        alert("You Lose!");
    }
    //Reset Start/Ready Button
});

socket.on("nowinner", (msg) => {
    alert(msg);
    //Reset Start/Ready Button
});
*/
export default game;