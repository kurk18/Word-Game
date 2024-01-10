import gsap, { Power0 } from "gsap";
import * as PIXI from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { GAME_HEIGHT, GAME_WIDTH } from ".";
import Matter from 'matter-js';

export default class Circle {
    constructor(game) {
        this.game = game;
        this.circles = this.game.circles;
    }
    
    generateRandomLetters(totalChars, minVowels) {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        let letters = [];
        let currentVowels = 0;
      
        // Mevcut dairelerdeki sesli harfleri say
        this.circles.forEach(({ sprite }) => {
          if (vowels.includes(sprite.char.toUpperCase())) {
            currentVowels++;
          }
        });
      
        // Sesli harfleri ekle
        while (currentVowels < minVowels) {
          letters.push(vowels[Math.floor(Math.random() * vowels.length)]);
          currentVowels++;
        }
      
        // Kalan harfleri ekle
        while (letters.length < totalChars) {
          const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          letters.push(randomChar);
        }
      
        // Harfleri karıştır
        letters.sort(() => Math.random() - 0.5);
      
        return letters;
    };

    //Circle oluştur ve harf yerleştir.
    createCircleSprite(body, diameter, char) {
        let circleSprite = Sprite.from("circles");
        circleSprite.isSelected = false;
        circleSprite.width = diameter;
        circleSprite.height = diameter;
        circleSprite.anchor.set(0.5);
        circleSprite.char = char; // Daireye harfi ekle
        
        circleSprite.x = body.position.x;
        circleSprite.y = body.position.y;

        circleSprite.eventMode = 'static';
        circleSprite.cursor = 'pointer';
        circleSprite.on('click', () => this.game.handleCircleClick(circleSprite, char));

        // Daire içindeki harf
        const text = new PIXI.Text(char, { fontFamily: 'Sniglet', fontSize: 175, fill: 0xFFA500, align: 'center' });
        text.anchor.set(0.5);
        circleSprite.addChild(text);

        return circleSprite;
    }

    animateCircles = () => {
        this.circles.forEach(({ sprite, body }) => {
          // Dairenin konumunu ve dönüşünü güncelle
          sprite.x = body.position.x;
          sprite.y = body.position.y;
          sprite.rotation = body.angle;
      
          // Harflerin daima aynı şekilde kalmasını sağla
          if (sprite.children.length > 0) {
            const text = sprite.children[0];
            text.rotation = -body.angle;
          }
        });
        requestAnimationFrame(this.animateCircles);
      };

      clearCircles() {
        this.circles.forEach(({ sprite, body }, index) => {
            // Önce daireleri 'end_circle' asseti olarak göster
            setTimeout(() => {
                sprite.children.forEach(child => {
                    child.visible = false;
                });
                sprite.texture = PIXI.Texture.from("end_circle");
                // Daireyi büyüt ve sonra soluklaştır
                gsap.to(sprite.scale, { x: 0.3, y: 0.3, duration: 0.1 });
                gsap.to(sprite, { alpha: 0, duration: 0.1, delay: 0.1, onComplete: () => {
                    this.game.removeChild(sprite);
                    // Burada, body'nin hala dünyada olup olmadığını kontrol edin
                    if (Matter.Composite.allBodies(this.game.world).includes(body)) {
                        Matter.World.remove(this.game.world, body);
                    }
                }});
            }, index * 50);
        });
      
        this.circles = []; // Daireler listesini sıfırla
    }   
}
