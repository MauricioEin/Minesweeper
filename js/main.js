'use strict'
const MINE = '<img src="img/bomb.png"/>'
const UNSHOWN = '?'
const WIN = '🥳'
const LOSE = '😨'
const PLAYING = '😊'

const gLevels = {
    beginner: { size: 4, mines: 2 },
    medium: { size: 8, mines: 14 },
    expert: { size: 12, mines: 32 }
}

const gNumColors = {
    1: 'blue',
    2: 'green',
    3: 'red',
    4: 'purple',
    5: 'maroon',
    6: 'turquoise',
    7: 'black',
    8: 'grey'
}

const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = gLevels.beginner

var gBoard
var gTimeInterval


function initGame() {
    renderButtons()
    gBoard = buildBoard()
    renderBoard(gBoard)
    resetGameVals()
    renderTime()
    renderMarked()
}

function resetGameVals() {
    gGame.isOn = true
    gGame.shownCount = gGame.markedCount = gGame.secsPassed = 0
}

function renderButtons() {
    const elButtons = document.querySelector('.level span')
    var strHTML = ''
    for (var level in gLevels) {
        const className = (gLevel === gLevels[level]) ? 'chosen' : 'unchosen'
        strHTML += `<button class="${className}" 
        onclick="changeLevel('${level}')">${level}</button>`
    }
    elButtons.innerHTML = strHTML
    renderEmoji(PLAYING)
}

function renderEmoji(content) {
    const elEmoji = document.querySelector('.gameover button')
    elEmoji.innerText = content

}


function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.size; i++) {
        const row = []
        for (var j = 0; j < gLevel.size; j++) {
            const cell = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false }
            row.push(cell)
        }
        board.push(row)
    }
    const mineLocations = getRandomLocations(board, gLevel.mines)
    for (var loc of mineLocations) {
        board[loc.i][loc.j].isMine = true
    }
    setMinesAroundCount(board)
    return board
}


function setMinesAroundCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            const minesAroundCell = countMinesAroundCell(board, i, j)
            board[i][j].minesAroundCount = minesAroundCell ? minesAroundCell : ''
        }
    }
}

function countMinesAroundCell(board, iIdx, jIdx) {
    var count = 0
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j >= board[0].length
                || (j === jIdx && i === iIdx)) continue
            if (board[i][j].isMine) count++
        }
    }
    return count
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        const row = board[i]
        strHTML += '<tr>'
        for (var j = 0; j < row.length; j++) {
            const className = row[j].isMine ? "mine" : ""
            // const className = ((i + j) % 2 === 0) ? 'white' : 'black'
            // const tdId = `cell-${i}-${j}`
            strHTML += `<td class="${className}" data-position="${i},${j}" onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="cellMarked(this, ${i}, ${j});return false;">${UNSHOWN}</td>`
        }

        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function cellClicked(elCell, i, j) {
    const cell = gBoard[i][j]
    if (!gGame.isOn || cell.isShown || elCell.classList.contains('flag')) return
    if (cell.isMine) return gameOver(elCell)
    if (gGame.shownCount === 0) gTimeInterval = setInterval(renderTime, 1000)
    showCell(cell, elCell)
    if (!cell.minesAroundCount) expandShown(gBoard, i, j)
    checkGameOver()
}

function showCell(cell, elCell) {
    elCell.innerText = cell.minesAroundCount
    elCell.style.color = gNumColors[cell.minesAroundCount]
    elCell.classList.add('shown') // This isn't worknig.
    elCell.style.borderStyle = 'inset' 
    elCell.style.backgroundColor = 'rgb(210, 210, 210)' 
    cell.isShown = true
    gGame.shownCount++
}

function renderTime() {
    var elTimeSpan = document.querySelector('.time span')
    elTimeSpan.innerText = gGame.secsPassed++
}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    gGame.markedCount += (elCell.classList.contains('flag')) ? -1 : +1
    elCell.classList.toggle('flag')
    renderMarked()
    checkGameOver()
}

function renderMarked() {
    const flagsLeft = gLevel.mines - gGame.markedCount
    document.querySelector('.flags-left span').innerText = flagsLeft
}

function gameOver(elCell) {
    elCell.style.backgroundColor = 'red'
    renderEmoji(LOSE)
    const elMines = document.querySelectorAll('.mine')
    for (var elMine of elMines) {
        elMine.innerHTML = MINE
    }
    endGame()
}

function endGame() {
    clearInterval(gTimeInterval)
    gGame.isOn = false
}

function checkGameOver() {
    const notMines = gLevel.size ** 2 - gLevel.mines
    if (gGame.markedCount !== gLevel.mines ||
        gGame.shownCount !== notMines) return
    renderEmoji(WIN)
    endGame()
}

function changeLevel(level) {
    gLevel = gLevels[level]
    clearInterval(gTimeInterval)
    initGame()
}

function expandShown(board, iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j >= board[0].length
                || (j === jIdx && i === iIdx)) continue
            const negCell = board[i][j]
            if (negCell.isShown) continue
            const elNeg = document.querySelector(`[data-position="${i},${j}"]`)
            showCell(negCell, elNeg)
            if (!negCell.minesAroundCount) expandShown(gBoard, i, j)
        }
    }

}

function restart() {
    clearInterval(gTimeInterval)
    initGame()
}