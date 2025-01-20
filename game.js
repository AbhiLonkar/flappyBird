const birdCanvas = document.getElementById("bird-canvas");
const birdCanvasContext = birdCanvas.getContext("2d");

// Game vars and constraints
let frames = 0;

// Degree to radian conversion
const DEGREE = Math.PI / 180;

// Loading game sounds
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

const audioElements = [SCORE_S, FLAP, SWOOSHING, DIE];
audioElements.forEach((el) => (el.volume = 0.25));

// Managing the game start and over states
const state = {
  current: 0, // Game hasn't started
  getReady: 0, // Game about to start
  game: 1, // User can play the game
  over: 2,
};

// Start button
const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
};

// Controlling the game
birdCanvas.addEventListener("click", function (event) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      SWOOSHING.play();
      break;
    case state.game:
      bird.flap();
      FLAP.play();
      break;
    case state.over:
      let rect = birdCanvas.getBoundingClientRect();
      let clickX = event.clientX - rect.left;
      let clickY = event.clientY - rect.top;
      if (
        clickX >= startBtn.x &&
        clickX <= startBtn.x + startBtn.w &&
        clickY >= startBtn.y &&
        clickY <= startBtn.y + startBtn.h
      ) {
        pipes.reset();
        bird.speedReset();
        score.reset();
        state.current = state.getReady;
      }
      break;
  }
});

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {  // Check for spacebar key press
    switch (state.current) {
      case state.getReady:
        state.current = state.game;
        SWOOSHING.play();
        break;
      case state.game:
        bird.flap();
        FLAP.play();
        break;
      case state.over:
        pipes.reset();
        bird.speedReset();
        score.reset();
        state.current = state.getReady;
        break;
    }
  }
});

// Loading sprite image
const sprite = new Image();
sprite.src = "img/sprite.png";

// Drawing & Setting up the coordinates for the background image
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 226,
  dX: 0, // dx and dy represent the position on the destination canvas
  dY: birdCanvas.height - 226,
  draw: function () {
    birdCanvasContext.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.dX,
      this.dY,
      this.w,
      this.h
    );
    birdCanvasContext.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.dX + this.w,
      this.dY,
      this.w,
      this.h
    );
  },
};

// Drawing & Setting up the coordinates for the foreground image
const fg = {
  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  y: birdCanvas.height - 112,
  dx: 2,
  draw: function () {
    birdCanvasContext.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x,
      this.y,
      this.w,
      this.h
    );

    birdCanvasContext.drawImage(
      sprite,
      this.sX,
      this.sY,
      this.w,
      this.h,
      this.x + this.w,
      this.y,
      this.w,
      this.h
    );
  },

  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  },
};

// Drawing & Setting up the coordinates for the bird image
const bird = {
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 },
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  radius: 12,
  frame: 0,
  gravity: 0.15,
  jump: 4,
  speed: 0,
  rotation: 0,
  draw: function () {
    let bird = this.animation[this.frame];
    birdCanvasContext.save();
    birdCanvasContext.translate(this.x, this.y);
    birdCanvasContext.rotate(this.rotation);
    birdCanvasContext.drawImage(
      sprite,
      bird.sX,
      bird.sY,
      this.w,
      this.h,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h
    );
    birdCanvasContext.restore();
  },
  flap() {
    this.speed = -this.jump;
  },
  update() {
    // If the game is get ready state the birds wing need to flap slowly ie lower period value
    // Else it needs to flap fast
    this.period = state.current == state.getReady ? 10 : 5;
    // We also need to increment frame by 1 each period
    this.frame += frames % this.period == 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;
    if (state.current == state.getReady) {
      this.y = 150;
      this.rotation = 0 * DEGREE;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;

      if (this.y + this.h / 2 >= birdCanvas.height - fg.h) {
        this.y = birdCanvas.height - fg.h - this.h / 2;
        if (state.current == state.game) {
          state.current = state.over;
          DIE.play();
        }
      }
      if (this.speed >= this.jump) {
        this.rotation = 90 * DEGREE;
        this.frame = 1;
      } else {
        this.rotation = -25 * DEGREE;
      }
    }
  },
  speedReset: function () {
    this.speed = 0;
  },
};

// Drawing & Setting up the coordinates for the pipes image
const pipes = {
  position: [],
  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0,
  },
  w: 53,
  h: 400,
  gap: 120,
  maxYPos: -150,
  dx: 2,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      // Top pipe
      birdCanvasContext.drawImage(
        sprite,
        this.top.sX,
        this.top.sY,
        this.w,
        this.h,
        p.x,
        topYPos,
        this.w,
        this.h
      );
      // Bottom pipe
      birdCanvasContext.drawImage(
        sprite,
        this.bottom.sX,
        this.bottom.sY,
        this.w,
        this.h,
        p.x,
        bottomYPos,
        this.w,
        this.h
      );
    }
  },

  update: function () {
    if (state.current !== state.game) {
      return;
    }
    if (frames % 100 == 0) {
      this.position.push({
        x: birdCanvas.width,
        y: this.maxYPos * (Math.random() + 1),
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];

      let bottomPipeYPos = p.y + this.h + this.gap;

      // Collision
      // Top pipe
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > p.y &&
        bird.y - bird.radius < p.y + this.h
      ) {
        state.current = state.over;
        HIT.play();
        HIT.volume = 0.1;
      }
      // bottom pipe
      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + this.w &&
        bird.y + bird.radius > bottomPipeYPos &&
        bird.y - bird.radius < bottomPipeYPos + this.h
      ) {
        state.current = state.over;
        HIT.play();
        HIT.volume = 0.1;
      }

      // Moving pipes to the left
      p.x -= this.dx;

      if (p.x + this.w <= 0) {
        //  If pipes beyond the canvas, we'll delete it from the array
        this.position.shift();
        score.value += 1;
        SCORE_S.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
      }
    }
  },
  reset: function () {
    this.position = [];
  },
};

// Get ready state handling
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: birdCanvas.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    if (state.current == state.getReady) {
      birdCanvasContext.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

// Game over state handling
const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: birdCanvas.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    if (state.current == state.over) {
      birdCanvasContext.drawImage(
        sprite,
        this.sX,
        this.sY,
        this.w,
        this.h,
        this.x,
        this.y,
        this.w,
        this.h
      );
    }
  },
};

const score = {
  best: parseInt(localStorage.getItem("best")) || 0,
  value: 0,
  draw: function () {
    birdCanvasContext.fillStyle = "#000";
    birdCanvasContext.strokeStyle = "#000";
    if (state.current == state.game) {
      birdCanvasContext.lineWidth = 1;
      birdCanvasContext.font = "35px Teko";
      birdCanvasContext.fillText(this.value, birdCanvas.width / 2, 50);
      birdCanvasContext.strokeText(this.value, birdCanvas.width / 2, 50);
    } else if (state.current == state.over) {
      // Score value
      birdCanvasContext.font = "26px Teko";
      birdCanvasContext.fillText(this.value, 225, 186);
      birdCanvasContext.strokeText(this.value, 225, 186);
      birdCanvasContext.fillText(this.best, 225, 228);
      birdCanvasContext.strokeText(this.best, 225, 228);
    }
  },
  reset: function () {
    this.value = 0;
  },
};

function draw() {
  birdCanvasContext.fillStyle = "#70c5ce";
  birdCanvasContext.fillRect(0, 0, birdCanvas.width, birdCanvas.height);
  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}
function update() {
  bird.update();
  fg.update();
  pipes.update();
}
function loop() {
  draw();
  update();
  frames++;
  requestAnimationFrame(loop);
}
loop();
