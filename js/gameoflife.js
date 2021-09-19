const { thisExpression } = require("jscodeshift");

function seed() {
  return Array.from(arguments);
}

function same([x, y], [j, k]) {
  if (x === j && y === k) {
    return true;
  }
  return false;
}

// The game state to search for `cell` is passed as the `this` value of the function.
function contains(cell) {
  for (value of this) {
    if (same(cell, value)) {
      return true;
    }
  }
  return false;
}

const printCell = (cell, state) => {
  if (contains.call(state, cell)) {
    return '\u25A3';
  }
  return '\u25A2';
};

const corners = (state = []) => {
  if (state.length === 0) {
    return { topRight: [0, 0], bottomLeft: [0, 0] }
  } else {
    let xVals = [];
    let yVals = [];
    for (v of state) {
      xVals.push(v[0]);
      yVals.push(v[1]);
    }
    return { 
      topRight: [Math.max(...xVals), Math.max(...yVals)], 
      bottomLeft: [Math.min(...xVals), Math.min(...yVals)] 
    }
  }
};

const printCells = (state) => {
  let gameString = "";
  if (state.length === 0){return gameString}
  let xStart = corners(state).bottomLeft[0];
  let yStart = corners(state).topRight[1];
  let width = corners(state).topRight[0] - xStart;
  let height = yStart - corners(state).bottomLeft[1];
  for (let yIndex = 0; yIndex <= height; yIndex++){
    for (let xIndex = 0; xIndex <= width; xIndex++){
      gameString += `${printCell([xStart + xIndex, yStart - yIndex], state)} `
    }
    gameString += "\n"
  }
  return gameString;
};

const getNeighborsOf = ([x, y]) => {
  return [[x-1,y-1], [x-1,y], [x-1,y+1],
          [x,y-1], [x,y+1],
          [x+1,y-1], [x+1,y], [x+1,y+1] ]
};

const getLivingNeighbors = (cell, state) => { 
  let liveNeighbors = [];
  for (v of getNeighborsOf(cell)){
    if (contains.call(state, v))
    liveNeighbors.push(v);
  }
  return liveNeighbors;
};

const willBeAlive = (cell, state) => {
  if (getLivingNeighbors(cell, state).length === 3){
    return true;
  } else if (getLivingNeighbors(cell, state).length === 2 && contains.call(state, cell)){
    return true;
  } else {
    return false;
  }
};

const calculateNext = (state) => {
  let newGrid = [];
  let xStart = corners(state).bottomLeft[0] - 1;
  let yStart = corners(state).bottomLeft[1] -1;
  let xEnd = corners(state).topRight[0] + 1;
  let yEnd = corners(state).topRight[1] + 1;
  let height = yEnd - yStart;
  let width = xEnd - xStart;
  for (let yIndex = 0; yIndex <= height; yIndex++){
    for (let xIndex = 0; xIndex <= width; xIndex++){
      newGrid.push([xStart + xIndex, yStart + yIndex]);
    }
  }
  let nextState = [];
  for (v of newGrid){
    if (willBeAlive(v, state)){
      nextState.push(v);
    }
  }
  return nextState;
};

const iterate = (state, iterations) => {
  let gameStates = state;
  for (let i = 0; i < iterations; i++){
    state = nextState(state);
    gameStates.push(state);
  }
  return gameStates;
};

const main = (pattern, iterations) => {
  let p = pattern;
  for (v of iterate(startPatterns.p, iterations)){
    console.log(`${printCells(v)}\n`);
  }
};

const startPatterns = {
  rpentomino: [
    [3, 2],
    [2, 3],
    [3, 3],
    [3, 4],
    [4, 4]
  ],
  glider: [
    [-2, -2],
    [-1, -2],
    [-2, -1],
    [-1, -1],
    [1, 1],
    [2, 1],
    [3, 1],
    [3, 2],
    [2, 3]
  ],
  square: [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2]
  ]
};

const [pattern, iterations] = process.argv.slice(2);
const runAsScript = require.main === module;

if (runAsScript) {
  if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
    main(pattern, parseInt(iterations));
  } else {
    console.log("Usage: node js/gameoflife.js rpentomino 50");
  }
}

exports.seed = seed;
exports.same = same;
exports.contains = contains;
exports.getNeighborsOf = getNeighborsOf;
exports.getLivingNeighbors = getLivingNeighbors;
exports.willBeAlive = willBeAlive;
exports.corners = corners;
exports.calculateNext = calculateNext;
exports.printCell = printCell;
exports.printCells = printCells;
exports.startPatterns = startPatterns;
exports.iterate = iterate;
exports.main = main;