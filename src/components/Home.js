import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Home = () => {
    const [name, setName] = useState('');
    const [gameid, setGameID] = useState('');

    // --- CLIENT-SIDE VALIDATION HELPER ---
    const validateInput = (input, minLength = 1, maxLength = 20) => {
        if (typeof input !== 'string') return false;
        const trimmedInput = input.trim();
        // Check Length
        if (trimmedInput.length < minLength || trimmedInput.length > maxLength) return false;
        // Check Content (Must be Alphanumeric)
        if (!/^[a-zA-Z0-9]+$/.test(trimmedInput)) return false;
        return true; // Return true if valid
    };

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

    const handleCreateGame = (event) => {
        if (!validateInput(name)) {
            event.preventDefault(); // Stop navigation if validation fails
            Swal.fire({
                icon: 'error',
                title: 'Invalid Username',
                text: 'Username must be between 2 and 20 alphanumeric characters.',
            });
            return;
        }
    };
    
    const handleJoinGame = (event) => {
        // Validate Username (2-20 chars) and Game ID (must be exactly 6 chars)
        const isNameValid = validateInput(name);
        const isGameIdValid = validateInput(gameid, 6, 6); 
        
        if (!isNameValid || !isGameIdValid) {
            event.preventDefault(); // Stop navigation if validation fails
            let errorText = '';
            if (!isNameValid) {
                errorText += 'Username must be between 1 and 20 alphanumeric characters. ';
            }
            if (!isGameIdValid) {
                errorText += 'Game ID must be exactly 6 alphanumeric characters. ';
            }
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: errorText.trim(),
            });
            return;
        }
    };

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
                <p>To begin, please enter your preferred player name.</p>
                <p>If you have an existing Game ID from your friend, you may join his/her game using the Game ID.</p>
                <p>Alternatively, you may create a game and a new Game ID will be generated for you to play with another friend.</p>
            </div>
            <div className="mb-3 pt-5 pb-2 px-5">
                <input placeholder="Enter a Player Name" type="text" className="form-control mb-2 text-center" onChange={(event) => setName(event.target.value)} />
                <Link 
                    onClick={handleCreateGame} // <--- Replaced inline check
                    to={`/game?name=${name}&gameid=${randid()}&host=${true}`}
                >
                    <button type="submit" className="btn btn-outline-dark w-100">Create a Game</button>
                </Link>
            </div>
            <div className="mb-3 pt-2 pb-5 px-5">
                <input placeholder="Enter a Game ID" type="text" className="form-control mb-2 text-center" onChange={(event) => setGameID(event.target.value)} />
                <Link 
                    onClick={handleJoinGame} // <--- Replaced inline check
                    to={`/game?name=${name}&gameid=${gameid}`}
                >
                    <button type="submit" className="btn btn-outline-dark w-100">Join a Game</button>
                </Link>
            </div>
            </div>
        </div>
    )
}

export default Home;