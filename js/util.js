'use strict'


function getRandomInt(min, max) {
    // not inclusive
    return Math.floor(Math.random() * (max - min)) + min

}

function getRandomLocationsWithException(board, num = 1, iExpt = null, jExpt = null) {

    num = Math.min(num, board.length * board[0].length)
    const auxBoard = board.map(arr => arr.slice())
    const locs = []
    while (num > 0) {
        const iIdx = getRandomInt(0, auxBoard.length)
        const jIdx = getRandomInt(0, auxBoard[iIdx].length)
        if (auxBoard[iIdx][jIdx] === 'This location has already been used'
            || (iIdx === iExpt && jIdx === jExpt)) continue
        auxBoard[iIdx][jIdx] = 'This location has already been used'
        locs.push({ i: iIdx, j: jIdx })
        num--
    }
    if (locs.length > 1) return locs
    return locs[0]
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getAllMines(board) {
    const mines = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) mines.push({ i, j })
        }
    }
    return mines
}