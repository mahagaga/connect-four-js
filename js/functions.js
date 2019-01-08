function closeModal() { 
    $('.modal').css({'display':'none'});

    var selectedVal;
    var selected = $("input[type='radio'][name='who']:checked");
    if (selected.length > 0) {
        selectedVal = selected.val();
    }
    switch (selectedVal) {
        case "red": config.redPlayerName = config.you; config.blackPlayerName = config.them; break;
        case "black": config.redPlayerName = config.them; config.blackPlayerName = config.you; break; 
    }
    challengeThem();
    updateTitle();
}

/**
 * A function for adding a disc to our Connect Four board.
 *
 * @param string color The color of the current player.
 * @param int x_pos The x-position of the location chosen.
 * @param int y_pos The y-position of the location chosen.
 */
function addDiscToBoard(color, x_pos, y_pos) {
    board[y_pos][x_pos] = color;
}

/**
 * Print the contents of our `board` variable to the html page.
 */
function printBoard() {
    // Loop through the board, and add classes to each cell for the
    // appropriate colors.
    for (var y = 0; y <= 5; y++) {
        for (var x = 0; x <= 6; x++) {
            if (board[y][x] !== 0) {
                var cell = $("tr:eq(" + y + ")").find('td').eq(x);
                cell.children('button').addClass(board[y][x]);
            }
        }
    }
}

/**
 * A function for changing players at the end of a turn.
 */
function changePlayer() {
    // Change the value of our player variable.
    if (currentPlayer === 'black') {
        currentPlayer = 'red';
    } else {
        currentPlayer = 'black';
    }
    updateTitle();
}

function updateTitle() {
    // Update the UI.
    $('#player').removeClass().addClass(currentPlayer).text(config[currentPlayer + "PlayerName"]);

    // btw - is it their turn?
    if (config[currentPlayer + "PlayerName"] === config.them) {
        halt = true;
        letThemMakeAMove();
    } else {
        halt = false;
    }
}

function color(player) {
    var color;
    switch (currentPlayer) {
        case "red": color="white"; break;
        case "black": color="black"; break;
    }
    return color;
}

function letThemMakeAMove() {
    $.ajax({ 
        type: 'GET', 
        url: config.gameserver+"/best/"+gameid+"/"+color(currentPlayer), 
        data: { }, 
        dataType: 'json',
        success: function (json) { 
            //alert("success: "+json.bestmove);
            dropDisc(json.bestmove);
        },
        error: function(error) {
            alert("They don't move, error.status: "+error.status);
        }
    });    
}

function tellThem(column) {
    $.ajax({ 
        type: 'GET', 
        url: config.gameserver+"/move/"+gameid+"/"+color(currentPlayer)+"/"+column, 
        data: { }, 
        dataType: 'json',
        success: function (json) { 
            //alert(json.field);
        },
        error: function(error) {
            alert("Can't tell them, error.status: "+error.status);
        }
    });    
}

function challengeThem(column) {
    $.ajax({ 
        type: 'GET', 
        url: config.gameserver+"/new", 
        data: { }, 
        dataType: 'json',
        success: function (json) { 
            //alert(json.field);
            config.gameid = json.gameid;
        },
        error: function(error) {
            alert("Can't challenge them, error.status: "+error.status);
        }
    });  
}

/**
 * If there are empty positions below the one chose, return the new y-position
 * we should drop the piece to.
 *
 * @param int x_pos The x-position of the location chosen.
 * @param int y_pos The y-position of the location chosen.
 * @return bool returns true or false for the question "Is this at the bottom?".
 */
function dropToBottom(x_pos, y_pos) {
    // Start at the bottom of the column, and step up, checking to make sure
    // each position has been filled. If one hasn't, return the empty position.
    for (var y = 5; y > y_pos; y--) {
        if (board[y][x_pos] === 0) {
            return y;
        }
    }

    return y_pos;
}

/**
 * Test to ensure the chosen location isn't taken.
 *
 * @param int x_pos The x-position of the location chosen.
 * @param int y_pos The y-position of the location chosen.
 * @return bool returns true or false for the question "Is this spot taken?".
 */
function positionIsTaken(x_pos, y_pos) {
    var value = board[y_pos][x_pos];

    return value === 0 ? false : true;
}

/**
 * Determine if the game is a draw (all peices on the board are filled).
 *
 * @return bool Returns true or false for the question "Is this a draw?".
 */
function gameIsDraw() {
    for (var y = 0; y <= 5; y++) {
        for (var x = 0; x <= 6; x++) {
            if (board[y][x] === 0) {
                return false;
            }
        }
    }

    // No locations were empty. Return true to indicate that the game is a draw.
    return true;
}

/**
 * Test to see if somebody got four consecutive horizontal pieces.
 *
 * @return bool Returns true if a win was found, and otherwise false.
 */
function horizontalWin() {
    var currentValue = null,
        previousValue = 0,
        tally = 0;

    // Scan each row in series, tallying the length of each series. If a series
    // ever reaches four, return true for a win.
    for (var y = 0; y <= 5; y++) {
        for (var x = 0; x <= 6; x++) {
            currentValue = board[y][x];
            if (currentValue === previousValue && currentValue !== 0) {
                tally += 1;
            } else {
                // Reset the tally if you find a gap.
                tally = 0;
            }
            if (tally === config.countToWin - 1) {
                return true;
            }
            previousValue = currentValue;
        }

        // After each row, reset the tally and previous value.
        tally = 0;
        previousValue = 0;
    }

    // No horizontal win was found.
    return false;
}

