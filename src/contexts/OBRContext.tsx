import React, { createContext, useContext, useState, useEffect } from 'react';
import OBR, { type Player } from '@owlbear-rodeo/sdk';
import type { BroadcastMessage } from '../types/broadcast';
import type { HelpingInfo, AssistanceData } from '../services/assistanceService';
import type { TurnActions } from '../services/turnTrackingService';
import type { NPC } from '../services/npcService';
import type { SceneChallenge } from '../services/sceneChallengeService';

interface OBRContextType {
  ready: boolean;
  role: 'GM' | 'PLAYER';
  playerId: string;
  trackedPlayerId: string; // For GM: which player they're viewing
  allPlayers: Player[];
  sceneStrain: number;
  assistanceDice: number; // Bonus dice from other players helping
  helpingInfo: HelpingInfo | null; // Who this player is currently helping
  // Turn tracking for current/tracked player
  initiative: number | null;
  turnActions: TurnActions;
  // Initiative round state
  initiativeRoundActive: boolean;
  initiativePool: number[];
  npcs: NPC[];
  turnCounter: number;
  // Scene challenge state
  sceneChallenge: SceneChallenge;
  updateSceneStrain: (newStrain: number) => Promise<void>;
  updateInitiative: (initiative: number) => Promise<void>;
  updateTurnActions: (actions: TurnActions) => Promise<void>;
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
  const [initiative, setInitiative] = useState<number | null>(null);
  const [turnActions, setTurnActions] = useState<TurnActions>({ quick: [false, false], slow: false });
  const [initiativeRoundActive, setInitiativeRoundActive] = useState(false);
  const [initiativePool, setInitiativePool] = useState<number[]>([]);
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [turnCounter, setTurnCounter] = useState(1);
  const [sceneChallenge, setSceneChallenge] = useState<SceneChallenge>({ active: false, target: 0, successes: 0, banes: 0 });

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
      let party = await OBR.party.getPlayers();

      // Ensure current player is included (GM might not be in party list)
      const hasCurrentPlayer = party.some(p => p.id === id);
      if (!hasCurrentPlayer) {
        // Construct current player manually
        const currentPlayer = {
          id,
          name: await OBR.player.getName(),
          color: await OBR.player.getColor(),
          role: playerRole,
          connectionId: await OBR.player.getConnectionId()
        };
        party = [...party, currentPlayer];
      }

      setAllPlayers(party);

      // Subscribe to party changes
      OBR.party.onChange(async (newParty) => {
        // Ensure current player is always included
        let allPlayersList = newParty;
        const hasCurrentPlayer = newParty.some(p => p.id === id);
        if (!hasCurrentPlayer) {
          const currentPlayer = {
            id,
            name: await OBR.player.getName(),
            color: await OBR.player.getColor(),
            role: playerRole,
            connectionId: await OBR.player.getConnectionId()
          };
          allPlayersList = [...newParty, currentPlayer];
        }
        setAllPlayers(allPlayersList);
      });

      // Subscribe to room metadata (Scene Strain & Assistance)
      const metadata = await OBR.room.getMetadata();
      setSceneStrain((metadata['streetwise.strain'] as number) || 0);

      // Get initial assistance for current player
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

      // Get initial turn tracking for tracked player (starts as self)
      const initiativeKey = `streetwise.initiative.${id}`;
      setInitiative((metadata[initiativeKey] as number | null) ?? null);
      const turnActionsKey = `streetwise.turnActions.${id}`;
      setTurnActions((metadata[turnActionsKey] as TurnActions) || { quick: [false, false], slow: false });

      // Get initial initiative round state
      setInitiativeRoundActive((metadata['streetwise.initiativeRound.active'] as boolean) || false);
      setInitiativePool((metadata['streetwise.initiativeRound.pool'] as number[]) || []);
      setNpcs((metadata['streetwise.npcs'] as NPC[]) || []);
      setTurnCounter((metadata['streetwise.turnCounter'] as number) || 0);

      // Get initial scene challenge state
      setSceneChallenge((metadata['streetwise.sceneChallenge'] as SceneChallenge) || { active: false, target: 0, successes: 0, banes: 0 });

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

        // Update initiative round state
        setInitiativeRoundActive((metadata['streetwise.initiativeRound.active'] as boolean) || false);
        setInitiativePool((metadata['streetwise.initiativeRound.pool'] as number[]) || []);
        setNpcs((metadata['streetwise.npcs'] as NPC[]) || []);
        setTurnCounter((metadata['streetwise.turnCounter'] as number) || 0);

        // Update scene challenge state
        setSceneChallenge((metadata['streetwise.sceneChallenge'] as SceneChallenge) || { active: false, target: 0, successes: 0, banes: 0 });

        // Note: Turn tracking for tracked player is updated via separate effect watching trackedPlayerId
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

  // Watch trackedPlayerId and load that player's turn data
  useEffect(() => {
    if (!ready || !trackedPlayerId) return;

    const loadTrackedPlayerTurnData = async () => {
      const metadata = await OBR.room.getMetadata();
      const initiativeKey = `streetwise.initiative.${trackedPlayerId}`;
      const turnActionsKey = `streetwise.turnActions.${trackedPlayerId}`;

      setInitiative((metadata[initiativeKey] as number | null) ?? null);
      setTurnActions((metadata[turnActionsKey] as TurnActions) || { quick: [false, false], slow: false });
    };

    loadTrackedPlayerTurnData();

    // Subscribe to metadata changes for the tracked player
    const unsubscribe = OBR.room.onMetadataChange((metadata) => {
      const initiativeKey = `streetwise.initiative.${trackedPlayerId}`;
      const turnActionsKey = `streetwise.turnActions.${trackedPlayerId}`;

      setInitiative((metadata[initiativeKey] as number | null) ?? null);
      setTurnActions((metadata[turnActionsKey] as TurnActions) || { quick: [false, false], slow: false });
    });

    return () => {
      unsubscribe();
    };
  }, [ready, trackedPlayerId]);

  const updateSceneStrain = async (newStrain: number) => {
    await OBR.room.setMetadata({
      'streetwise.strain': newStrain
    });
  };

  const updateInitiative = async (newInitiative: number) => {
    // Always update for the actual player (playerId), not the tracked player
    await OBR.room.setMetadata({
      [`streetwise.initiative.${playerId}`]: newInitiative
    });
  };

  const updateTurnActions = async (actions: TurnActions) => {
    // Always update for the actual player (playerId), not the tracked player
    await OBR.room.setMetadata({
      [`streetwise.turnActions.${playerId}`]: actions
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
      initiative,
      turnActions,
      initiativeRoundActive,
      initiativePool,
      npcs,
      turnCounter,
      sceneChallenge,
      updateSceneStrain,
      updateInitiative,
      updateTurnActions,
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
