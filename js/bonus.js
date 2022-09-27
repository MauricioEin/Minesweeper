'use strict'

const MANUAL_START_BUTTON = '<button onclick="donePlacingMines()">Let\'s start!</button>'
const MANUAL_NOT_READY = '<p style="color:black;margin:0px">Mark those mines!</p>'


function renderHints() {
    var hintsHTML = 'HINTS:<br/>'
    for (var i = 0; i < gGame.hints; i++) {
        hintsHTML += '<span onclick="onHint(this)">💡</span>'
    }
    document.querySelector('.hints').innerHTML = hintsHTML
}

function onHint(elHint) {
    if (!gGame.isOn || gGame.isHint) return
    elHint.innerText = '🔎'
    elHint.classList.add('used')
    gGame.isHint = true
    changeBoardCursor('help')
}

function onClickHint(i, j) {
    gGame.isHint = false
    changeBoardCursor('pointer')
    const elHint = document.querySelector('.used')
    elHint.innerHTML = ''
    elHint.classList.remove('used')

    showHint(i, j)
}

function showHint(iIdx, jIdx) {
    for (var i = iIdx - 1; i <= iIdx + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = jIdx - 1; j <= jIdx + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue
            temporaryShow(i, j, 1000)
        }
    }
}

function hideHint(elCell, cell) {
    if (!cell.isShown) elCell.innerHTML = UNSHOWN
}

function boom7() {
    clearInterval(gTimeInterval)
    gTimeInterval = null
    initGame()
    gGame.isSeven = true
    var sevenBoomMines = 0
    for (var i = 0; i < gLevel.size ** 2; i++)
        if (i % 7 === 0 || i % 10 === 7 || parseInt(i / 10) % 10 === 7) {
            gBoard[parseInt(i / gLevel.size)][i % gLevel.size].isMine = true
            document.querySelector(`[data-position="${parseInt(i / gLevel.size)},${i % gLevel.size}"]`).classList.add('mine')
            sevenBoomMines++
        }
    gLevel.mines = sevenBoomMines
    renderMarked()
    setMinesAroundCount(gBoard)

}

function renderSafeClicks() {
    document.querySelector('.safe span').innerText = gGame.safeClicks
    if (gGame.safeClicks > 0) document.querySelector('.safe button').classList.remove('empty')

}

function safeClick(elBtn) {
    if (gGame.safeClicks < 1 || !gGame.isOn) return
    var loc = getRandomLocationsWithException(gBoard)
    var cell = gBoard[loc.i][loc.j]

    while (cell.isMine || cell.isShown) {
        loc = getRandomLocationsWithException(gBoard)
        cell = gBoard[loc.i][loc.j]
    }
    const elCell = document.querySelector(`[data-position="${loc.i},${loc.j}"]`)
    elCell.classList.add('safecell')
    setTimeout(removeSafeCell, 1200, elCell)
    gGame.safeClicks--
    renderSafeClicks()
    if (gGame.safeClicks < 1) {
        elBtn.classList.add('empty')
    }

}

function removeSafeCell(elCell) {
    elCell.classList.remove('safecell')
}

function undo() {
    if (!gGame.history.length || !gGame.isOn) return
    const lastMove = gGame.history.pop()
    for (var move of lastMove) {
        move.elCell.innerText = UNSHOWN
        move.elCell.style.backgroundColor = CELL_COLOR
        move.elCell.style.borderStyle = 'outset'
        move.elCell.classList.remove('shown')
        if (move.elCell.classList.contains('flag')) {
            move.elCell.classList.remove('flag')
            gGame.markedCount--
            renderMarked()
        } else {
            move.cell.isShown = false
            gGame.shownCount--
        }
    }
}

function openModal() {
    document.querySelector('.modal').hidden = !document.querySelector('.modal').hidden

}
function closeModal() {
    document.querySelector('.modal').hidden = true
}

function manualMines() {
    clearInterval(gTimeInterval)
    gTimeInterval = null
    initGame()
    gGame.isManual = true
    gGame.isOn = false
    const elCells = document.querySelectorAll('.board td')
    for (var elCell of elCells) {
        elCell.style.backgroundColor = 'pink'
        elCell.innerHTML = '?'
    }
    document.querySelector('.manual span').innerHTML = MANUAL_NOT_READY
}

function placeManualMine(elCell, i, j) {
    const cell = gBoard[i][j]
    if (!cell.isMine && gGame.markedCount >= gLevel.mines) return
    cell.isMine = !cell.isMine
    gGame.markedCount += (elCell.classList.contains('flag')) ? -1 : +1
    elCell.classList.toggle('flag')
    elCell.classList.toggle('mine')
    renderMarked()
    if (gGame.markedCount >= gLevel.mines) {
        document.querySelector('.manual span').innerHTML = MANUAL_START_BUTTON
    } else {
        document.querySelector('.manual span').innerHTML = MANUAL_NOT_READY

    }
}

