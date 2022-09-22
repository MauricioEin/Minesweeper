'use strict'

// function createBoard(rows, cols) {
//     var board = []
//     for (var i = 0; i < rows; i++) {
//         var row = []
//         for (var j = 0; j < cols; j++) {
//             row.push('')
//         }
//         board.push(row)
//     }
//     return board
// }

function getRandomInt(min, max) {
    // not inclusive
    return Math.floor(Math.random() * (max - min)) + min

}

function getRandomLocations(board, num) {
    num = Math.min(num, board.length * board[0].length)
    const auxBoard = board.slice()
    const locs = []
    while (num > 0) {
        const iIdx = getRandomInt(0, auxBoard.length)
        const jIdx = getRandomInt(0, auxBoard[iIdx].length)
        const loc = { i: iIdx, j: jIdx }
        if (!locs.includes(loc)) {
            locs.push(loc)
            num--
        }
    }
    return locs
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}