/**
 * Test to see if somebody got four consecutive vertical pieces.
 *
 * @return bool Returns true if a win was found, and otherwise false.
 */
function verticalWin() {
    var currentValue = null,
        previousValue = 0,
        tally = 0;

    // Scan each column in series, tallying the length of each series. If a
    // series ever reaches four, return true for a win.
    for (var x = 0; x <= 6; x++) {
        for (var y = 0; y <= 5; y++) {
            currentValue = board[y][x];
            if (currentValue === previousValue && currentValue !== 0) {
                tally += 1;
            } else {
                // Reset the tally if you find a gap.
                tally = 0;
            }
            if (tally === config.countToWin - 1) {
                return true;
            }
            previousValue = currentValue;
        }

        // After each column, reset the tally and previous value.
        tally = 0;
        previousValue = 0;
    }

    // No vertical win was found.
    return false;
}

/**
 * Test to see if somebody got four consecutive diagonel pieces.
 *
 * @todo: refactor this to make it more DRY.
 * @return bool Returns true if a win was found, and otherwise false.
 */
function diagonalWin() {
    var x = null,
        y = null,
        xtemp = null,
        ytemp = null,
        currentValue = null,
        previousValue = 0,
        tally = 0;

    // Test for down-right diagonals across the top.
    for (x = 0; x <= 6; x++) {
        xtemp = x;
        ytemp = 0;

        while (xtemp <= 6 && ytemp <= 5) {
            currentValue = board[ytemp][xtemp];
            if (currentValue === previousValue && currentValue !== 0) {
                tally += 1;
            } else {
                // Reset the tally if you find a gap.
                tally = 0;
            }
            if (tally === config.countToWin - 1) {
                return true;
            }
            previousValue = currentValue;

            // Shift down-right one diagonal index.
            xtemp++;
            ytemp++;
        }
        // Reset the tally and previous value when changing diagonals.
        tally = 0;
        previousValue = 0;
    }

    // Test for down-left diagonals across the top.
    for (x = 0; x <= 6; x++) {
        xtemp = x;
        ytemp = 0;

        while (0 <= xtemp && ytemp <= 5) {
            currentValue = board[ytemp][xtemp];
            if (currentValue === previousValue && currentValue !== 0) {
                tally += 1;
            } else {
                // Reset the tally if you find a gap.
                tally = 0;
            }
            if (tally === config.countToWin - 1) {
                return true;
            }
            previousValue = currentValue;

            // Shift down-left one diagonal index.
            xtemp--;
            ytemp++;
        }
        // Reset the tally and previous value when changing diagonals.
        tally = 0;
        previousValue = 0;
    }

    // Test for down-right diagonals down the left side.
    for (y = 0; y <= 5; y++) {
        xtemp = 0;
        ytemp = y;

        while (xtemp <= 6 && ytemp <= 5) {
            currentValue = board[ytemp][xtemp];
            if (currentValue === previousValue && currentValue !== 0) {
                tally += 1;
            } else {
                // Reset the tally if you find a gap.
                tally = 0;
            }
            if (tally === config.countToWin - 1) {
                return true;
            }
            previousValue = currentValue;

            // Shift down-right one diagonal index.
            xtemp++;
            ytemp++;
        }
        // Reset the tally and previous value when changing diagonals.
        tally = 0;
        previousValue = 0;
    }

    // Test for down-left diagonals down the right side.
    for (y = 0; y <= 5; y++) {
        xtemp = 6;
        ytemp = y;

        while (0 <= xtemp && ytemp <= 5) {
            currentValue = board[ytemp][xtemp];
            if (currentValue === previousValue && currentValue !== 0) {
                tally += 1;
            } else {
                // Reset the tally if you find a gap.
                tally = 0;
            }
            if (tally === config.countToWin - 1) {
                return true;
            }
            previousValue = currentValue;

            // Shift down-left one diagonal index.
            xtemp--;
            ytemp++;
        }
        // Reset the tally and previous value when changing diagonals.
        tally = 0;
        previousValue = 0;
    }

    // No diagonal wins found. Return false.
    return false;
}

function dropDisc(x_pos) { //-> gameover:bool
    
    tellThem(x_pos);

    // Ensure the piece falls to the bottom of the column.
    var y_pos = dropToBottom(x_pos, 0);

    addDiscToBoard(currentPlayer, x_pos, y_pos);
    printBoard();

    var gameover = false;
    // Check to see if we have a winner.
    if (verticalWin() || horizontalWin() || diagonalWin()) {
        // Destroy our click listener to prevent further play.
        $('.prefix').text(config.winPrefix);
        $('#player').text(config[currentPlayer + "PlayerName"] === config.you ? "you" : "them");
        gameover = true;

    } else if (gameIsDraw()) {
        // Destroy our click listener to prevent further play.
        $('.message').text(config.drawMsg);
        gameover = true;
    }
    
    // prevent any further action if game is over 
    if (gameover) {
        $('.board button').unbind('click');
        $('.play-again').show("slow");
    } else { // ... otherwise just change the player
        changePlayer();
    }
}