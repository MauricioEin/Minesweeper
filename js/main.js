'use strict'
const MINE = '<img src="img/bomb.png"/>'
const UNSHOWN = ''
const WIN = '🥳'
const LOSE = '😨'
const PLAYING = '😊'
const CELL_COLOR = 'rgb(220, 220, 220)'
const CELL_HOVER_COLOR = 'rgb(180,180,180)'
const SAVED_CELL_COLOR = 'orange'

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
    secsPassed: 0,
    lives: 3,
    hints: 3,
    safeClicks: 3,
    isHint: false,
    isSeven: false,
    isManual: false,
    isMegaHint: false,
    megaHintFirst: {},
    history: []
}

var gLevel = {
    name: 'beginner',
    size: gLevels.beginner.size,
    mines: gLevels.beginner.mines
}

var gBoard
var gTimeInterval


function initGame() {
    resetGameVals()
    renderButtons()
    gBoard = buildBoard()
    renderBlankBoard(gBoard)
    renderTime()
    renderMarked()
    renderMinersClubFeatures()
}

function resetGameVals() {
    gGame.isOn = true
    gGame.shownCount = gGame.markedCount = gGame.secsPassed = 0
    gGame.lives = gGame.hints = gGame.safeClicks = 3
    gGame.isHint = gGame.isSeven = gGame.isManual = gGame.isMegaHint = false
    gGame.megaHintFirst = null
    gGame.history = []
    gLevel.mines = gLevels[gLevel.name].mines
}

function renderButtons() {
    const elButtons = document.querySelector('.level span')
    var strHTML = ''
    for (var level in gLevels) {
        const className = (gLevel.name === level) ? 'chosen' : 'unchosen'
        strHTML += `<button class="${className}" 
        onclick="changeLevel('${level}')">${level.toUpperCase()}</button>`
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
    return board
}

function renderBlankBoard(board) {
    var strHTML = `<th class="lives" colspan="${gLevel.size}">LIVES: <span>🌹🌹🌹</span></th>`
    for (var i = 0; i < board.length; i++) {
        const row = board[i]
        strHTML += '<tr>'
        for (var j = 0; j < row.length; j++) {
            strHTML += `<td data-position="${i},${j}" onclick="cellClicked(this, ${i}, ${j})"
            oncontextmenu="cellMarked(this, ${i}, ${j});return false;" onmouseover="onHover(${i}, ${j})">${UNSHOWN}</td>`
        }

        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}


function locateMines(board, iClicked, jClicked) {
    const mineLocations = getRandomLocationsWithException(board, gLevel.mines, iClicked, jClicked)
    for (var loc of mineLocations) {
        board[loc.i][loc.j].isMine = true
        document.querySelector(`[data-position="${loc.i},${loc.j}"]`).classList.add('mine')
    }
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


function cellClicked(elCell, i, j) {
    if (gGame.isManual && !gGame.isOn) return placeManualMine(elCell, i, j)
    const cell = gBoard[i][j]
    if (!gGame.isOn || cell.isShown || elCell.classList.contains('flag')) return
    if (gGame.isHint) return onClickHint(i, j)
    if (gGame.isMegaHint) return onClickMegaHint(elCell, i, j)
    if (!gTimeInterval) {
        if (!gGame.isSeven && !gGame.isManual) {
            locateMines(gBoard, i, j)
            setMinesAroundCount(gBoard)
        }
        gTimeInterval = setInterval(renderTime, 1000)
    }
    gGame.history.push([{ cell, elCell }])
    if (cell.isMine) {
        gGame.lives--
        renderLives()
        if (!gGame.lives) return gameOver(elCell)
        // elCell.classList.add('saved') doesn't work w/o !important
        elCell.style.backgroundColor = SAVED_CELL_COLOR
        cellMarked(elCell, i, j)
        return
    }
    showCell(cell, elCell)
    if (!cell.minesAroundCount) expandShown(gBoard, i, j)
    checkWin()
}

function showCell(cell, elCell) {
    elCell.innerText = cell.minesAroundCount
    elCell.style.color = gNumColors[cell.minesAroundCount]
    elCell.classList.add('shown') // This isn't worknig.
    elCell.style.borderStyle = 'inset'
    // elCell.style.backgroundColor = 'rgb(210, 210, 210)'
    cell.isShown = true
    gGame.shownCount++
}

function renderTime() {
    var elTimeSpan = document.querySelector('.time span')
    elTimeSpan.innerText = gGame.secsPassed++
}

function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (gGame.isManual && !gGame.isOn) return placeManualMine(elCell, i, j)
    gGame.markedCount += (gBoard[i][j].isMarked) ? -1 : +1
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked
    elCell.classList.toggle('flag')
    renderMarked()
    checkWin()
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
    gTimeInterval = null
    gGame.isOn = false
    gGame.isManual = false
}

function checkWin() {
    const notMines = gLevel.size ** 2 - gLevel.mines
    if (gGame.shownCount !== notMines) return
    const elMines = document.querySelectorAll('.mine')
    for (var elMine of elMines) {
        if (elMine.classList.contains('flag')) continue
        elMine.classList.add('flag')
        gGame.markedCount++
    }
    renderMarked()
    renderEmoji(WIN)
    endGame()
}

function changeLevel(level) {
    gLevel.name = level
    gLevel.mines = gLevels[level].mines
    gLevel.size = gLevels[level].size
    clearInterval(gTimeInterval)
    gTimeInterval = null
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
            if (elNeg.classList.contains('flag')) {
                elNeg.classList.remove('flag')
                gGame.markedCount--
                renderMarked()
            }
            showCell(negCell, elNeg)
            gGame.history[gGame.history.length - 1].push({ cell: negCell, elCell: elNeg })
            if (!negCell.minesAroundCount) expandShown(gBoard, i, j)
        }
    }

}

function restart() {
    clearInterval(gTimeInterval)
    gTimeInterval = null
    initGame()
}

function renderLives() {
    var elLives = document.querySelector('.lives span')
    var livesStr = ''
    while (livesStr.length < gGame.lives * 2) {
        livesStr += '🌹'
    }
    while (livesStr.length < 6) {
        livesStr += '🥀'
    }
    elLives.innerText = livesStr

}
