/**
 * AnnouncementPage
 * Main admin page — composes the announcement form and history table.
 * Connected to useAnnouncement and useHistory hooks.
 */
import React, { useEffect, useCallback } from "react";
import {
  Page,
  Layout,
  BlockStack,
  Frame,
  Toast,
  Banner,
  Text,
  Box,
} from "@shopify/polaris";
import AnnouncementForm from "../components/AnnouncementForm.jsx";
import HistoryTable from "../components/HistoryTable.jsx";
import { useAnnouncement } from "../hooks/useAnnouncement.js";
import { useHistory } from "../hooks/useHistory.js";

const AnnouncementPage = () => {
  const announcement = useAnnouncement();
  const historyState = useHistory();

  /**
   * Listen for delete events emitted by HistoryTable rows
   * (Polaris DataTable doesn't support passing callbacks in cell content directly)
   */
  const handleDeleteEvent = useCallback(
    (event) => {
      historyState.handleDelete(event.detail.id);
    },
    [historyState]
  );

  useEffect(() => {
    window.addEventListener("deleteAnnouncement", handleDeleteEvent);
    return () =>
      window.removeEventListener("deleteAnnouncement", handleDeleteEvent);
  }, [handleDeleteEvent]);

  /**
   * After successful save, reload history to show the new record
   */
  useEffect(() => {
    if (announcement.saveSuccess) {
      historyState.loadHistory();
    }
  }, [announcement.saveSuccess]);

  return (
    <Frame>
      {/* Success toast */}
      {announcement.saveSuccess && (
        <Toast
          content="✅ Announcement saved and published to storefront!"
          onDismiss={() => {}}
          duration={4000}
        />
      )}

      {/* Delete toast */}
      {historyState.deleteToast && (
        <Toast
          content={historyState.deleteToast.content}
          error={historyState.deleteToast.error}
          onDismiss={() => {}}
          duration={3000}
        />
      )}

      <Page
        title="Announcement Manager"
        subtitle="Write announcements for your storefront. Changes are saved to MongoDB and published via Shopify metafields."
        primaryAction={{
          content: "Save Announcement",
          loading: announcement.isSaving,
          disabled:
            announcement.isSaving ||
            !announcement.text.trim() ||
            announcement.text.length > 500,
          onAction: announcement.handleSave,
        }}
      >
        <Layout>
          {/* Left column — form */}
          <Layout.Section>
            <BlockStack gap="500">
              <AnnouncementForm
                text={announcement.text}
                setText={announcement.setText}
                isSaving={announcement.isSaving}
                saveError={announcement.saveError}
                saveSuccess={announcement.saveSuccess}
                currentAnnouncement={announcement.currentAnnouncement}
                isLoadingCurrent={announcement.isLoadingCurrent}
                handleSave={announcement.handleSave}
                clearDraft={announcement.clearDraft}
                setSaveError={announcement.setSaveError}
              />
            </BlockStack>
          </Layout.Section>

          {/* Full-width history table below */}
          <Layout.Section>
            <HistoryTable
              history={historyState.history}
              isLoading={historyState.isLoading}
              error={historyState.error}
              search={historyState.search}
              handleSearchChange={historyState.handleSearchChange}
              page={historyState.page}
              setPage={historyState.setPage}
              pagination={historyState.pagination}
              deletingId={historyState.deletingId}
              deleteToast={historyState.deleteToast}
            />
          </Layout.Section>
        </Layout>

        {/* Footer note */}
        <Box paddingBlockStart="400" paddingBlockEnd="800">
          <Text variant="bodySm" tone="subdued" alignment="center">
            Announcements are stored in MongoDB and synced to your Shopify shop
            metafield (namespace: my_app / key: announcement). Enable the Theme
            App Extension in your Theme Editor to display the banner on all
            storefront pages.
          </Text>
        </Box>
      </Page>
    </Frame>
  );
};

export default AnnouncementPage;
