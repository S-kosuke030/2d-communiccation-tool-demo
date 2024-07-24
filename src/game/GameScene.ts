import Phaser from 'phaser';
import io, { Socket } from 'socket.io-client';

interface Player {
  x: number;
  y: number;
  playerId: string;
}

export default class GameScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Image;
  private otherPlayers: { [key: string]: Phaser.Physics.Arcade.Image } = {};
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugText?: Phaser.GameObjects.Text;
  private background?: Phaser.GameObjects.TileSprite;

  private fieldWidth: number = 2000;
  private fieldHeight: number = 2000;

  private socket?: Socket;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('character', '/assets/character.png');
    this.load.image('background', '/assets/bg.jpg');
  }

  create() {
    // 背景画像の追加
    this.background = this.add.tileSprite(0, 0, this.fieldWidth, this.fieldHeight, 'background');
    this.background.setOrigin(0, 0);

    // フィールドの境界を設定
    this.physics.world.setBounds(0, 0, this.fieldWidth, this.fieldHeight);

    // Socket.IO接続の設定
    this.socket = io('http://localhost:3001');

    this.setupSocketListeners();

    // 新しいプレイヤーの作成
    const x = Math.random() * this.fieldWidth;
    const y = Math.random() * this.fieldHeight;
    this.player = this.physics.add.image(x, y, 'character');
    this.player.setCollideWorldBounds(true);

    // カメラの設定
    this.cameras.main.setBounds(0, 0, this.fieldWidth, this.fieldHeight);
    this.cameras.main.startFollow(this.player);

    // キー入力の設定
    this.cursors = this.input.keyboard.createCursorKeys();

    // デバッグテキスト
    this.debugText = this.add
      .text(16, 16, 'Multiplayer mode', {
        fontSize: '18px',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(1000);

    // サーバーに新しいプレイヤーを通知
    this.socket.emit('new player', { x, y });
  }

  setupSocketListeners() {
    if (!this.socket) return;

    // 他のプレイヤーの初期位置を設定
    this.socket.on('current players', (players: { [key: string]: Player }) => {
      Object.keys(players).forEach((id) => {
        if (id !== this.socket?.id) {
          this.addOtherPlayer(players[id]);
        }
      });
      this.updateDebugText();
    });

    // 新しいプレイヤーが接続したときの処理
    this.socket.on('new player', (playerInfo: Player) => {
      this.addOtherPlayer(playerInfo);
      this.updateDebugText();
    });

    // プレイヤーが切断したときの処理
    this.socket.on('player disconnected', (playerId: string) => {
      if (this.otherPlayers[playerId]) {
        this.otherPlayers[playerId].destroy();
        delete this.otherPlayers[playerId];
        this.updateDebugText();
      }
    });

    // 他のプレイヤーが移動したときの処理
    this.socket.on('player moved', (playerInfo: Player) => {
      if (this.otherPlayers[playerInfo.playerId]) {
        this.otherPlayers[playerInfo.playerId].setPosition(playerInfo.x, playerInfo.y);
      }
    });
  }

  addOtherPlayer(playerInfo: Player) {
    const otherPlayer = this.physics.add.image(playerInfo.x, playerInfo.y, 'character');
    otherPlayer.setTint(0xff0000); // 他のプレイヤーを赤く表示
    this.otherPlayers[playerInfo.playerId] = otherPlayer;
  }

  updateDebugText() {
    if (this.debugText) {
      this.debugText.setText(`Players: ${Object.keys(this.otherPlayers).length + 1}`);
    }
  }

  update() {
    if (!this.player || !this.cursors || !this.socket) return;

    const speed = 200;
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown) {
      dx -= speed;
    } else if (this.cursors.right.isDown) {
      dx += speed;
    }

    if (this.cursors.up.isDown) {
      dy -= speed;
    } else if (this.cursors.down.isDown) {
      dy += speed;
    }

    this.player.setVelocity(dx, dy);

    // プレイヤーの位置が変更された場合、サーバーに通知
    if (dx !== 0 || dy !== 0) {
      this.socket.emit('player movement', { x: this.player.x, y: this.player.y });
    }

    // 背景のスクロール
    if (this.background) {
      this.background.tilePositionX = this.cameras.main.scrollX;
      this.background.tilePositionY = this.cameras.main.scrollY;
    }
  }
}