function donePlacingMines() {
    document.querySelector('.manual span').innerHTML = ''
    const elCells = document.querySelectorAll('.board td')
    for (var elCell of elCells) {
        elCell.classList.remove('flag')
        elCell.style.backgroundColor = CELL_COLOR
        elCell.innerHTML = ''
    }
    setMinesAroundCount(gBoard)
    gGame.markedCount = 0
    renderMarked()
    gGame.isOn = true

}

function renderMegaHint() {
    const buttonHTML = '<button onclick="megaHint(this)">MEGA HINT</button>'
    document.querySelector('.mega').innerHTML = buttonHTML
}

function megaHint(elMegaBtn) {
    gGame.isMegaHint = true
    changeBoardCursor('help')
    elMegaBtn.onclick = ''
    elMegaBtn.style.cursor = 'default'
    elMegaBtn.style.opacity = '50%'
}


function onClickMegaHint(elCell, iIdx, jIdx) {
    if (!gGame.megaHintFirst) {
        gGame.megaHintFirst = { i: iIdx, j: jIdx }
        return
    }
    if (gGame.megaHintFirst.i === iIdx && gGame.megaHintFirst.j === jIdx) {
        gGame.megaHintFirst = null
        elCell.style.backgroundColor = CELL_COLOR
    } else {
        showMegaHint(gGame.megaHintFirst, { i: iIdx, j: jIdx })
    }
}

function showMegaHint(loc1, loc2) {
    arrangeIdxs(loc1, loc2)
    for (var i = loc1.i; i <= loc2.i; i++) {
        for (var j = loc1.j; j <= loc2.j; j++) {
            temporaryShow(i, j, 2000)
        }
    }
    gGame.isMegaHint = false
    changeBoardCursor('pointer')
    neutralColorAllCells()

}

function temporaryShow(i, j, miliSecs) {
    const cell = gBoard[i][j]
    if (cell.isShown) return
    const elCell = document.querySelector(`[data-position="${i},${j}"]`)
    elCell.innerHTML = cell.isMine ? MINE : cell.minesAroundCount
    elCell.style.color = gNumColors[cell.minesAroundCount]
    setTimeout(hideHint, miliSecs, elCell, cell)

}


function arrangeIdxs(loc1, loc2) {
    if (loc1.i > loc2.i) {
        const iAux = loc1.i
        loc1.i = loc2.i
        loc2.i = iAux
    }
    if (loc1.j > loc2.j) {
        const jAux = loc1.j
        loc1.j = loc2.j
        loc2.j = jAux
    }
}

function changeBoardCursor(cursor) {
    const elCells = document.querySelectorAll('.board td')
    for (var elCell of elCells) {
        elCell.style.cursor = cursor
    }
}

function onHover(i, j) {
    if (!gGame.megaHintFirst || !gGame.isMegaHint) return
    markMegaHintCells(gGame.megaHintFirst, { i, j })
}

function markMegaHintCells(selectedLoc, loc2) {
    neutralColorAllCells()
    const loc1 = { i: selectedLoc.i, j: selectedLoc.j }
    arrangeIdxs(loc1, loc2)
    for (var i = loc1.i; i <= loc2.i; i++) {
        for (var j = loc1.j; j <= loc2.j; j++) {
            const elCell = document.querySelector(`[data-position="${i},${j}"]`)
            elCell.classList.add('mega-range')
        }
    }
}

function neutralColorAllCells() {
    const elCells = document.querySelectorAll('.board td')
    for (var elCell of elCells) {
        elCell.classList.remove('mega-range')
    }
}

function renderExterminator() {
    const buttonHTML = '<button onclick="exterminate()">MINE EXTERMINATOR</button>'
    document.querySelector('.exterminator').innerHTML = buttonHTML
}

function exterminate() {
    const mineLocs = getAllMines(gBoard)
    var extNum = Math.min(3, mineLocs.length - gGame.markedCount)
    while (extNum > 0) {
        const idx = getRandomInt(0, mineLocs.length)
        const loc = mineLocs.splice(idx, 1)[0]
        const mineCell = gBoard[loc.i][loc.j]
        if (mineCell.isMarked) continue
        mineCell.isMine = false
        gLevel.mines--
        extNum--
    }
    setMinesAroundCount(gBoard)
    renderMarked()
    updateShown()
}

function updateShown() {
    const elCells = document.querySelectorAll('.shown')
    for (var elCell of elCells) {
        const pos = elCell.dataset.position.split(',')
        const cell = gBoard[pos[0]][pos[1]]
        elCell.innerText = cell.minesAroundCount
        elCell.style.color = gNumColors[cell.minesAroundCount]
    }
}

function renderMinersClubFeatures() {
    renderHints()
    renderSafeClicks()
    renderMegaHint()
    renderExterminator()
    document.querySelector('.manual span').innerHTML = ''
}