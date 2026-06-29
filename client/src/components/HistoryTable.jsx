/**
 * HistoryTable Component
 * Displays paginated, searchable announcement history using Polaris.
 * Features: search, pagination, delete, loading skeletons.
 */
import React from "react";
import {
  Card,
  DataTable,
  TextField,
  Pagination,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Spinner,
  Toast,
  Frame,
  EmptyState,
  SkeletonBodyText,
  SkeletonDisplayText,
  Box,
  Banner,
} from "@shopify/polaris";
import { SearchIcon, DeleteIcon } from "@shopify/polaris-icons";

/**
 * Format a date string into a readable local format
 */
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Skeleton row for loading state
 */
const SkeletonRows = () => (
  <Box padding="400">
    <BlockStack gap="300">
      {[...Array(5)].map((_, i) => (
        <SkeletonBodyText key={i} lines={1} />
      ))}
    </BlockStack>
  </Box>
);

const HistoryTable = ({
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
}) => {
  /**
   * Build DataTable rows from history array
   */
  const rows = history.map((item) => [
    // Announcement text (truncated with tooltip effect)
    <Text key={`text-${item.id}`} variant="bodyMd">
      {item.announcementText.length > 80
        ? `${item.announcementText.substring(0, 80)}…`
        : item.announcementText}
    </Text>,

    // Created time
    <Text key={`date-${item.id}`} tone="subdued" variant="bodySm">
      {formatDate(item.createdAt)}
    </Text>,

    // Delete button
    <Button
      key={`del-${item.id}`}
      variant="plain"
      tone="critical"
      icon={DeleteIcon}
      loading={deletingId === item.id}
      disabled={!!deletingId}
      onClick={() => {
        if (window.confirm("Delete this announcement record?")) {
          // Trigger parent delete handler
          const event = new CustomEvent("deleteAnnouncement", {
            detail: { id: item.id },
          });
          window.dispatchEvent(event);
        }
      }}
      accessibilityLabel={`Delete announcement from ${formatDate(item.createdAt)}`}
    >
      Delete
    </Button>,
  ]);

  return (
    <Frame>
      {deleteToast && (
        <Toast
          content={deleteToast.content}
          error={deleteToast.error}
          onDismiss={() => {}}
          duration={3000}
        />
      )}

      <Card>
        <BlockStack gap="400">
          {/* Header */}
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h2">
              Announcement History
            </Text>
            {!isLoading && pagination.total > 0 && (
              <Badge tone="info">{pagination.total} total</Badge>
            )}
          </InlineStack>

          {/* Search field */}
          <TextField
            label="Search announcements"
            labelHidden
            value={search}
            onChange={handleSearchChange}
            placeholder="Search history..."
            prefix={<SearchIcon />}
            clearButton
            onClearButtonClick={() => handleSearchChange("")}
            autoComplete="off"
          />

          {/* Error state */}
          {error && (
            <Banner title="Failed to load history" tone="critical">
              <p>{error}</p>
            </Banner>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <BlockStack gap="200">
              <SkeletonDisplayText size="small" />
              <SkeletonRows />
            </BlockStack>
          )}

          {/* Empty state */}
          {!isLoading && !error && history.length === 0 && (
            <EmptyState
              heading={
                search ? "No announcements match your search" : "No announcements yet"
              }
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                {search
                  ? "Try a different search term."
                  : "Save your first announcement above and it will appear here."}
              </p>
            </EmptyState>
          )}

          {/* Data table */}
          {!isLoading && !error && history.length > 0 && (
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={["Announcement", "Created Time", "Actions"]}
              rows={rows}
              hoverable
              defaultSortDirection="descending"
              initialSortColumnIndex={1}
            />
          )}

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <InlineStack align="center">
              <Pagination
                hasPrevious={pagination.hasPrevPage}
                onPrevious={() => setPage((p) => Math.max(1, p - 1))}
                hasNext={pagination.hasNextPage}
                onNext={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                label={`Page ${page} of ${pagination.totalPages}`}
              />
            </InlineStack>
          )}
        </BlockStack>
      </Card>
    </Frame>
  );
};

export default HistoryTable;
