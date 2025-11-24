/**
 * Functions for loading semantic network data from the vault.
 */

/**
 * Load and parse JSON from a vault path.
 * @param {string} path - Vault-relative path to the JSON file.
 * @returns {Promise<any>} Parsed JSON contents.
 */
export async function loadJson(path) {
  const raw = await app.vault.adapter.read(path);
  return JSON.parse(raw);
}

/**
 * Load the network index file.
 * @param {string} indexPath - Vault-relative path to the index JSON.
 * @returns {Promise<Array>} Parsed index entries.
 */
export async function loadIndex(indexPath) {
  return loadJson(indexPath);
}

/**
 * Load a single semantic network file.
 * @param {string} path - Vault-relative path to the network JSON.
 * @returns {Promise<Object>} Parsed network object.
 */
export async function loadNetwork(path) {
  return loadJson(path);
}
