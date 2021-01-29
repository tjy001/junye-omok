import React, { useState } from 'react';
import { Link } from 'react-router-dom';


const Home = () => {
    const [name, setName] = useState('');
    const [gameid, setGameID] = useState('');

    function randid() {
        var randomstring = require('randomstring');
        var id = randomstring.generate({
            length: 6,
            readable: true,
            charset: 'alphanumeric',
            capitalization: 'uppercase'
        })
        return id;
    }

    return (
        <div>
            <div className="container-sm mx-auto">
            <div className="mb-4 px-5">
                <h1><b>Junye - Omok</b></h1>
            </div>
            <div className="px-5">
                <p>Hello there! Welcome to my game of omok! </p>
                <p>Omok is a game where two players take turns to place their pieces on a 19 by 19 board.</p>
                <p>The rules are simple: first player to form <b>Exactly</b> 5 in a row with his/her pieces wins the game.</p>
                <p>(It is basically a more advanced version of Tic-Tac-Toe)</p>
                <p>To begin, please enter a username.</p>
                <p>If you have a Game ID from your friend, you may join his/her game using the Game ID.</p>
                <p>Alternatively, you may create a game and a new Game ID will be generated for you to play with another friend.</p>
            </div>
            <div className="mb-3 pt-5 pb-2 px-5">
                <input placeholder="Enter a Username" type="text" className="form-control mb-2 text-center" onChange={(event) => setName(event.target.value)} />
                <Link onClick={event => (!name) ? event.preventDefault() : null } to={`/game?name=${name}&gameid=${randid()}&host=${true}`}>
                    <button type="submit" className="btn btn-outline-dark w-100">Create a Game</button>
                </Link>
            </div>
            <div className="mb-3 pt-2 pb-5 px-5">
                <input placeholder="Enter a Game ID" type="text" className="form-control mb-2 text-center" onChange={(event) => setGameID(event.target.value)} />
                <Link onClick={event => (!name || !gameid) ? event.preventDefault() : null} to={`/game?name=${name}&gameid=${gameid}`}>
                    <button type="submit" className="btn btn-outline-dark w-100">Join a Game</button>
                </Link>
            </div>
            </div>
        </div>
    )
}

export default Home;