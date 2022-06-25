const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576
var picked_id
const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, 70 + i))
}

const charactersMap = []
for (let i = 0; i < charactersMapData.length; i += 70) {
  charactersMap.push(charactersMapData.slice(i, 70 + i))
}
console.log(charactersMap)

const boundaries = []
const offset = {
  x: -735,
  y: -650
}

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
  })
})

const characters = []
const villagerImg = new Image()
villagerImg.src = './img/villager/Idle.png'

const oldManImg = new Image()
oldManImg.src = './img/oldMan/Idle.png'

charactersMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // 1026 === villager
    if (symbol === 1026) {
      characters.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          image: villagerImg,
          frames: {
            max: 4,
            hold: 60
          },
          scale: 3,
          animate: true
        })
      )
    }
    // 1031 === oldMan
    else if (symbol === 1031) {
      characters.push(
        new Sprite({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          },
          image: oldManImg,
          frames: {
            max: 4,
            hold: 60
          },
          scale: 3
        })
      )
    }

    if (symbol !== 0) {
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
          }
        })
      )
    }
  })
})

const image = new Image()
image.src = './img/Pellet Town.png'

const foregroundImage = new Image()
foregroundImage.src = './img/foregroundObjects.png'

const playerDownImage = new Image()
playerDownImage.src = './img/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './img/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './img/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './img/playerRight.png'

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2,
    y: canvas.height / 2 - 68 / 2
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage
  }
})

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: image
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  }
}

const movables = [
  background,
  ...boundaries,
  foreground,
  ...battleZones,
  ...characters
]
const renderables = [
  background,
  ...boundaries,
  ...battleZones,
  ...characters,
  player,
  foreground
]

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  )
}

const battle = {
  initiated: false
}

function animate() {
  const animationId = window.requestAnimationFrame(animate)
  renderables.forEach((renderable) => {
    renderable.draw()
  })

  let moving = true
  player.animate = false

  if (battle.initiated) return

  // activate a battle
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y))
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        // deactivate current animation loop
        window.cancelAnimationFrame(animationId)
        document.querySelector('#pickMonsters').style.display = 'block'
        content = ''
        if(!user){
          return
        }
        if(!monsters){
          content = "No NFT poke monster found"
          document.querySelector("#container_pick").innerHTML = content
        }
        monsters.forEach(monster => {
          content += `
                <div class="card mx-2" style="width: 18rem;">
                    <img class="card-img-top" src="${monster.avatar}" alt="Card image cap" style="max-height: 150px; width: auto; object-fit:scale-down">
                        <div class="card-body">
                            <h5 class="card-title">${monster.name}</h5>
                            <p class="card-text" id="energy${monster.id}">Energy: ${monster.energy}</p>
                            <button id="${monster.id}" style="max-width: 224px">Pick to battle</button>
                            <button id="recover${monster.id}" style="font-size: 16px; max-width: 224px; margin-top: 20px"> pay 0.1 pok to recover full enegy </button>
                        </div>
                </div> 
             `
        })
        document.querySelector("#container_pick").innerHTML = content
        document.querySelectorAll('button').forEach((button) => {
          button.addEventListener('click', async (e) => {
            picked_id = e.currentTarget.id
            monster = monsters.find(e => e.id == picked_id)
            if(!monster && e.currentTarget.id.substring(0,"recover".length) === "recover"){
              monster = monsters.find(element => element.id == e.currentTarget.id.substring("recover".length))
              if(monster.energy>=3){
                return;
              }
              const transactionParameters = {
                to: '0x1c136599D594F2dB66BA5392eba26588FEC15EB5', // Required except during contract publications.
                from: user.id,
                data: await fetch("http://localhost:9000/contract_data?amount=1000000000").then(response=>{
                  return response.text();
                })
              };

              const tx = await ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
              }).then(data => {
                console.log(data)
                return "Ok"
              }).catch(err=>{
                console.log(err)
                alert("Fail to confirm transaction");
              });

              monster.energy = 3
              document.querySelector("#energy" + monster.id).innerHTML = "Energy:" + monster.energy
              fetch("http://localhost:3000/energy/" +  monster.e_id, {
                method: "PUT",
                headers: {
                  'Content-Type': 'application/json'
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                mode: 'cors',
                credentials: 'same-origin',
                body: JSON.stringify({
                  player_id: user.id,
                  monster_id: monster.id,
                  energy: monster.energy
                })
              })
              user.eth -= 0.05
              fetch("http://localhost:3000/players/" +  user.id, {
                method: "PUT",
                headers: {
                  'Content-Type': 'application/json'
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                mode: 'cors',
                credentials: 'same-origin',
                body: JSON.stringify(user)
              });
              return;
            }
            if(monster.energy === 0){
              alert("Monster is tired, it needs to recover")
              return;
            }
            monster.energy -= 1
            fetch("http://localhost:3000/energy/" +  monster.e_id, {
              method: "PUT",
              headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
              mode: 'cors',
              credentials: 'same-origin',
              body: JSON.stringify({
                player_id: user.id,
                monster_id: monster.id,
                energy: monster.energy
              })
            })
            document.querySelector('#pickMonsters').style.display = 'none'
            audio.Map.stop()
            audio.initBattle.play()
            audio.battle.play()

            battle.initiated = true
            gsap.to('#overlappingDiv', {
              opacity: 1,
              repeat: 3,
              yoyo: true,
              duration: 0.4,
              onComplete() {
                gsap.to('#overlappingDiv', {
                  opacity: 1,
                  duration: 0.4,
                  onComplete() {
                    // activate a new animation loop
                    initBattle()
                    animateBattle()
                    gsap.to('#overlappingDiv', {
                      opacity: 0,
                      duration: 0.4
                    })
                  }
                })
              }
            })
          });
        });
        break
      }
    }
  }

  // moving
  if (keys.w.pressed && lastKey === 'w') {
    player.animate = true
    player.image = player.sprites.up

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y += 3
      })
  } else if (keys.a.pressed && lastKey === 'a') {
    player.animate = true
    player.image = player.sprites.left

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x += 3
      })
  } else if (keys.s.pressed && lastKey === 's') {
    player.animate = true
    player.image = player.sprites.down

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.y -= 3
      })
  } else if (keys.d.pressed && lastKey === 'd') {
    player.animate = true
    player.image = player.sprites.right

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y
            }
          }
        })
      ) {
        moving = false
        break
      }
    }

    if (moving)
      movables.forEach((movable) => {
        movable.position.x -= 3
      })
  }
}
// animate()

let lastKey = ''
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break

    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break

    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
  }
})

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})

let clicked = false
addEventListener('click', () => {
  if (!clicked) {
    audio.Map.play()
    clicked = true
  }
})
