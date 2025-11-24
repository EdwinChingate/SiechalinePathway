import { findNodeById } from "./semnet_utils.js";

/**
 * Centralized runtime state for the semantic network walker.
 */
export const SEMNET_STATE = {
  networkIndex: [],
  activeNetwork: null,
  currentNodeId: null,
  history: [],

  /**
   * Reset all stored state values.
   */
  reset() {
    this.networkIndex = [];
    this.activeNetwork = null;
    this.currentNodeId = null;
    this.history = [];
  },

  /**
   * Store the loaded network index.
   * @param {Array} index - Index entries from the index JSON.
   */
  setIndex(index) {
    this.networkIndex = Array.isArray(index) ? index : [];
  },

  /**
   * Register a network as active and reset navigation values.
   * @param {Object} network - Network JSON object.
   */
  setActiveNetwork(network) {
    this.activeNetwork = network || null;
    this.currentNodeId = null;
    this.history = [];
  },

  /**
   * Set the current node id and append it to history.
   * @param {number|string|null} id - Node identifier to set.
   */
  setCurrentNodeId(id) {
    this.currentNodeId = id;
    if (id !== null && id !== undefined) {
      this.history.push(id);
    }
  },

  /**
   * Retrieve the current node object.
   * @returns {Object|null} Current node or null when none is selected.
   */
  getCurrentNode() {
    if (!this.activeNetwork || this.currentNodeId === null || this.currentNodeId === undefined) {
      return null;
    }
    return findNodeById(this.activeNetwork, this.currentNodeId) || null;
  }
};
