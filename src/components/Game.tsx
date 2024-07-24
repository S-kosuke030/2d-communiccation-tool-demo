'use client';

import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from '../game/GameScene';

export default function Game() {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        scene: [GameScene],
        parent: 'game-container',
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 }, // x プロパティを追加
            debug: true,
          },
        },
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return <div id='game-container' style={{ width: '800px', height: '600px' }} />;
}
