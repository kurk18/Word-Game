// import * as PIXI from "pixi.js";
// import { Container, Sprite } from "pixi.js";
// import gsap from 'gsap';
// import { GAME_HEIGHT, GAME_WIDTH } from '.';
// import Matter from 'matter-js';

// export default class BuildUI {
//   constructor(game) {
//     this.game = game;
//   }

//     buildWorld() {
//         const { world } = this.game.engine;
//         const ground = Matter.Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT, GAME_WIDTH, 50, { isStatic: true, friction:0.8 });
//         const leftWall = Matter.Bodies.rectangle(0, GAME_HEIGHT / 2, 1, GAME_HEIGHT, { isStatic: true, friction:0.8 });
//         const rightWall = Matter.Bodies.rectangle(GAME_WIDTH, GAME_HEIGHT / 2, 1, GAME_HEIGHT, { isStatic: true, friction:0.8 });

//         Matter.World.add(world, [ground, leftWall, rightWall]);
//     }

//     buildStartPage() {
//         const start_text = new PIXI.Text("Press logo to Start Game", { fontFamily: 'Sniglet', fontSize: 25, fill: 0xFFA500, align: 'center' });
//         start_text.anchor.set(0.5);
//         start_text.x = GAME_WIDTH / 2;
//         start_text.y = GAME_HEIGHT - 500;
//         this.game.addChild(start_text);

//         let sprite = PIXI.Sprite.from("logo");
//         sprite.anchor.set(0.5);
//         sprite.scale.set(0.5);
//         sprite.x = GAME_WIDTH * 0.5;
//         sprite.y = GAME_HEIGHT * 0.5;

//         gsap.to(sprite, {
//             pixi: { scale: 0.6 },
//             duration: 1,
//             repeat: -1,
//             yoyo: true,
//             ease: "sine.easeInOut"
//         });

//         sprite.interactive = true;
//         sprite.buttonMode = true;
//         sprite.on('click', this.game.startGame.bind(this.game));

//         this.game.addChild(sprite);
//     }

//     createInputBox = () => {
//     // Tıklanan harflerin gösterilmesi için input_box ekliyor
//         let inputBox = Sprite.from("input_box");
//         this.inputBox = inputBox;
//         inputBox.x = GAME_WIDTH / 2;
//         inputBox.y = GAME_HEIGHT - 200;
//         this.inputBoxY = GAME_HEIGHT;
//         inputBox.anchor.set(0.5);
//         this.game.addChild(inputBox);

//         // input_box'ın Matter.js cismini oluşturuyor
//         const inputBoxBody = Matter.Bodies.rectangle(
//             inputBox.x, 
//             inputBox.y - inputBox.height / 2 + 1, // inputBox'un üst kenarı
//             inputBox.width, 
//             5, // Yükseklik 1 piksel
//             { 
//                 isStatic: true,
//                 friction: 1,
//                 restitution: 0.15
//             }
//         );
//         Matter.World.add(this.game.world, inputBoxBody);

//         this.inputBoxText = new PIXI.Text('', {
//             fontFamily: 'Sniglet',
//             fill: 0xFFFFFF,
//             align: 'left'
//         });

//         // Text nesnesini inputBox'ın ortasına yerleştir
//         this.inputBoxText.anchor.set(0, 0.5); // Yatay olarak sola, dikey olarak ortaya hizala
//         this.inputBoxText.x = inputBox.x - inputBox.width + 5; // inputBox'ın sol kenarından 10 piksel içeride başlat

//         inputBox.addChild(this.inputBoxText);
//         return inputBox;
//     }

//     createCrossSymbol = () => {
//         this.crossSprite = Sprite.from("cross");
//         this.crossSprite.anchor.set(0.5);
//         this.crossSprite.x = this.inputBox.x + this.inputBox.width / 2 - this.crossSprite.width; // inputBox'ın sağ tarafına yerleştir
//         this.crossSprite.y = this.inputBox.y;
//         this.crossSprite.interactive = true;
//         this.crossSprite.buttonMode = true;
//         this.crossSprite.visible = false; // Başlangıçta görünmez
    
//         this.crossSprite.eventMode = 'static';
//         this.crossSprite.cursor = 'pointer';
//         // this.game.clearSelectedLetters metoduna this.game üzerinden erişin ve bağlamını koruyun
//         this.crossSprite.on('click', this.game.clearSelectedLetters.bind(this.game));
    
//         this.game.addChild(this.crossSprite);
//         return this.crossSprite;
//     }
    
//     createTickSymbol = () => {
//         this.tickSprite = Sprite.from("tick");
//         this.tickSprite.anchor.set(0.5);
//         this.tickSprite.x = this.inputBox.x + this.inputBox.width / 2 - this.tickSprite.width;
//         this.tickSprite.y = this.inputBox.y;
//         this.tickSprite.interactive = true;
//         this.tickSprite.buttonMode = true;
//         this.tickSprite.visible = false; // Başlangıçta görünmez

//         this.game.addChild(this.tickSprite);
//         return this.tickSprite;
//     }
// }
