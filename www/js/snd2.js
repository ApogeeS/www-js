let sliderWidth = 250;
let sliderHeight = 20;
let sliderX = 50;
let sliderY = 50;
let sliderColor = '#3E6E00';
let sliderHandleColor = '#FFFFFF';
let handleSize = 20;
let handleColor = '#7AD900';
let handleHoverColor = '#CCCCCC';
let sliding = false;
let sliderValue = 50;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);

  // Slider track
  fill(sliderColor);
  rect(sliderX, sliderY, sliderWidth, sliderHeight);

  // Slider handle
  fill(handleColor);
  if (mouseX >= sliderX && mouseX <= sliderX + sliderWidth &&
      mouseY >= sliderY - handleSize / 2 && mouseY <= sliderY + sliderHeight + handleSize / 2) {
    fill(handleHoverColor);
  }
  let handleX = map(sliderValue, 0, 100, sliderX, sliderX + sliderWidth);
  let handleY = sliderY + sliderHeight / 2 - handleSize / 2; // Center vertically
  let handleRadius = handleSize / 2;
  rect(handleX, handleY, handleSize / 4, handleSize);
}

function mousePressed() {
  if (mouseX >= sliderX && mouseX <= sliderX + sliderWidth &&
      mouseY >= sliderY - handleSize / 2 && mouseY <= sliderY + sliderHeight + handleSize / 2) {
    sliding = true;
  }
}

function mouseReleased() {
  sliding = false;
}

function mouseDragged() {
  if (sliding) {
    let newValue = map(mouseX, sliderX, sliderX + sliderWidth, 0, 100);
    sliderValue = constrain(newValue, 0, 100);
  }
}
