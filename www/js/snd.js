const patchExportURL = "https://cdn.jsdelivr.net/gh/apogees/www-js@latest/www/export/Soydan.export.json";

let note = undefined;
let mouseDownX = 0;
let mouseDownY = 0;
let device, context;

let paths = [];
let painting = false;
let next = 0;
let current;
let previous;

async function setupRNBO() {
    [device, context] = await createRNBODevice(patchExportURL);
}

setupRNBO();

function setup() {
  createCanvas(windowWidth, windowHeight);
  current = createVector(0,0);
  previous = createVector(0,0);
}

function draw() {
  background(255);

  if (millis() > next && painting) {
    current.x = mouseX;
    current.y = mouseY;

    let force = p5.Vector.sub(current, previous);
    force.mult(0.05);

    paths[paths.length - 1].add(current, force);
    next = millis() + random(100);
    previous.x = current.x;
    previous.y = current.y;
  }

  for( let i = 0; i < paths.length; i++) {
    paths[i].update();
    paths[i].display();
  }

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

function mousePressed() {
    mouseDownX = mouseX;
    mouseDownY = mouseY;
    previous.x = mouseX;
    previous.y = mouseY;
    next = 0;
    painting = true;
    paths.push(new Path());

    if (device) {
        context.resume();
        note = map(mouseDownX, 0, width, 40, 80)
        noteOn(device, context, note, 100);
    }
}

function mouseReleased() {
  painting = false;
    if (device) {
        noteOff(device, context, note);
    }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

class Path {
  constructor() {
    this.particles = [];
    this.hue = random(100);
  }

  add(position, force) {
    this.particles.push(new Particle(position, force, this.hue));
  }

  update() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    }
  }

  display() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (this.particles[i].lifespan <= 0) {
        this.particles.splice(i, 1);
      } else {
        this.particles[i].display(this.particles[i+1]);
      }
    }
  }
}

class Particle {
  constructor(position, force, hue) {
    this.position = createVector(position.x, position.y);
    this.velocity = createVector(force.x, force.y);
    this.drag = 0.95;
    this.lifespan = 255;
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.mult(this.drag);
    this.lifespan--;
  }

  display(other) {
    stroke(0, this.lifespan);
    fill(0, this.lifespan/2);
    ellipse(this.position.x, this.position.y, 16, 16);
    if (other) {
      line(this.position.x, this.position.y, other.position.x, other.position.y);
    }
  }
}
