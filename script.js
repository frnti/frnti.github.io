window.addEventListener("load", function() {
  var sentences = [
    "Как по-английски “самолёт”?",
    "Как по-английски “летать”?",
    "Как по-английски “путешествие”?",
    "Когда кто-то опоздал на свой “flight”, то он опоздал на свой...?",
    "Какое слово лишнее?",
    "Какое слово не подходит к остальным?",
    "Какова прошедшая форма глагола to fly?",
    "Самолёт летит на высоте eleven thousand metres. Это сколько?",
    "Все рейсы в воскресенье отменили. То есть когда?",
    "Тебе нужно найти на билете на самолёт выход на посадку. Какое слово ты будешь искать?",
    "Какой документ обязательно иметь взрослым для путешествий?",
    "Что нужно купить для путешествия в другой город или страну?"
  ]
  var words = [
    ["Airplane", "Bike", "Car", "Bus"],
    ["Fly", "Run", "Go", "Come"],
    ["Trip", "Walk", "March", "Race"],
    ["Рейс", "Праздник", "Утренник", "Поезд"],
    ["Brother", "Sky", "Clouds", "Stars"],
    ["Eight", "First", "Second", "Fourth"],
    ["Flew", "Flying", "Fly", "Fleet"],
    ["11000 метров", "11 метров", "1000 метров", "3 километра"],
    ["Sunday", "Saturday", "Wednesday", "Monday"],
    ["Gate", "Exit", "Way out", "Entrance"],
    ["Passport", "Diary", "Licence", "Photo"],
    ["Tickets", "Umbrella", "Sandwich", "Airplane"]
  ]
  var level = 0
  var score = 0

  var Q = (window.Q = Quintus({
    audioSupported: ["wav", "mp3", "ogg"]
  })
    .include("Sprites, Scenes, Input, 2D, Anim, Touch, UI, Audio")
    .setup("myGame")
    .controls()
    .touch()
    .enableSound())

  var SPRITE_BOX = 1

  function shuffle(a, b) {
    var j, x, y, i
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      x = a[i]
      y = b[i]
      a[i] = a[j]
      b[i] = b[j]
      a[j] = x
      b[j] = y
    }
    return [a, b]
  }

  shuffle(words, sentences)
  //console.log(ab[0]);
  //sentences = ab[1];

  Q.gravityY = 0

  Q.Sprite.extend("Player", {
    init: function(p) {
      this._super(p, {
        sheet: "player",
        sprite: "player",
        collisionMask: SPRITE_BOX,
        x: 40,
        y: 355,
        scale: 0.7,
        standingPoints: [[0, -10], [0, -60], [23, -60], [23, -10]],
        //duckingPoints : [ [ -16, 44], [ -23, 35 ], [-23,-10], [23,-10], [23, 35 ], [ 16, 44 ]],
        speedx: 1,
        speedy: 4,
        jump: -700,
        lives: 3
      })

      this.p.points = this.p.standingPoints

      this.add("2d, animation")
    },

    step: function(dt) {
      //this.p.x += this.p.speedx;

      if (this.p.y > 500) {
        this.p.y = 500
      } else if (this.p.y < 200) {
        this.p.y = 200
      }

      if (this.p.x > 500) {
        this.p.x = 500
      } else if (this.p.x < 10) {
        this.p.x = 10
      }

      if (Q.inputs["up"]) {
        this.p.y -= this.p.speedy
      }

      if (Q.inputs["left"]) {
        this.p.x -= this.p.speedy
      }

      if (Q.inputs["right"]) {
        this.p.x += this.p.speedy
      }

      if (Q.inputs["down"]) {
        this.p.y += this.p.speedy
      }

      this.play("swim")
      this.stage.viewport.centerOn(40 + 200, 300)
    }
  })

  Q.Sprite.extend("Fish", {
    init: function(p) {
      var levels = [440, 350, 250, 160]

      var player = Q("Player").first()
      this._super(p, {
        x: player.p.x + Q.width + 50,
        y: levels[Math.floor(Math.random() * 4)],
        vx: -100 + 0 * Math.random(),
        w: 100,
        h: 50,
        word: "word",
        pic: 1 + Math.floor(2 * Math.random())
      })

      this.on("hit")
    },

    draw: function(ctx) {
      var drawing = new Image()
      drawing.src = "images/fish" + this.p.pic + ".png"

      ctx.font = "15px Arial"
      var base_w = Q.ctx.measureText("produce").width
      var text_w = Q.ctx.measureText(this.p.word).width
      var size = text_w + 60 + 100
      ctx.drawImage(
        drawing,
        -20,
        0,
        size,
        (size * drawing.height) / drawing.width
      )
      ctx.fillStyle = this.p.color
      ctx.font = "23px Arial"
      ctx.fillStyle = "#7AD0FB"
      ctx.fillText(
        this.p.word,
        (5 * size) / 12 + 3,
        (((size * drawing.height) / drawing.width) * 3) / 8 - 100 / size
      )
    },

    step: function(dt) {
      this.p.x += this.p.vx * dt
    },

    hit: function() {
      player = Q("Player").first()
      if (words[level].indexOf(this.p.word) == 0) {
        Q.audio.play("eat_1.mp3")
        score++
        level++
        level = level % sentences.length
        Q.stageScene("sentence", 1)
      } else {
        Q.audio.play("nope.mp3")
        player.p.lives--
        Q("UI.Button", 2).items[player.p.lives].p.asset = ""
      }
      this.destroy()
      Q("UI.Text", 2).items[0].p.label = "Score: " + score
      if (player.p.lives <= 0) {
        player.destroy()
        Q.stageScene("GameOver", 2)
      }
    }
  })

  Q.GameObject.extend("FishSource", {
    init: function() {
      this.p = {
        launchDelay: 1.5,
        launchRandom: 1,
        launch: 2,
        counter: 0
      }
    },

    update: function(dt) {
      this.p.launch -= dt
      var word = words[level][this.p.counter]
      if (this.p.launch < 0) {
        if (Q("Player").first()) {
          this.stage.insert(new Q.Fish({ word: word }))
          this.p.launch =
            this.p.launchDelay + this.p.launchRandom * Math.random()
          this.p.counter = (this.p.counter + 1) % words[level].length
        }
      }
    }
  })

  Q.scene("title", function(stage) {
    Q.audio.play("background.mp3", { loop: true })
    stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0.5 }))
    var container = stage.insert(new Q.UI.Container({}))

    var button = container.insert(
      new Q.UI.Button({
        x: Q.width / 2,
        y: Q.height / 2,
        asset: "start.png",
        scale: 0.8
      })
    )

    button.on("click", function() {
      score = 0
      level = 0
      Q.audioContext.resume()
      Q.clearStages()
      Q.stageScene("level1")
      Q.stageScene("sentence", 1)
      Q.stageScene("hud", 2)
    })
    container.fit(20)
  })
  Q.scene("level1", function(stage) {
    stage.insert(new Q.Repeater({ asset: "background-wall.png", speedX: 0 }))
    stage.insert(new Q.FishSource())
    stage.insert(new Q.Player())
    stage.add("viewport")
  })

  Q.scene("sentence", function(stage) {
    var container = stage.insert(
      new Q.UI.Container({
        x: 20,
        y: 530
      })
    )

    Q.ctx.font = "30px Arial"
    var base_w = 600
    var text_w = Q.ctx.measureText(sentences[level]).width
    var calcSize = Math.floor((base_w / text_w) * 30)
    var size = calcSize > 20 ? 20 : calcSize

    label = container.insert(
      new Q.UI.Text({
        x: Q.width / 2,
        y: 0,
        label: sentences[level],
        color: "white",
        size: size,
        weight: 100
      })
    )
  })

  Q.scene("hud", function(stage) {
    var container = stage.insert(new Q.UI.Container({}))
    const paddingX = -140
    const paddingY = 42
    //console.log(size);
    container.insert(
      new Q.UI.Text({
        x: 80,
        y: 20,
        label: "Score: 0",
        color: "white",
        size: 30,
        weight: 100
      })
    )
    container.insert(
      new Q.UI.Button({
        x: Q.width / 2 - 30 + paddingX,
        y: paddingY,
        asset: "life.png",
        size: 25,
        weight: 100
      })
    )
    container.insert(
      new Q.UI.Button({
        x: Q.width / 2 + paddingX,
        y: paddingY,
        asset: "life.png",
        size: 25,
        weight: 100
      })
    )
    container.insert(
      new Q.UI.Button({
        x: Q.width / 2 + 30 + paddingX,
        y: paddingY,
        asset: "life.png",
        size: 25,
        weight: 100
      })
    )
  })

  Q.scene("GameOver", function(stage) {
    var container = stage.insert(new Q.UI.Container({}))
    container.insert(
      new Q.UI.Text({
        x: 80,
        y: 20,
        label: "Score: " + score,
        color: "white",
        size: 25,
        weight: 100
      })
    )
    container.insert(
      new Q.UI.Text({
        x: Q.width / 2,
        y: Q.height / 2 - 100,
        label: "Game Over",
        color: "white",
        size: 40,
        weight: 100
      })
    )

    var button = container.insert(
      new Q.UI.Button({
        x: Q.width / 2,
        y: Q.height / 2,
        label: "Play Again"
      })
    )

    button.on("click", function() {
      score = 0
      level = 0
      shuffle(words, sentences)
      Q.clearStages()
      Q.stageScene("level1")
      Q.stageScene("sentence", 1)
      Q.stageScene("hud", 2)
    })
    container.fit(20)
  })

  Q.load(
    "player.json, player.png, background-wall.png, background-floor.png, life.png, eat_1.mp3, nope.mp3, start.png, background.mp3",
    function() {
      Q.compileSheets("player.png", "player.json")
      Q.animations("player", {
        swim: {
          frames: [0],
          rate: 1 / 8,
          flip: false,
          loop: true
        }
      })
      Q.stageScene("title")
    }
  )
})
