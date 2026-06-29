/**
 * Shopify Service
 * Reusable functions to interact with Shopify GraphQL Admin API
 * for managing shop metafields.
 */
import "dotenv/config";

const SHOPIFY_API_VERSION = "2025-01";

/**
 * Build the GraphQL endpoint URL for a shop
 */
const getGraphQLUrl = (shop) =>
  `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

/**
 * Execute a GraphQL query/mutation against the Shopify Admin API
 * @param {string} shop - Shop domain
 * @param {string} accessToken - Shop access token
 * @param {string} query - GraphQL query or mutation string
 * @param {object} variables - GraphQL variables
 */
const shopifyGraphQL = async (shop, accessToken, query, variables = {}) => {
  const response = await fetch(getGraphQLUrl(shop), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Shopify API HTTP ${response.status}: ${text}`
    );
  }

  const json = await response.json();

  // Surface GraphQL-level errors
  if (json.errors && json.errors.length > 0) {
    const messages = json.errors.map((e) => e.message).join(", ");
    throw new Error(`Shopify GraphQL errors: ${messages}`);
  }

  return json.data;
};

// ─── GraphQL Mutations & Queries ────────────────────────────────────────────

const METAFIELD_SET_MUTATION = `
  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        namespace
        key
        value
        type
        ownerType
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const METAFIELD_GET_QUERY = `
  query getShopMetafield($namespace: String!, $key: String!) {
    shop {
      metafield(namespace: $namespace, key: $key) {
        id
        namespace
        key
        value
        type
        updatedAt
      }
    }
  }
`;

const METAFIELD_DELETE_MUTATION = `
  mutation metafieldDelete($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`;

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Save (create or update) the announcement metafield on the shop
 * Namespace: my_app | Key: announcement
 *
 * @param {string} shop - Shop domain
 * @param {string} accessToken - Shop access token
 * @param {string} text - Announcement text
 * @returns {object} Created/updated metafield data
 */
export const saveAnnouncementMetafield = async (shop, accessToken, text) => {
  const data = await shopifyGraphQL(
    shop,
    accessToken,
    METAFIELD_SET_MUTATION,
    {
      metafields: [
        {
          ownerId: `gid://shopify/Shop/1`, // Will be resolved by Shopify for shop-level
          namespace: "my_app",
          key: "announcement",
          value: text,
          type: "single_line_text_field",
        },
      ],
    }
  );

  const { metafields, userErrors } = data.metafieldsSet;

  if (userErrors && userErrors.length > 0) {
    const messages = userErrors.map((e) => e.message).join(", ");
    throw new Error(`Metafield save error: ${messages}`);
  }

  return metafields[0];
};

/**
 * Get the current announcement metafield value from Shopify
 *
 * @param {string} shop - Shop domain
 * @param {string} accessToken - Shop access token
 * @returns {object|null} Metafield data or null if not set
 */
export const getAnnouncement = async (shop, accessToken) => {
  const data = await shopifyGraphQL(shop, accessToken, METAFIELD_GET_QUERY, {
    namespace: "my_app",
    key: "announcement",
  });

  return data?.shop?.metafield || null;
};

/**
 * Delete the announcement metafield from Shopify
 *
 * @param {string} shop - Shop domain
 * @param {string} accessToken - Shop access token
 * @param {string} metafieldId - GID of the metafield to delete
 * @returns {string} Deleted metafield ID
 */
export const deleteAnnouncement = async (shop, accessToken, metafieldId) => {
  const data = await shopifyGraphQL(
    shop,
    accessToken,
    METAFIELD_DELETE_MUTATION,
    {
      input: { id: metafieldId },
    }
  );

  const { deletedId, userErrors } = data.metafieldDelete;

  if (userErrors && userErrors.length > 0) {
    const messages = userErrors.map((e) => e.message).join(", ");
    throw new Error(`Metafield delete error: ${messages}`);
  }

  return deletedId;
};
