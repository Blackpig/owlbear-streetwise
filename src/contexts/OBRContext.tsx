import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import OBR, { type Player } from '@owlbear-rodeo/sdk';
import type { BroadcastMessage } from '../types/broadcast';
import type { HelpingInfo, AssistanceData } from '../services/assistanceService';

interface OBRContextType {
  ready: boolean;
  role: 'GM' | 'PLAYER';
  playerId: string;
  trackedPlayerId: string; // For GM: which player they're viewing
  allPlayers: Player[];
  sceneStrain: number;
  assistanceDice: number; // Bonus dice from other players helping
  helpingInfo: HelpingInfo | null; // Who this player is currently helping
  updateSceneStrain: (newStrain: number) => Promise<void>;
  setTrackedPlayer: (playerId: string) => void;
  isViewingSelf: boolean; // True if viewing own character
  latestBroadcast: { message: BroadcastMessage; timestamp: number } | null;
}

const OBRContext = createContext<OBRContextType | null>(null);

export const OBRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState<'GM' | 'PLAYER'>('PLAYER');
  const [playerId, setPlayerId] = useState('');
  const [trackedPlayerId, setTrackedPlayerId] = useState('');
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [sceneStrain, setSceneStrain] = useState(0);
  const [assistanceDice, setAssistanceDice] = useState(0);
  const [helpingInfo, setHelpingInfo] = useState<HelpingInfo | null>(null);
  const [latestBroadcast, setLatestBroadcast] = useState<{ message: BroadcastMessage; timestamp: number } | null>(null);

  useEffect(() => {
    let unsubscribeBroadcast: (() => void) | undefined;

    OBR.onReady(async () => {
      setReady(true);

      // Get player ID
      const id = await OBR.player.getId();
      setPlayerId(id);
      setTrackedPlayerId(id); // Start by viewing self

      // Get player role
      const playerRole = await OBR.player.getRole();
      setRole(playerRole);

      // Subscribe to player changes (role updates)
      OBR.player.onChange((player) => {
        setRole(player.role);
      });

      // Get all players from party (needed for assistance mechanic)
      const party = await OBR.party.getPlayers();
      setAllPlayers(party);

      // Subscribe to party changes
      OBR.party.onChange((party) => {
        setAllPlayers(party);
      });

      // Subscribe to room metadata (Scene Strain & Assistance)
      const metadata = await OBR.room.getMetadata();
      setSceneStrain((metadata['streetwise.strain'] as number) || 0);

      // Get initial assistance for tracked player
      const assistanceKey = `streetwise.assistance.${id}`;
      const initialData = metadata[assistanceKey] as AssistanceData | number | undefined;
      if (typeof initialData === 'number') {
        setAssistanceDice(initialData);
      } else {
        setAssistanceDice(initialData?.count || 0);
      }

      // Get initial helping info for current player
      const helpingKey = `streetwise.helping.${id}`;
      setHelpingInfo((metadata[helpingKey] as HelpingInfo) || null);

      OBR.room.onMetadataChange((metadata) => {
        setSceneStrain((metadata['streetwise.strain'] as number) || 0);

        // Update assistance for current player (use id, not trackedPlayerId from closure)
        const assistanceKey = `streetwise.assistance.${id}`;
        const data = metadata[assistanceKey] as AssistanceData | number | undefined;
        if (typeof data === 'number') {
          setAssistanceDice(data);
        } else {
          setAssistanceDice(data?.count || 0);
        }

        // Update helping info for current player
        const helpingKey = `streetwise.helping.${id}`;
        setHelpingInfo((metadata[helpingKey] as HelpingInfo) || null);
      });

      // Set up broadcast message listener with channel name
      unsubscribeBroadcast = OBR.broadcast.onMessage("com.streetwise/rolls", (event) => {
        const message = event.data;

        // Type guard to ensure it's one of our message types
        if (
          message &&
          typeof message === 'object' &&
          'type' in message &&
          (message.type === 'STREETWISE_ROLL' ||
            message.type === 'STRAIN_CHANGE' ||
            message.type === 'SCENE_PANIC' ||
            message.type === 'PLAYER_ASSISTANCE')
        ) {
          const broadcastMessage = message as BroadcastMessage;
          setLatestBroadcast({ message: broadcastMessage, timestamp: Date.now() });
        }
      });
    });

    return () => {
      if (unsubscribeBroadcast) {
        unsubscribeBroadcast();
      }
    };
  }, []);

  const updateSceneStrain = async (newStrain: number) => {
    await OBR.room.setMetadata({
      'streetwise.strain': newStrain
    });
  };

  const setTrackedPlayer = (newPlayerId: string) => {
    setTrackedPlayerId(newPlayerId);
  };

  const isViewingSelf = playerId === trackedPlayerId;

  return (
    <OBRContext.Provider value={{
      ready,
      role,
      playerId,
      trackedPlayerId,
      allPlayers,
      sceneStrain,
      assistanceDice,
      helpingInfo,
      updateSceneStrain,
      setTrackedPlayer,
      isViewingSelf,
      latestBroadcast
    }}>
      {children}
    </OBRContext.Provider>
  );
};

export const useOBR = () => {
  const context = useContext(OBRContext);
  if (!context) {
    throw new Error('useOBR must be used within OBRProvider');
  }
  return context;
};
