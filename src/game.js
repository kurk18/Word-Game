import gsap, { Power0 } from "gsap";
import * as PIXI from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";
import Circle from "./circle";
import Matter from 'matter-js'; // Fizik motorunu kendim yazmak yerine matter-js kullanmayı tercih ettim.

export default class Game extends Container {
  minRadius = 25;
  maxRadius = 40;
  circles = []; // Daireleri saklamak için bir dizi
  selectedLetters = "";  // Tıklanan harfleri saklamak için bir değişken
  circleNumber = 15; // İlk başta oluşturulacak daire sayısı
  rightWord = 0; // Bilinen kelime sayısı

  //dictionary api
  async isWordValid(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`); // Dictionary içerisinde kelimeleri bulabilmesi için tüm harflerin lower case olması gerekli
        if (!response.ok) {
            // Kelime sözlükte bulunamadı veya hata oluştu
            return false;
        }
        const data = await response.json();
        // API'den dönen verinin içeriğini kontrol edin
        return data.some(entry => entry.word.toLowerCase() === word.toLowerCase());
    } catch (error) {
        console.error("Kelime kontrolü sırasında hata oluştu:", error);
        // Hata durumunda false dön
        return false;
    }
  };

  constructor(app) {
    super();
    this.app = app;
    this.isGameStarted = false; //gameStart flag
    this.Circle = new Circle(this)
    this.init();
  };

  init() {
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;

    // Oyun alanının kenarlarını ve zemini katı cisimler olarak oluşturur
    this.buildWorld();
    this.buildStartPage();
  };

  buildWorld(){
    const ground = Matter.Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 50, { isStatic: true, friction:0.9 });
    const leftWall = Matter.Bodies.rectangle(0, GAME_HEIGHT / 2, 1, GAME_HEIGHT, { isStatic: true, friction:0.9 });
    const rightWall = Matter.Bodies.rectangle(GAME_WIDTH, GAME_HEIGHT / 2, 1, GAME_HEIGHT, { isStatic: true, friction:0.9 });

    Matter.World.add(this.world, [ground, leftWall, rightWall]);
  }

  buildStartPage(){
        //Press logo to Start Game text'ini ekliyor.
        const start_text = new PIXI.Text("Press logo to Start Game", { fontFamily: 'Sniglet', fontSize: 25, fill: 0xFFA500, align: 'center' });
        this.start_text = start_text;
        start_text.anchor.set(0.5);
        start_text.x = GAME_WIDTH/2;
        start_text.y = GAME_HEIGHT-500;
        this.addChild(start_text);
        
        let sprite = Sprite.from("logo");
        sprite.anchor.set(0.5);
        sprite.scale.set(0.5);
        this.addChild(sprite);
        sprite.x = GAME_WIDTH * 0.5;
        sprite.y = GAME_HEIGHT * 0.5;
        this.logo = sprite;
    
        gsap.to(sprite, {
          pixi: {
            scale: 0.6,
          },
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.easeInOut",
        });
    
        //Logo click eventini aktif ediyor.
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
    
        sprite.on('click', this.startGame);
  }

  startGame = () =>{
    if (this.isGameStarted) return; // Oyun zaten başlamışsa tekrar başlatma
    
    this.isGameStarted = true;
    this.removeChild(this.start_text); //Texti kaldır
    this.removeChild(this.logo); // Logoyu kaldır

     // Create a sprite for the background
    let background = Sprite.from("bg_color");
    background.width = GAME_WIDTH;
    background.height = GAME_HEIGHT;
    this.addChildAt(background, 0); // Oyun başlayınca background değiştir

    this.generateCircles(this.circleNumber);
    
    this.runner = Matter.Runner.create();
    Matter.Runner.run(this.runner, this.engine);
    
    this.Circle.animateCircles();

    this.createInputBox();

    this.createCrossSymbol();

    this.createTickSymbol();
  };

  createInputBox = () => {
        // Tıklanan harflerin gösterilmesi için input_box ekliyor
        let inputBox = Sprite.from("input_box");
        this.inputBox = inputBox;
        inputBox.x = GAME_WIDTH / 2;
        inputBox.y = GAME_HEIGHT - 200;
        inputBox.anchor.set(0.5);
        this.addChild(inputBox);
    
        // input_box'ın Matter.js cismini oluşturuyor
        const inputBoxBody = Matter.Bodies.rectangle(
          inputBox.x, 
          inputBox.y - inputBox.height / 2 + 1, // inputBox'un üst kenarı
          inputBox.width, 
          5, // Yükseklik 1 piksel
          { 
            isStatic: true,
            friction: 1,
            restitution: 0.1
          }
        );
        Matter.World.add(this.world, inputBoxBody);
    
        this.inputBoxText = new PIXI.Text('', {
          fontFamily: 'Sniglet',
          fill: 0xFFFFFF,
          align: 'left'
        });
    
        // Text nesnesini inputBox'ın ortasına yerleştir
        this.inputBoxText.anchor.set(0, 0.5); // Yatay olarak sola, dikey olarak ortaya hizala
        this.inputBoxText.x = inputBox.x - inputBox.width + 5; // inputBox'ın sol kenarından 5 piksel içeride başlat
    
        inputBox.addChild(this.inputBoxText);
  }

  createCrossSymbol = () => {
    this.crossSprite = Sprite.from("cross");
    this.crossSprite.anchor.set(0.5);
    this.crossSprite.x = this.inputBox.x + this.inputBox.width / 2 - this.crossSprite.width; // inputBox'ın sağ tarafına yerleştir
    this.crossSprite.y = this.inputBox.y;
    this.crossSprite.interactive = true;
    this.crossSprite.buttonMode = true;
    this.crossSprite.visible = false; // Başlangıçta görünmez

    this.crossSprite.eventMode = 'static';
    this.crossSprite.cursor = 'pointer';
    this.crossSprite.on('click', this.clearSelectedLetters);

    this.addChild(this.crossSprite);
  }

  createTickSymbol = () => {
    this.tickSprite = Sprite.from("tick");
    this.tickSprite.anchor.set(0.5);
    this.tickSprite.x = this.inputBox.x + this.inputBox.width / 2 - this.tickSprite.width;
    this.tickSprite.y = this.inputBox.y;
    this.tickSprite.interactive = true;
    this.tickSprite.buttonMode = true;
    this.tickSprite.visible = false; // Başlangıçta görünmez

    this.addChild(this.tickSprite);
  }

  //Oluşturulan dairelerin fizik motoruyla entegre edilmesi ve görüntüsünün düzenlenmesi
  generateCircles(numberCircle){
    let letters = this.Circle.generateRandomLetters(numberCircle, 3);
    letters.forEach((char, index) => {
      setTimeout(() => {
        const x = GAME_WIDTH/2;
        const y = 50; // Dairelerin ekranın dışından başlamasını sağlar
        const radius = this.minRadius + Math.random() * (this.maxRadius - this.minRadius); // Belirlenen max ve min yarıçap değerleri arasında random circlelar oluştur
        const circleBody = Matter.Bodies.circle(x, y, radius, {
          restitution: 0.2,
          friction: 0.9
        });
        Matter.World.add(this.world, circleBody);
    
        const circleSprite = this.Circle.createCircleSprite(circleBody, radius * 2, char);
        this.circles.push({ sprite: circleSprite, body: circleBody });
        this.addChild(circleSprite);
      }, index * 150);
    });

    if(this.rightWord == 0){
      setTimeout(() => this.onCirclesSettled(), 3000);
    }
  };

  onCirclesSettled() {
    this.tapBox = Sprite.from("gray_pane");
    this.tapBox.x = GAME_WIDTH / 2;
    this.tapBox.y= GAME_HEIGHT - 600;
    this.tapBox.anchor.set(0.5);
    this.addChild(this.tapBox);

    this.tapBoxText = new PIXI.Text('TAP LETTERS TO MAKE WORD', {
      fontFamily: 'Sniglet',
      fill: 0xFFFFFF,
      align: 'left'
    });

    this.tapBoxText.anchor.set(0, 0.5);
    this.tapBoxText.x = this.tapBoxText.x - this.tapBoxText.width/2; // inputBox'ın sol kenarından 10 piksel içeride başlat

    this.tapBox.addChild(this.tapBoxText);

    gsap.to(this.tapBox, { alpha: 0, duration: 1, delay: 3, onComplete: () => {
      this.removeChild(this.tapBox);
    }});
  }

  //circle'a tıklandığında olacakları ayarla.
  handleCircleClick(circleSprite, randomChar) {
    if (!circleSprite.isSelected) {
      // Daire ilk kez seçiliyorsa, harfi listeye ekle ve görünümü değiştir
      this.selectedLetters += randomChar;
      circleSprite.texture = PIXI.Texture.from("whileClick_circle");
      circleSprite.children[0].style.fill = 0xFFFFFF; // Metni beyaz yap
      circleSprite.isSelected = true;
    } else {
      // Daire daha önce seçilmişse, harfi listeden çıkar ve görünümü eski haline döndür
      this.selectedLetters = this.selectedLetters.replace(randomChar, '');
      circleSprite.texture = PIXI.Texture.from("circles");
      circleSprite.children[0].style.fill = 0xFFA500; // Metni orijinal rengine döndür
      circleSprite.isSelected = false;
    }

    if (this.selectedLetters.length > 0) {
      this.inputBox.texture = PIXI.Texture.from("gray_pane");
      this.crossSprite.visible = true;
      this.tickSprite.visible = false;
      this.updateTextSize();
      if (this.selectedLetters.length > 2){
        this.isWordValid(this.selectedLetters).then(isValid => {
          if (isValid) {
              console.log("Bu bir kelime!");
              this.inputBox.texture = PIXI.Texture.from("green_pane");
              this.crossSprite.visible = false;
              this.tickSprite.visible = true;

              this.tickSprite.eventMode = 'static';
              this.tickSprite.cursor = 'pointer';
              this.tickSprite.off('click').on('click', () => this.handleTickClick());
          } else {
              console.log("Geçersiz kelime.");
          }
        });
      }
      
    } else {
      this.inputBox.texture = PIXI.Texture.from("input_box");
      this.crossSprite.visible = false;
      this.updateTextSize();
    }

    this.inputBoxText.text = this.selectedLetters;

    //Dairelere tıklama animasyonu ekle
    gsap.to(circleSprite.scale, {
      x: 0.2,
      y: 0.2,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    });
  
    console.log("Oluşturulan kelime:", this.selectedLetters);
  };

  //tüm listeyi, inputBoxı ve seçili circleları temizler ve ilk haline döndürür
  clearSelectedLetters = () => {
    this.resetInputBox();
  
    // Tüm dairelerin görünümlerini sıfırla
    this.circles.forEach(({ sprite }) => {
      sprite.texture = PIXI.Texture.from("circles");
      if (sprite.children[0]) {
        sprite.children[0].style.fill = 0xFFA500; 
      }
      sprite.isSelected = false;
    });
  };

  resetInputBox = () => {
    this.selectedLetters = "";
    this.inputBoxText.text = "";
    this.inputBox.texture = PIXI.Texture.from("input_box");
    this.crossSprite.visible = false;
    this.tickSprite.visible = false;
  };

  // Tick işaretine tıklandığında kelimeyi sayması ve kalan işlemleri yapması için yazıldı.
  handleTickClick = () => {
    this.rightWord++;
    if(this.rightWord < 4){
      let removedCount = 0;
      for (let i = 0; i < this.circles.length; i++) {
        if (this.circles[i].sprite.isSelected) {
          let { sprite, body } = this.circles[i];
          setTimeout(() => {
            sprite.children.forEach(child => {
              child.visible = false;
            });
            sprite.texture = PIXI.Texture.from("end_circle");
            // Daireyi büyüt ve sonra soluklaştır
            gsap.to(sprite.scale, { x: 0.3, y: 0.3, duration: 0.1 });
            gsap.to(sprite, { alpha: 0, duration: 0.1, delay: 0.1, onComplete: () => {
                this.removeChild(sprite);
                Matter.World.remove(this.world, body);
            }});
          }, 50);
          this.circles.splice(i, 1); // Daireler listesinden çıkar
          i--; // Dizi küçüldüğü için indeksi ayarla
          removedCount++; // Silinen daire sayısını arttır
        }
      }
  
      // Yeni dairelerin sayısı
      const newCircleCount = removedCount + 2;
  
      // En az 3 sesli harf içeren yeni harfler oluştur
      console.log(`Eklenen daire sayısı: ${newCircleCount}`);
  
      // Yeni daireleri ve harfleri oluştur
      this.generateCircles(newCircleCount);
      this.resetInputBox();
    }
    else{
      this.endGame();
    }
  };

  //Girili harfler inputBoxtan taşmasın diye text size güncellemek için yazıldı
  updateTextSize() {
    const maxTextWidth = this.inputBox.width - (this.crossSprite.width * 2.5); // inputBox genişliğinden cross genişliğini ve biraz boşluk çıkar
    this.inputBoxText.style.fontSize = 55; // Başlangıç font boyutu
  
    while (this.inputBoxText.width > maxTextWidth && this.inputBoxText.style.fontSize > 10) {
      // Metin inputBox genişliğini aşarsa font boyutunu küçült
      this.inputBoxText.style.fontSize -= 5;
    }
  }

  endGame = () => {
    // Tüm daireleri kaldır
    this.Circle.clearCircles();

    this.circles = []; // Daireler listesini sıfırla
    this.cleanRemains();

    const gameOverText = new PIXI.Text("Game Over, You Find 4 Words!", {
      fontFamily: 'Sniglet',
      fontSize: 36,
      fill: 0xFFFFFF, // You can choose a different color
      align: 'center'
    });
  
    gameOverText.anchor.set(0.5); // Center the text
    gameOverText.x = GAME_WIDTH / 2; // Position it horizontally in the center
    gameOverText.y = GAME_HEIGHT / 2; // Position it vertically in the center
  
    setTimeout(() => {
      this.addChild(gameOverText); // Oyunu yeniden başlatan fonksiyonu çağırın
    }, 1500);

  };
  
  cleanRemains = () => {
    // Diğer tüm objeleri kaldır (input box, tickSprite, crossSprite, vb.)
    if (this.inputBox) {
      this.removeChild(this.inputBox);
      this.inputBox = null;
    }
    if (this.crossSprite) {
      this.removeChild(this.crossSprite);
      this.crossSprite = null;
    }
    if (this.tickSprite) {
      this.removeChild(this.tickSprite);
      this.tickSprite = null;
    }

    this.selectedLetters = "";
    if (this.inputBoxText) {
      this.inputBoxText.text = "";
    }

    // Oyun durumunu sıfırla
    this.isGameStarted = false;
  };
}
