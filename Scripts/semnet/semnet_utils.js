/**
 * Utility helpers for the semantic network UI.
 */

/**
 * Find a node within a network by id.
 * @param {Object} network - Network object containing nodes.
 * @param {number|string} id - Identifier to search for.
 * @returns {Object|undefined} The matching node if found.
 */
export function findNodeById(network, id) {
  if (!network || !Array.isArray(network.nodes)) return undefined;
  return network.nodes.find((node) => node.id === id);
}

/**
 * Create a truncated version of text with an ellipsis when needed.
 * @param {string} text - Full text content.
 * @param {number} maxLength - Maximum allowed length.
 * @returns {string} Truncated text.
 */
export function truncateText(text, maxLength = 120) {
  if (typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

/**
 * Select a random element from an array.
 * @template T
 * @param {T[]} list - Array to sample.
 * @returns {T|undefined} Random element or undefined when list is empty.
 */
export function randomChoice(list) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

/**
 * Format a similarity score for display.
 * @param {number} sim - Similarity value.
 * @returns {string} Formatted similarity string.
 */
export function formatSimilarity(sim) {
  if (typeof sim !== "number") return "";
  return `(${sim.toFixed(2)})`;
}
