/**
 * useAnnouncement Hook
 * Manages state and API calls for saving/loading announcements.
 * Includes auto-save draft to localStorage.
 */
import { useState, useEffect, useCallback } from "react";
import {
  saveAnnouncement,
  fetchCurrentAnnouncement,
} from "../services/announcementService.js";

const DRAFT_KEY = "announcement_draft";

export const useAnnouncement = () => {
  const [text, setText] = useState(() => {
    // Restore draft from localStorage on mount
    return localStorage.getItem(DRAFT_KEY) || "";
  });
  const [isSaving, setIsSaving] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState("");
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-save draft to localStorage whenever text changes
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, text);
    }, 500); // Debounce 500ms
    return () => clearTimeout(timer);
  }, [text]);

  // Load current live announcement on mount
  const loadCurrentAnnouncement = useCallback(async () => {
    setIsLoadingCurrent(true);
    try {
      const res = await fetchCurrentAnnouncement();
      setCurrentAnnouncement(res.data?.text || "");
    } catch (err) {
      console.error("Failed to load current announcement:", err.message);
    } finally {
      setIsLoadingCurrent(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentAnnouncement();
  }, [loadCurrentAnnouncement]);

  /**
   * Save announcement — validates, calls API, clears draft on success
   */
  const handleSave = useCallback(async () => {
    if (!text.trim()) {
      setSaveError("Announcement text cannot be empty");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await saveAnnouncement(text.trim());
      setSaveSuccess(true);
      setCurrentAnnouncement(text.trim());
      // Clear draft after successful save
      localStorage.removeItem(DRAFT_KEY);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaveError(err.message || "Failed to save announcement");
    } finally {
      setIsSaving(false);
    }
  }, [text]);

  /**
   * Clear the draft from localStorage and reset textarea
   */
  const clearDraft = useCallback(() => {
    setText("");
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  return {
    text,
    setText,
    isSaving,
    currentAnnouncement,
    isLoadingCurrent,
    saveError,
    saveSuccess,
    handleSave,
    clearDraft,
    setSaveError,
  };
};
