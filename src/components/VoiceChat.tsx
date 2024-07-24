'use client';

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

export default function VoiceChat() {
  const socketRef = useRef<any>();
  const peersRef = useRef<{ [key: string]: Peer.Instance }>({});
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    socketRef.current = io('http://localhost:3001');

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setStream(stream);

      socketRef.current.emit('join room', 'main-room');

      socketRef.current.on('all users', (users: string[]) => {
        users.forEach((userID) => {
          const peer = createPeer(userID, socketRef.current.id, stream);
          peersRef.current[userID] = peer;
        });
      });

      socketRef.current.on(
        'user joined',
        (payload: { signal: Peer.SignalData; callerID: string }) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current[payload.callerID] = peer;
        }
      );

      socketRef.current.on(
        'receiving returned signal',
        (payload: { signal: Peer.SignalData; id: string }) => {
          const peer = peersRef.current[payload.id];
          peer.signal(payload.signal);
        }
      );
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      Object.values(peersRef.current).forEach((peer) => {
        if (peer.destroy) peer.destroy();
      });
    };
  }, []);

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('sending signal', { userToSignal, callerID, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal: Peer.SignalData, callerID: string, stream: MediaStream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socketRef.current.emit('returning signal', { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return null;
}
