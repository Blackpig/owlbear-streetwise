import { useState, useEffect } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import type { Character } from '../types/character';
import { useOBR } from '../contexts/OBRContext';

const PLUGIN_ID = 'com.streetwise.character-sheet';

export function useCharacter() {
  const { ready, trackedPlayerId, playerId, allPlayers, role, isViewingSelf } = useOBR();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready || !trackedPlayerId) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    // Clear previous character data immediately when tracked player changes
    setCharacter(null);
    setLoading(true);

    // Load character from player metadata
    const loadCharacter = async () => {
      try {
        // Load from room metadata (persists across sessions)
        const metadata = await OBR.room.getMetadata();
        const charData = metadata[`${PLUGIN_ID}/character/${trackedPlayerId}`] as Character | undefined;

        setCharacter(charData || null);
      } catch (error) {
        console.error('Error loading character:', error);
        setCharacter(null);
      }
      setLoading(false);
    };

    loadCharacter();

    // Subscribe to room metadata changes for this player's character
    const unsubscribe = OBR.room.onMetadataChange((metadata) => {
      const charData = metadata[`${PLUGIN_ID}/character/${trackedPlayerId}`] as Character | undefined;
      setCharacter(charData || null);
    });

    return () => {
      unsubscribe();
    };
  }, [ready, trackedPlayerId, playerId, allPlayers, role]);

  const updateCharacter = async (updates: Partial<Character>) => {
    // Only allow updates if viewing own character
    if (!isViewingSelf) {
      return;
    }

    // If there's no existing character, treat updates as a complete new character
    const updatedCharacter = character ? { ...character, ...updates } : updates as Character;

    try {
      // Save character data (including portrait URL) to room metadata
      // Portraits are now URLs, not base64, so size is not an issue
      await OBR.room.setMetadata({
        [`${PLUGIN_ID}/character/${playerId}`]: updatedCharacter
      });
    } catch (error) {
      console.error('Error saving character:', error);
    }

    setCharacter(updatedCharacter);
  };

  return {
    character,
    loading,
    updateCharacter,
    hasCharacter: character !== null,
    canEdit: isViewingSelf // Only allow editing own character
  };
}
