
$(document).ready(function() {

    // Setup game.

    // Ask who's who
    $('.modal').css({'display':'block'});

    // @todo: Make name pop-ups more user-friendly. Perhaps optional?
 //   config.blackPlayerName = prompt("Please enter the first player's name. This player will use black game pieces.", config.blackPlayerName) || config.blackPlayerName;
 //   config.redPlayerName = prompt("Please enter the second player's name. This player will use red game pieces.", config.redPlayerName) || config.redPlayerName;
 //   $('.prefix').text(config.you);
    $('#player').addClass("black").text(config.initTitle);

    // Trigger the game sequence by clicking on a position button on the board.
    $('.board button').click(function(e) {
        if (halt) return;
        
        // Detect the x and y position of the button clicked.
        //var y_pos = $('.board tr').index($(this).closest('tr'));
        var x_pos = $(this).closest('tr').find('td').index($(this).closest('td'));

        if (positionIsTaken(x_pos, 0)) {
            alert(config.takenMsg);
            return;
        }

        var gameover = dropDisc(x_pos);
        
        if (gameover) {
            $('.board button').unbind('click');
            $('.play-again').show("slow");
            return;
        }
        changePlayer();
    });

    $('.play-again').click(function(e) {
        location.reload();
    });

});
