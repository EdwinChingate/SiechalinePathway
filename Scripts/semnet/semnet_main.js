import { loadIndex } from "./semnet_loader.js";
import { SEMNET_STATE } from "./semnet_state.js";
import { renderNetworkSelector } from "./semnet_ui.js";
import { injectStylesOnce } from "./semnet_styles.js";

/**
 * Entry point invoked from DataviewJS.
 * @param {Object} config - Configuration object.
 * @param {HTMLElement} config.container - Container provided by DataviewJS.
 * @param {string} config.indexPath - Vault-relative path to the network index JSON.
 */
export async function run(config = {}) {
  const { container, indexPath } = config;
  if (!container) {
    throw new Error("semnet: container is required in config");
  }
  if (!indexPath) {
    throw new Error("semnet: indexPath is required in config");
  }

  injectStylesOnce();

  const index = await loadIndex(indexPath);
  SEMNET_STATE.setIndex(index);
  renderNetworkSelector(container);
}
