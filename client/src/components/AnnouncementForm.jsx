/**
 * AnnouncementForm Component
 * Polaris-based form for writing and saving announcements.
 * Features: character counter, auto-save draft, preview, validation.
 */
import React from "react";
import {
  Card,
  TextField,
  Button,
  InlineStack,
  BlockStack,
  Text,
  Banner,
  Spinner,
  Badge,
  Box,
} from "@shopify/polaris";

const MAX_CHARS = 500;

const AnnouncementForm = ({
  text,
  setText,
  isSaving,
  saveError,
  saveSuccess,
  currentAnnouncement,
  isLoadingCurrent,
  handleSave,
  clearDraft,
  setSaveError,
}) => {
  const charsLeft = MAX_CHARS - text.length;
  const isOverLimit = charsLeft < 0;
  const isNearLimit = charsLeft <= 50 && charsLeft >= 0;

  const handleChange = (value) => {
    setText(value);
    if (saveError) setSaveError(null);
  };

  const charCountColor = isOverLimit
    ? "critical"
    : isNearLimit
    ? "caution"
    : "subdued";

  return (
    <BlockStack gap="400">
      {/* Success Banner */}
      {saveSuccess && (
        <Banner
          title="Announcement saved!"
          tone="success"
          onDismiss={() => {}}
        >
          <p>
            Your announcement has been saved to MongoDB and published to your
            Shopify storefront via metafield.
          </p>
        </Banner>
      )}

      {/* Error Banner */}
      {saveError && (
        <Banner
          title="Save failed"
          tone="critical"
          onDismiss={() => setSaveError(null)}
        >
          <p>{saveError}</p>
        </Banner>
      )}

      {/* Editor Card */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <Text variant="headingMd" as="h2">
              Write Announcement
            </Text>
            {text !== (localStorage.getItem("announcement_draft") || "") && (
              <Badge tone="attention">Unsaved changes</Badge>
            )}
            {text && text === localStorage.getItem("announcement_draft") && (
              <Badge tone="info">Draft saved</Badge>
            )}
          </InlineStack>

          <TextField
            label="Announcement text"
            labelHidden
            value={text}
            onChange={handleChange}
            placeholder="Enter announcement... e.g. 🎉 Sale 50% OFF — Today only!"
            multiline={4}
            autoComplete="off"
            maxLength={MAX_CHARS}
            showCharacterCount
            error={isOverLimit ? `Exceeds ${MAX_CHARS} character limit` : undefined}
          />

          {/* Character counter */}
          <InlineStack align="space-between">
            <Text variant="bodySm" tone={charCountColor}>
              {isOverLimit
                ? `${Math.abs(charsLeft)} characters over limit`
                : `${charsLeft} characters remaining`}
            </Text>
            <Text variant="bodySm" tone="subdued">
              {text.length} / {MAX_CHARS}
            </Text>
          </InlineStack>

          {/* Action buttons */}
          <InlineStack gap="300" align="start">
            <Button
              variant="primary"
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving || !text.trim() || isOverLimit}
              size="large"
            >
              {isSaving ? "Saving..." : "Save Announcement"}
            </Button>

            {text && (
              <Button
                variant="plain"
                onClick={clearDraft}
                disabled={isSaving}
              >
                Clear draft
              </Button>
            )}
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Live Preview Card */}
      {text && (
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingMd" as="h3">
                Preview
              </Text>
              <Badge tone="info">Live preview</Badge>
            </InlineStack>
            <Box
              background="bg-fill-info"
              padding="400"
              borderRadius="200"
              borderWidth="025"
              borderColor="border-info"
            >
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="bodyMd" fontWeight="medium">
                  📢 {text}
                </Text>
                <Text variant="bodySm" tone="subdued">
                  ✕
                </Text>
              </InlineStack>
            </Box>
            <Text variant="bodySm" tone="subdued">
              This is how your announcement banner will appear on the storefront.
            </Text>
          </BlockStack>
        </Card>
      )}

      {/* Current live announcement */}
      <Card>
        <BlockStack gap="200">
          <Text variant="headingMd" as="h3">
            Currently Live
          </Text>
          {isLoadingCurrent ? (
            <InlineStack gap="200">
              <Spinner size="small" />
              <Text tone="subdued">Loading from Shopify...</Text>
            </InlineStack>
          ) : currentAnnouncement ? (
            <Box
              background="bg-fill-success"
              padding="300"
              borderRadius="150"
            >
              <Text variant="bodyMd">{currentAnnouncement}</Text>
            </Box>
          ) : (
            <Text tone="subdued">
              No announcement is currently live on your storefront.
            </Text>
          )}
        </BlockStack>
      </Card>
    </BlockStack>
  );
};

export default AnnouncementForm;
