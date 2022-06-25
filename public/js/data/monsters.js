const cmonsters = {
  Emby: {
    position: {
      x: 800,
      y: 100
    },
    image: {
      src: './img/embySprite.png'
    },
    frames: {
      max: 4,
      hold: 30
    },
    isEnemy: true,
    animate: true,
    name: 'Emby',
    attacks: [attacks.Tackle, attacks.Fireball, attacks.Block, attacks.FireShield],
    mana: 20,
    block: 0
  },
  Draggle: {
    position: {
      x: 800,
      y: 100
    },
    image: {
      src: './img/draggleSprite.png'
    },
    frames: {
      max: 4,
      hold: 30
    },
    animate: true,
    isEnemy: true,
    name: 'Draggle',
    attacks: [attacks.Tackle, attacks.Fireball],
    mana: 20,
    block: 0
  }
}
