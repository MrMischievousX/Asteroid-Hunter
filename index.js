// Declaration Dom Elements
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gameStart();
});

// Player Class
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  update() {
    this.draw();
  }
}

// Player Enemies
class Enemies {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
  }
}

// Player Projectile
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = ctx.strokeStyle = `hsl(${Math.random() * 360},50%,50%)`;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
  }
}

// Player Particles
const friction = 0.989;
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    this.alpha -= 0.01;
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
  }
}

// Game Objects
const player = new Player(innerWidth / 2, innerHeight / 2, 20, "white");
const projectile = [];
const enemies = [];
const particles = [];
let animationID;
const scoreTxt = document.querySelector("#score");
const modal = document.getElementById("scoreModal");
const score = document.querySelector("#scoreBtn");
const btn = document.querySelector("#btn");
const background = document.querySelector("#background");
const fire = document.querySelector("#fire");
const blast = document.querySelector("#blast");
const smallblast = document.querySelector("#smallblast");
let scoreValue = 0;
let speed = 0;

window.addEventListener("click", function (event) {
  fire.play();
  const angle = Math.atan2(event.y - innerHeight / 2, event.x - innerWidth / 2);
  projectile.push(
    new Projectile(innerWidth / 2, innerHeight / 2, 6, "white", {
      x: Math.cos(angle) * 7,
      y: Math.sin(angle) * 7,
    })
  );
});

btn.addEventListener("click", function () {
  window.location.reload();
});

function spawnEnemies() {
  setInterval(() => {
    let radius = Math.random() * 25 + 5;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const angle = Math.atan2(innerHeight / 2 - y, innerWidth / 2 - x);
    let velocity = {
      x: Math.cos(angle) * (1.5 + speed),
      y: Math.sin(angle) * (1.5 + speed),
    };
    enemies.push(
      new Enemies(x, y, radius, `hsl(${Math.random() * 360},50%,50%)`, velocity)
    );
  }, 1000);
}

function animate() {
  animationID = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();
  particles.forEach((particle, index) => {
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(index, 1);
      }, 10);
    } else particle.update();
  });
  projectile.forEach((projectileX, index) => {
    projectileX.update();
    if (
      projectileX.x + projectileX.radius < 0 ||
      projectileX.x - projectileX.radius > innerWidth ||
      projectileX.y + projectileX.radius < 0 ||
      projectileX.y - projectileX.radius > innerHeight
    ) {
      setTimeout(() => {
        projectile.splice(index, 1);
      }, 0);
    }
  });
  enemies.forEach((enemy, index) => {
    enemy.update();
    if (
      Math.hypot(enemy.x - player.x, enemy.y - player.y) -
        player.radius -
        enemy.radius <
      1
    ) {
      cancelAnimationFrame(animationID);
      score.innerHTML = scoreValue;
      modal.style.display = "flex";
    }
    projectile.forEach((projectileX, indexProjectile) => {
      if (
        Math.hypot(projectileX.x - enemy.x, projectileX.y - enemy.y) -
          projectileX.radius -
          enemy.radius <
        1
      ) {
        for (let i = 0; i < enemy.radius / 2 + 5; i++) {
          particles.push(
            new Particle(
              projectileX.x,
              projectileX.y,
              Math.random() * 3,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 10),
                y: (Math.random() - 0.5) * (Math.random() * 10),
              }
            )
          );
        }
        if (enemy.radius - 10 > 5) {
          smallblast.play();
          scoreValue += 100;
          scoreTxt.innerHTML = scoreValue;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            blast.play();
            scoreValue += 250;
            if(scoreValue>20000)
            {speed=scoreValue/20000;}
            scoreTxt.innerHTML = scoreValue;
            projectile.splice(indexProjectile, 1);
          }, 0);
        } else {
          setTimeout(() => {
            enemies.splice(index, 1);
            projectile.splice(indexProjectile, 1);
          }, 0);
        }
      }
    });
  });
}

const startGame = document.querySelector("#startboard");
const start = document.querySelector("#start");

start.addEventListener("click", gameStart);

function gameStart() {
  animate();
  spawnEnemies();
  startGame.style.display = "none";
  background.loop = true;
  background.play();
}
