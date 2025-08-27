// A very accurate rounding function
function round(value, decimals) {
    let multiplier = 10**decimals;
    return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

// Get a random number from min to max
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* 
    Sleep the code for a certain number of ms
    NOTE: Any function that will use this must be declared with async and
    this sleep function called with "await sleep(x)" where x is a number of ms
*/


// Setup
let tableTileValue = document.getElementsByClassName("back") // tile values
let cells = document.getElementsByTagName("td") // contains everything in one tile (value and green square that covers it)
let tiles = [] // will become 2D array of minefield values
let fronts = document.querySelectorAll(".front")// each square on the field
let secondCount = 0 // second counter
let minuteCount = 0 // minute counter
let tileClicks = 0 // # of tileClicks
let tempC = 0 // temporary counter variable
let interval // will store special interval id to use to stop timer later
let minePos = [] // contain positions of all mines
let digSound = document.getElementById("dig")
let explodeSound = document.getElementById("explode")
let winSound = document.getElementById("winSound")
let field = document.getElementById('field')
let gridSize = 16
let mineNum = 40
let bombImage = document.getElementById('bombImage')
let bombSRC = ''
let tileImage = document.getElementById('tileImage')
let tileSRC = ''

function setTable(n) {
    // creates 16x16 2D list of values starting from 256 (representing the empty tiles, but they are numbered for now for indexing purposes)
    gridSize = n
    let box = `
    <td class="tile-container">
                    <div class="tile">
                        <img src="./images/greenSquare.jpeg" alt="" class="front">
                        <p class="back"></p>
                        
                    </div>
                </td>`
    field.innerHTML = ``;
    for (let i=1; i<n+1; i++) {
        let newRow = document.createElement('tr')
        newRow.class = `row${n}`
        for (let i=1; i<n+1; i++) {
            newRow.innerHTML += box
        }
        field.appendChild(newRow)
    }
    fronts = document.querySelectorAll(".front")
    tableTileValue = document.getElementsByClassName("back")

    // var r = document.querySelector(':root')
    // r.style.setProperty('--tile-width', `${document.getElementById('field').getBoundingClientRect().width/(n)}px`)
    // console.log(document.getElementById('field').getBoundingClientRect().width/(n))
    
}

function customize() {
    tempC = gridSize*gridSize
    tiles = []
    minePos = []
    for (let n=0; n<gridSize; n++) {
    let l = []
    for (let i=0; i<gridSize; i++) {
        l.push(tempC)
        tempC++
    }
    tiles.push(l)
    }

        // choosing mineNum random row, colum positions to replace with "m" = mine

        while (minePos.length < mineNum){ // keep picking mine positions until mineNum different ones are picked
        let randomRow = randInt(0, gridSize-1)
        let randomColumn = randInt(0, gridSize-1)
        if (tiles[randomRow][randomColumn] != "m") { // making sure radomized coordinate doen't already have a mine
            tiles[randomRow][randomColumn] = "m"
            minePos.push([randomRow, randomColumn])
        }

        }

        // calculates value of each tile depending on # of surrounding mines + changes each number to specific color
        for (let n=0; n<gridSize; n++) {
        for (let i=0; i<gridSize; i++) {
            if (tiles[n][i] >= gridSize*gridSize) {
                tiles[n][i] = tileValueCalculate(n, i)
                
                if (tiles[n][i] == 1) {
                    tableTileValue[n*gridSize+i].style.color = "#03a1fc"
                }
                if (tiles[n][i] == 2) {
                    tableTileValue[n*gridSize+i].style.color = "#23c245" 
                }
                if (tiles[n][i] == 3) {
                    tableTileValue[n*gridSize+i].style.color = "#c72d1c" 
                }
                if (tiles[n][i] == 4) {
                    tableTileValue[n*gridSize+i].style.color = "#7d1cc7" 
                }
                if (tiles[n][i] == 5) {
                    tableTileValue[n*gridSize+i].style.color = "#ff9d1c" 
                }
                if (tiles[n][i] == 6) {
                    tableTileValue[n*gridSize+i].style.color = "#4fb08c" 
                }
                if (tiles[n][i] == 7) {
                    tableTileValue[n*gridSize+i].style.color = "#d14fb5" 
                }
                if (tiles[n][i] == 8) {
                    tableTileValue[n*gridSize+i].style.color = "#bdbdbd" 
                }
            }
        }
        }

        update() // updating all changes made to tiles 2D array to HTML table
        setImages()
}


// update(gridSize) // updating all changes made to tiles 2D array to HTML table
document.getElementById("close").addEventListener("click", main) // main game interactions only work when user closes how to card

// Functions

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// goes through 2D array tiles values and HTML table tile values and replaces accordingly so it showes up on screen
function update() {
    tempC = 0 // counter used for tableTileValue index since its not a 2D array
    for (let row=0; row<gridSize; row++) {
        for (let column=0; column<gridSize; column++) {
            if (tiles[row][column] == "m") {
                let node = document.createElement("IMG") // adding img tag to document
                node.src = "./images/bomb.png" // bomb img source
                node.classList.add("bomb") // adding bomb class to apply according predefined styles
                tableTileValue[tempC].appendChild(node) // appending img tag to tile value to replace "m" with bomb image
            } else {
                tableTileValue[tempC].innerHTML = tiles[row][column] // replacing table value with tiles value
            }
            tempC++
        }
    }
}

// returns list of positions of surrounding tile values based on given position of one tile
function allSurroundingPos(r, c) {
    let positions = [] // positions will be added as if conditions figure out positioning of given tile (border, corner or middle tile) since you only need to check a certain # of positions depending on given tile position
    if (r == 0 && c <= gridSize-1) { // checking if given tile is top row 
        if (c > 0 && c != gridSize-1) { // checking if its top row but not top right or left corner
            positions.push([r, c-1], [r+1, c-1])
        } else if (c == 0) { // case for if tile is top left corner
            positions.push([r, c+1], [r+1, c], [r+1, c+1])
            return positions
        } else if (c == gridSize-1) { // case for if tile is top right corner
            positions.push([r, c-1], [r+1, c], [r+1, c-1])
            return positions
        }
        positions.push([r, c+1], [r+1, c], [r+1, c+1]) // if it didnt pass any of above if conditions, it is a top border tile (excluding corners) and adds more positions accordingly
    }

    if (r == gridSize-1 && c <= gridSize-1) { // checking if given tile is bottom row 
        if (c > 0 && c != gridSize-1) { // checking if given tiles is bottom row but not bottom right corner
            positions.push([r, c-1], [r-1, c-1])
        } else if (c == 0) { // checking if given tiles is bottom left corner
            positions.push([r, c+1], [r-1, c], [r-1, c+1])
            return positions
        } else if (c == gridSize-1) { // checking if given tiles is bottom right corner
            positions.push([r, c-1], [r-1, c], [r-1, c-1])
            return positions
        }
        positions.push([r, c+1], [r-1, c], [r-1, c+1]) // if it didnt pass any of above if conditions, it is a bottom border tile (excluding corners) and adds more positions accordingly
    }

    if (c == 0 && r > 0 && r < gridSize-1) { // checking if given tile is in left border (excluding corners) 
        positions.push([r, c+1], [r-1, c], [r-1, c+1], [r+1, c], [r+1, c+1])
    }
    if (c == gridSize-1 && r > 0 && r < gridSize-1) { // checking if given tile is in right border (excluding corners) 
        positions.push([r, c-1], [r-1, c], [r-1, c-1], [r+1, c], [r+1, c-1])
    }

    if (r > 0 && c>0 && c< gridSize-1 && r<gridSize-1) { // checking if tile is in middle (excluding any border tiles)
        positions = [[r-1, c], [r+1, c], [r, c-1], [r, c+1], [r-1, c-1], [r-1, c+1], [r+1, c-1], [r+1, c+1]]
    }

    return positions // returns final list of positions as 2D array
}

function timer() {
    if (String(secondCount/60).includes(".") || secondCount == 0) { // checking if seconds is divisble by 60 to see if second counter should restart and add one minute to min counter
        if (secondCount < 10) { // seconds less than 10 need 0 in front of digit
            document.getElementById("secs").innerHTML = "0" + String(secondCount++)
        } else {
            document.getElementById("secs").innerHTML = secondCount++
        }
    } else { // updating minutes and resetting seconds
        secondCount = 0
        minuteCount++
        document.getElementById("secs").innerHTML = "00"
        document.getElementById("mins").innerHTML = minuteCount
    }
} 

// counting # of mines around given tile and replacing it with calculated number
function tileValueCalculate(r, c) {
    let v = 0
    let p = allSurroundingPos(r, c)
    for (let i=0; i<p.length; i++) {
        let coordinate = p[i]
        if (tiles[coordinate[0]][coordinate[1]] == "m") { // checking if current surrunding position has a mine
            v++
        }
    }
    if (v != 0) {
        return v
    } else { // in case of no mines around, return same tile value
        return tiles[r][c]
    }

}

// returns two lists, one 2d array of positions of surrounding tiles that are empty and one 2d array of positions of surrounding tiles that are numbered 1-8
function surround(r, c) {
    let emptyTilePos = []
    let numberedTilePos = []
    let p = allSurroundingPos(r, c) // all tile positions around given tile
    for (let i=0; i<p.length; i++) {
        let coordinate = p[i]
        if (tiles[coordinate[0]][coordinate[1]] >= gridSize*gridSize) { // checking for empty tile (not actually empty, but the number is used for indexing) and adding to according array if true
            emptyTilePos.push(coordinate)
        }
        if (tiles[coordinate[0]][coordinate[1]] < 9) { // checking for tiles numbered 1-8 and adding to according array if true
            numberedTilePos.push(coordinate)
        }
        
    }
    return [emptyTilePos, numberedTilePos]
}

// reveals tile based on given row and column, removing green square to simulate "digging" up the minefield
async function revealTile(r, c) {
    if (tiles[r][c] >= gridSize*gridSize) { // checking if tile is number 256+ and removing it because it's index is no longer required because its being revealed and needs to appear empty
        tableTileValue[r*gridSize+c].innerHTML = " "
    }
    fronts[r*gridSize+c].style.visibility = "hidden"
    if (tiles[r][c] >= gridSize*gridSize || tiles[r][c] < 9) { // checking if tile is safe, then play dig sound
        // plays dig sound for 0.5 seconds then pauses and resets audio currentTime position to 0 seconds
        digSound.play()
        await sleep(500)
        digSound.pause() 
        digSound.currentTime = 0
    }
}

// checks if given value is in given array
function checkInclude(array, value) {
    for (let i=0; i<array.length; i++) {
        if (String(array[i]) == String(value)) {
            return true
        }
    }
    return false
}

function stickyReveal(r, c) {
    let tilesToCheck = surround(r, c)[0] // will contain all empty tiles that need to be checked for more empty tiles and revealed
    let numberedBorderPos = surround(r, c)[1] // will contain all numbered tiles to be revealed for the border of sticky reveal
    let revealed = [] // will store positions of all revealed tiles
    revealTile(r, c) // reveal clicked tile
    revealed.push([r, c]) // adding revealed clicked tile
    while (tilesToCheck.length > 0) { // will continue until there are no more tiles to check
        for (let i=0; i<tilesToCheck.length; i++) { // goes through current array of tiles to check (i say current because positions wil be added and removed as tiles are added and revealed respectively)
            // takes current row and column position of current tile from tilesToCheck
            let currentR = tilesToCheck[i][0] 
            let currentC = tilesToCheck[i][1]

            
            if (checkInclude(revealed, [currentR, currentC]) == false && checkInclude(tilesToCheck, [currentR, currentC]) == true) { // making sure current tile position isnt already revealed and is a tile that needs to be checked
                revealTile(currentR, currentC) // reveal current tile
                revealed.push([currentR, currentC]) // adding revealed clicked tile
                tilesToCheck.splice(i, 1) // removing that position from tiles to check because its already been checked

                let emptyTempPos = surround(currentR, currentC)[0] // collecting surrounding positions of empty tiles around current tile
                let numberedTempPos = surround(currentR, currentC)[1] // collecting surrounding positions of numbered tiles around current tile

                // going through temporary list of surrounding positions of empty tiles around current tile and adding it to tiles to be checked if its not already there
                for (let n=0; n<emptyTempPos.length; n++) {
                    if (checkInclude(revealed, emptyTempPos[n]) == false && checkInclude(tilesToCheck, emptyTempPos[n]) == false ) {
                        tilesToCheck.push(emptyTempPos[n])
                        emptyTempPos.splice(n, 1)
                    }
                }

                // going through temporary list of surrounding positions of numbered tiles around current tile and adding it to numbered border tiles if its not already there
                for (let n=0; n<numberedTempPos.length; n++) {
                    if (checkInclude(numberedBorderPos, numberedTempPos[n]) == false) {
                        numberedBorderPos.push(numberedTempPos[n])
                    }
                }

            }
        }
    }
    
    // revealing all the numbered tiles for the border + any other numbered tiles within the revealed tiles space
    for (let n=0; n<numberedBorderPos.length; n++) {
        revealTile(numberedBorderPos[n][0], numberedBorderPos[n][1])
    }
}

// calculates row index for 2d array based on index of tile from 1d entire tables array
function rowCalculate(n) {
 return Number(String(n/gridSize).split(".")[0])
}

function win() {
    winSound.play() // plays win sound
    clearInterval(interval) // stops setInterval on timer function, basically stops the timer
    // reset timer
    document.getElementById("secs").innerHTML = "00"
    document.getElementById("mins").innerHTML = "0"
    let t = `${minuteCount}:` // storing first half of time, the minutes
    // seconds less than 10 need 0 in front of digit
    if (secondCount < 10) {
        t+=`0${secondCount}`
    } else {
        t+=String(secondCount)
    }
    document.getElementById("win").style.visibility = "visible" // making win card visible
    document.getElementById("time").innerHTML = t // giving time user took to finish game
    document.getElementById("playAgain1").addEventListener("click", function(){ // play again button will reload page to restart
        location.reload()
    })
}

async function lose() {
    //technically works but then you cant see where all the bombs were..
    // for (let i=0; i<fronts.length; i++) {
    //     let newTile = fronts[i].cloneNode(true)
    //     fronts[i].parentNode.replaceChild(newTile, fronts[i])
    //     fronts[i] = newTile
    // }

    // plays explode sound for 0.5 seconds then pauses and resets audio currentTime position to 0 seconds
    explodeSound.play()
    await sleep(500)
    explodeSound.pause()
    explodeSound.currentTime = 0

    clearInterval(interval) // stops setInterval on timer function, basically stops the timer
    // reset timer
    document.getElementById("secs").innerHTML = "00"
    document.getElementById("mins").innerHTML = "0"
    // revealing all the other mines in the field to show user where they were
    for (let i=0; i<gridSize*gridSize; i++) {
        let row = rowCalculate(i)
        let column = cells[i].cellIndex
        if (tiles[row][column] == "m") {
            revealTile(row, column)
        }
    }

    document.getElementById("lose").style.visibility = "visible" // making win card visible
    document.getElementById("playAgain2").addEventListener("click", function(){ // play again button will reload page to restart
        location.reload()
    })
}

function main() {
    document.getElementById("howto").style.display = "none"

    let difficulty = document.getElementById('difficulty').value
    // creating minefield size + # of mines based on difficulty dropdown
    if (difficulty === "Easy") {
        mineNum = 10
        setTable(9)
    } else if (difficulty === "Medium") {
        mineNum = 40
        setTable(16)
    } else if (difficulty === "Hard") {
        mineNum = 99
        setTable(22)
    }
    customize()

    // adds addEventListener to all green square front part of tile
    for (let i = 0; i < gridSize*gridSize; i++) {

        fronts[i].addEventListener("click", function handleTileClick(){
            tileClicks++
            let row = rowCalculate(i)
            let column = cells[i].cellIndex
            if (tileClicks == 1) { // if its user's first click, start timer
                interval = setInterval(timer, 1000) // storing special setInterval id to use to stop timer later
            }

            let chosenTileValue = tableTileValue[i].innerHTML // storing value of user's chosen tile
            console.log(chosenTileValue)

            if (tiles[row][column] == "m") { // checking if clicked tile is a mine
                cells[i].style.backgroundColor = "#c72d1c" // change "exploded" mine to red background color
                revealTile(row, column)
                lose()
            }

            if (chosenTileValue >= gridSize*gridSize) { // checking if tile is "empty" (empty as in it has no mines around it, but it checks for 256+ values for indexing/positioning purposes)
                stickyReveal(row, column)
                console.log(`this is an empty tile`)
            }

            if (chosenTileValue < 9) { // reveals clicked tile only if its numbered 1-8
                revealTile(row, column)
                console.log(`this is a numbered tile`)
            }

            let revealedTilesCount = 0 // resetting revealed tile count variable
            // going through all tiles and checking if its revealed
            for (let k=0; k<gridSize*gridSize; k++) {
                if (fronts[k].style.visibility == "hidden") {
                    revealedTilesCount++
                }
            }
            if (revealedTilesCount == ((gridSize*gridSize)-mineNum)) { // if user revealed 216 tiles without losing they win (snce its 256 tilesa dn mineNum are mines = 256-mineNum = 216 = tiles user has to reveal to win)
                win()
            }

        })
      }
}

// code

// setTable(gridSize)
// customize()

bombImage.addEventListener("change", function(e){
    const file = e.target.files[0]
    console.log(e.target.files)
    if (file) {
        const reader = new FileReader()

        reader.onload = function(e) {
            bombSRC = e.target.result
        }

        reader.readAsDataURL(file)
    } else {
        bombSRC = ''
    }
    console.log(bombSRC)
})

tileImage.addEventListener("change", function(e){
    const file = e.target.files[0]
    console.log(e.target.files)
    if (file) {
        const reader = new FileReader()

        reader.onload = function(e) {
            tileSRC = e.target.result
        }

        reader.readAsDataURL(file)
    } else {
        tileSRC = ''
    }
    console.log(tileSRC)
})

function setImages() {
    let bombs = document.querySelectorAll(".bomb")
    if (bombSRC.length > 0) {
        for (let i=0; i<bombs.length; i++) {
        bombs[i].src = bombSRC
    }
    }

    let tiles = document.querySelectorAll(".front")
    if (tileSRC.length > 0) {
        for (let i=0; i<tiles.length; i++) {
        tiles[i].src = tileSRC
    }
    }
}