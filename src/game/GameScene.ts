import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Image;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private debugText?: Phaser.GameObjects.Text;
  private background?: Phaser.GameObjects.TileSprite;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('character', '/assets/character.png');
    this.load.image('background', '/assets/bg.jpg');
  }

  create() {
    // 背景画像の追加
    const backgroundImage = this.textures.get('background');
    const backgroundWidth = backgroundImage.getSourceImage().width;
    const backgroundHeight = backgroundImage.getSourceImage().height;

    this.background = this.add.tileSprite(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      'background'
    );
    this.background.setOrigin(0, 0);
    this.background.setScrollFactor(0);

    // プレイヤーのスプライトを作成（ワールドの中心に配置）
    this.player = this.add.image(0, 0, 'character');

    // カメラの設定
    this.cameras.main.setZoom(1);
    this.cameras.main.startFollow(this.player);

    // キー入力の設定
    this.cursors = this.input?.keyboard?.createCursorKeys() ?? undefined;

    // デバッグテキスト
    this.debugText = this.add
      .text(16, 16, 'Move using arrow keys', {
        fontSize: '18px',
        color: '#ffffff',
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  update() {
    if (!this.player || !this.cursors || !this.debugText || !this.background) return;

    const speed = 4;
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

    // プレイヤーの位置を更新
    this.player.x += dx;
    this.player.y += dy;

    // 背景のスクロール
    this.background.tilePositionX += dx;
    this.background.tilePositionY += dy;

    // デバッグテキストを更新
    this.debugText.setText(
      `Player position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
  }
}
