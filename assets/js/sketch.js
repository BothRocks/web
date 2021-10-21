//https://math.stackexchange.com/questions/256100/how-can-i-find-the-points-at-which-two-circles-intersect

let t = 0;
let ns = 50;

let r = 60;
let orig1, orig2;
let delta1, delta2;

function preload() {
  geomanist = loadFont("css/fonts/geomanist-book-webfont.ttf");
}

function setup() {
  let cnv = createCanvas(240, 240);
  cnv.parent('canvas-container');

  background("#f9d826");
  textSize(15);
  textAlign(CENTER, CENTER);
  textFont(geomanist);

  orig1 = createVector(width / 2, height / 2);
  orig2 = createVector(width / 2, height / 2);
}

function draw() {
  t += pow(sin(frameCount / 75.0), 6) * 0.04;

  delta1 = addTrig(orig1, 2.5, 3.1);
  delta2 = addTrig(orig1, 2.9, 2);

  background("#f9d826");
  strokeWeight(2);
  stroke("#2f2605");
  fill("#f9d826");

  circle(delta1.x, delta1.y, r * 2);
  circle(delta2.x, delta2.y, r * 2);

  fill("#2f2605");
  noStroke();
  push();
  translate(delta1.x, delta1.y - 5);
  rotate(0);
  text("ESCUELA", 0, 0);
  pop();
  push();
  translate(delta2.x, delta2.y - 5);
  rotate(0);
  text("LABORATORIO", -1, 0);
  pop();

  d = delta1.dist(delta2);

  if (/*d >= r/2 &&*/ d < r * 2) {
    l = d / 2;
    h = sqrt(r * r - l * l);
    i1 = intersection(d, l, h, 1);
    i2 = intersection(d, l, h, -1);

    d1_i1 = p5.Vector.sub(i1, delta1);
    d1_i2 = p5.Vector.sub(i2, delta1);
    d2_i1 = p5.Vector.sub(i1, delta2);
    d2_i2 = p5.Vector.sub(i2, delta2);

    textCoords = p5.Vector.add(i1, i2);
    textCoords.div(2);

    arc(
      delta1.x,
      delta1.y,
      r * 2,
      r * 2,
      d1_i1.heading(),
      d1_i2.heading(),
      OPEN
    );
    arc(
      delta2.x,
      delta2.y,
      r * 2,
      r * 2,
      d2_i2.heading(),
      d2_i1.heading(),
      OPEN
    );
    stroke("#2f2605");
    line(i1.x, i1.y, i2.x, i2.y);

    if (d < 90) {
      push();
      fill("#f9d826");
      noStroke();
      translate(textCoords.x, textCoords.y);
      rotate(0);
      text("Both", 0, -5);
      pop();
    }
  }
}

function addTrig(v, nx, ny) {
  return createVector(v.x, v.y + sin(t * ny) * ns + 10);
}

function intersection(d, l, h, m) {
  return createVector(
    (l * (delta2.x - delta1.x)) / d +
      (m * h * (delta2.y - delta1.y)) / d +
      delta1.x,

    (l * (delta2.y - delta1.y)) / d -
      (m * h * (delta2.x - delta1.x)) / d +
      delta1.y
  );
}
