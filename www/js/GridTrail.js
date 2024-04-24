const patchExportURL = "https://cdn.jsdelivr.net/gh/apogees/www-js@latest/www/export/Soydan.export.json";
const CELL_SIZE = 30;
const COLOR_R = 143;
const COLOR_G = 255;
const COLOR_B = 0;
const STARTING_ALPHA = 200;
const BACKGROUND_COLOR = 0;
const AMT_FADE_PER_FRAME = 15;

let probNeighbor = 0.0;
let colorWithAlpha;
let numRows;
let numCols;
let currentRow = -2;
let currentCol = -2;
let allNeighbors = [];

let note = undefined;
let mouseDownX = 0;
let mouseDownY = 0;
let device, context;

async function setupRNBO() {
    [device, context] = await createRNBODevice(patchExportURL);
}

setupRNBO();

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent("wrapper");
  cnv.style("position", "fixed");
  cnv.style("inset", 0);
  cnv.style("z-index", -1);
  colorWithAlpha = color(COLOR_R, COLOR_G, COLOR_B, STARTING_ALPHA);
  noFill();
  stroke(colorWithAlpha);
  strokeWeight(1);
  numRows = Math.ceil(windowHeight / CELL_SIZE);
  numCols = Math.ceil(windowWidth / CELL_SIZE);
}

function draw() {
  background(BACKGROUND_COLOR);

  let row = floor(mouseY / CELL_SIZE);
  let col = floor(mouseX / CELL_SIZE);

  if (row !== currentRow || col !== currentCol) {
    currentRow = row;
    currentCol = col;
    allNeighbors.push(...getRandomNeighbors(row, col));
  }

  let x = col * CELL_SIZE;
  let y = row * CELL_SIZE;

  stroke(colorWithAlpha);
  rect(x, y, CELL_SIZE, CELL_SIZE);

  for (let neighbor of allNeighbors) {
    let neighborX = neighbor.col * CELL_SIZE;
    let neighborY = neighbor.row * CELL_SIZE;

    neighbor.opacity = max(0, neighbor.opacity - AMT_FADE_PER_FRAME);
    stroke(COLOR_R, COLOR_G, COLOR_B, neighbor.opacity);
    rect(neighborX, neighborY, CELL_SIZE, CELL_SIZE);
  }
  allNeighbors = allNeighbors.filter((neighbor) => neighbor.opacity > 0);

  if (device) {
        const mouseDelta = Math.abs(mouseX - mouseDownX);
        const mouseDeltaNormalized = map(mouseDelta, 0, width / 2, 0, 1);
        const mouseDeltaY = Math.abs(mouseY - mouseDownY);
        const mouseDeltaNormalizedY = map(mouseDeltaY, 0, height / 2, 0, 1);

        const tremoloDepth = device.parametersById.get("poly/trem/depth");
        tremoloDepth.normalizedValue = mouseDeltaNormalized;

        const vibratoDepth = device.parametersById.get("poly/vibr/depth");
        vibratoDepth.normalizedValue = mouseDeltaNormalizedY;

        const tremoloRate = device.parametersById.get("poly/trem/rate");
        tremoloRate.normalizedValue = mouseDeltaNormalized;

        const vibratoRate = device.parametersById.get("poly/vibr/rate");
        vibratoRate.normalizedValue = mouseDeltaNormalizedY;

        const spread = device.parametersById.get("spread");
        spread.normalizedValue = mouseDeltaNormalized;

        const cutoff = device.parametersById.get("cutoff");
        cutoff.normalizedValue = mouseDeltaNormalizedY;

        const glide = device.parametersById.get("glide");
        glide.normalizedValue = 0.2;
    }
}

function getRandomNeighbors(row, col) {
  let neighbors = [];

  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      let neighborRow = row + dRow;
      let neighborCol = col + dCol;

      let isCurrentCell = dRow === 0 && dCol === 0;

      let isInBounds =
        neighborRow >= 0 &&
        neighborRow < numRows &&
        neighborCol >= 0 &&
        neighborCol < numCols;

      if (!isCurrentCell && isInBounds && Math.random() < probNeighbor) {
        neighbors.push({
          row: neighborRow,
          col: neighborCol,
          opacity: 255,
        });
      }
    }
  }
  return neighbors;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  numRows = Math.ceil(windowHeight / CELL_SIZE);
  numCols = Math.ceil(windowWidth / CELL_SIZE);
}

function mousePressed() {
  probNeighbor = 0.5;
  mouseDownX = mouseX;
  mouseDownY = mouseY;

  if (device) {
      context.resume();
      note = map(mouseDownX, 0, width, 40, 80)
      noteOn(device, context, note, 100);
  }
}

function mouseReleased() {
  probNeighbor = 0.0;

  if (device) {
      noteOff(device, context, note);
  }
}
