/**
 * useHistory Hook
 * Manages pagination, search, and deletion for announcement history.
 */
import { useState, useEffect, useCallback } from "react";
import {
  fetchHistory,
  deleteAnnouncementById,
} from "../services/announcementService.js";

export const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [deletingId, setDeletingId] = useState(null);
  const [deleteToast, setDeleteToast] = useState(null);

  const LIMIT = 10;

  /**
   * Load history from API
   */
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchHistory({ page, limit: LIMIT, search });
      setHistory(res.data || []);
      setPagination(res.pagination || {});
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  // Reload whenever page or search changes
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Reset to page 1 when search changes
  const handleSearchChange = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  /**
   * Delete a record by ID
   */
  const handleDelete = useCallback(
    async (id) => {
      setDeletingId(id);
      try {
        await deleteAnnouncementById(id);
        setDeleteToast({ content: "Announcement deleted", error: false });
        await loadHistory();
      } catch (err) {
        setDeleteToast({ content: err.message || "Delete failed", error: true });
      } finally {
        setDeletingId(null);
        setTimeout(() => setDeleteToast(null), 3000);
      }
    },
    [loadHistory]
  );

  return {
    history,
    isLoading,
    error,
    search,
    handleSearchChange,
    page,
    setPage,
    pagination,
    deletingId,
    deleteToast,
    loadHistory,
  };
};
