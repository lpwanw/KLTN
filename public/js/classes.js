class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max
      this.height = this.image.height
    }
    this.image.src = image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1

    this.rotation = rotation
    this.scale = scale
  }

  draw() {
    c.save()
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    c.rotate(this.rotation)
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    c.globalAlpha = this.opacity

    const crop = {
      position: {
        x: this.frames.val * this.width,
        y: 0
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    )

    c.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}

class Monster extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 4, hold: 30 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks,
      mana
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    })
    this.health = 100
    this.isEnemy = isEnemy
    this.name = name
    this.attacks = attacks
    this.mana = mana
    this.block = 0
  }

  faint() {
    document.querySelector('#dialogueBox').innerHTML =
        this.name + ' fainted!' + (this.isEnemy ? "You winnn got 0.5 POK " : "You suck!!")

    if(this.isEnemy){
      fetch("http://localhost:9000/sent/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        mode: 'cors',
        credentials: 'same-origin',
        body: JSON.stringify({
          "to": user.id,
          "value": 0.5
        })
      }).then();
      document.querySelector('#runningTx').style.display = 'block'
      setTimeout(document.querySelector('#runningTx').style.display = 'none',10000 /* 2 seconds */)
    }
    gsap.to(this.position, {
      y: this.position.y + 20
    })
    gsap.to(this, {
      opacity: 0
    })
    audio.battle.stop()
    audio.victory.play()
  }

  attack({ attack, recipient, renderedSprites}) {
    let healthBar = '#enemyHealthBar'
    let manaBar = '#enemyManaBar'
    let ortherManaBar = '#playerManaBar'
    if (this.isEnemy){
      healthBar = '#playerHealthBar'
      manaBar = '#playerManaBar'
      ortherManaBar = '#enemyManaBar'
    }
    let rotation = 1
    if (this.isEnemy) rotation = -2.2
    let dmg
    let mana
    switch (attack.name) {
      case 'Fireball':
        if(this.mana < 100) {
          document.querySelector('#dialogueBox').style.display = 'block'
          document.querySelector('#dialogueBox').innerHTML =
              this.name + ' dont have mana to use ' + attack.name
          return 1
        }
        dmg = recipient.block === 2 ? 0 : attack.damage
        mana = dmg === 0 ? attack.damage*0.7 : attack.damage*1.5
        recipient.health -= dmg
        recipient.mana += mana
        if(recipient.mana > 100) recipient.mana = 100
          this. mana = 0
        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML =
            this.name + ' used ' + attack.name + ', ' + recipient.name + ' take ' + attack.damage + ' and gain ' + attack.damage*2 + ' mana'
        audio.initFireball.play()
        const fireballImage = new Image()
        fireballImage.src = './img/fireball.png'
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            // Enemy actually gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(manaBar, {
              width: recipient.mana + '%'
            })

            gsap.to(ortherManaBar, {
              width: this.mana + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })

        break
      case 'Tackle':
        dmg = recipient.block !== 0 ? attack.damage*0.5 : attack.damage
        mana = dmg === 0 ? attack.damage : attack.damage*2
        recipient.health -= dmg
        recipient.mana += mana
        if(recipient.mana > 100) recipient.mana = 100
        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML =
            this.name + ' used ' + attack.name + ', ' + recipient.name + ' take ' + dmg + ' damage and gain ' + mana + ' mana'
        const tl = gsap.timeline()

        let movementDistance = 20
        if (this.isEnemy) movementDistance = -20

        tl.to(this.position, {
          x: this.position.x - movementDistance
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              // Enemy actually gets hit
              audio.tackleHit.play()
              gsap.to(healthBar, {
                width: recipient.health + '%'
              })

              gsap.to(manaBar, {
                width: recipient.mana + '%'
              })

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              })

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08
              })
            }
          })
          .to(this.position, {
            x: this.position.x
          })
        recipient.block = 0
        break
      case 'Block':
        if(this.mana < 25){
          document.querySelector('#dialogueBox').style.display = 'block'
          document.querySelector('#dialogueBox').innerHTML =
              this.name + ' dont have mana to use ' + attack.name
          return 1
        }
        this.block = 1
        this.mana -= 25
        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML =
            this.name + ' used ' + attack.name
        gsap.to(ortherManaBar, {
          width: this.mana + '%'
        })

        break
      case 'FireShield':
        if(this.mana < 50){
          document.querySelector('#dialogueBox').style.display = 'block'
          document.querySelector('#dialogueBox').innerHTML =
              this.name + ' dont have mana to use ' + attack.name
          return 1
        }

        this.block = 2
        this.mana -= 50
        gsap.to(ortherManaBar, {
          width: this.mana + '%'
        })
        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML =
            this.name + ' used ' + attack.name
        break
    }

    return 0
  }
}

class Boundary {
  static width = 48
  static height = 48
  constructor({ position }) {
    this.position = position
    this.width = 48
    this.height = 48
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}
class Shield extends Sprite{
  constructor({
                position,
                velocity,
                image,
                frames = { max: 1, hold: 10 },
                sprites,
                animate = false,
                rotation = 0
              }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    })
  }
}
