import { loadNetwork } from "./semnet_loader.js";
import { SEMNET_STATE } from "./semnet_state.js";
import { findNodeById, formatSimilarity, randomChoice, truncateText } from "./semnet_utils.js";
import { styles } from "./semnet_styles.js";

/**
 * Clear all children from a container element.
 * @param {HTMLElement} container
 */
function clear(container) {
  container.innerHTML = "";
}

/**
 * Render the view for selecting a semantic network from the index.
 * @param {HTMLElement} container
 */
export function renderNetworkSelector(container) {
  clear(container);
  container.classList.add(styles.container);

  const section = document.createElement("div");
  section.classList.add(styles.section);

  const title = document.createElement("div");
  title.classList.add(styles.title);
  title.textContent = "Select a semantic network:";
  section.appendChild(title);

  if (!Array.isArray(SEMNET_STATE.networkIndex) || SEMNET_STATE.networkIndex.length === 0) {
    const empty = document.createElement("div");
    empty.textContent = "No networks found in the index.";
    section.appendChild(empty);
    container.appendChild(section);
    return;
  }

  const select = document.createElement("select");
  select.classList.add(styles.select);
  SEMNET_STATE.networkIndex.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.id;
    option.textContent = entry.label || entry.id;
    select.appendChild(option);
  });
  section.appendChild(select);

  const buttonRow = document.createElement("div");
  const loadBtn = document.createElement("button");
  loadBtn.classList.add(styles.button);
  loadBtn.textContent = "Load network";

  const status = document.createElement("div");
  status.classList.add(styles.subtitle);

  loadBtn.addEventListener("click", async () => {
    const selectedId = select.value;
    const entry = SEMNET_STATE.networkIndex.find((item) => item.id === selectedId);
    if (!entry) {
      status.textContent = "Could not find selected network in index.";
      return;
    }
    status.textContent = "Loading network…";
    const network = await loadNetwork(entry.path);
    SEMNET_STATE.setActiveNetwork(network);
    status.textContent = "";
    renderSentenceSelector(container);
  });

  buttonRow.appendChild(loadBtn);
  section.appendChild(buttonRow);
  section.appendChild(status);
  container.appendChild(section);
}

/**
 * Render the sentence selection view for a loaded network.
 * @param {HTMLElement} container
 */
export function renderSentenceSelector(container) {
  clear(container);
  container.classList.add(styles.container);

  const { activeNetwork } = SEMNET_STATE;
  if (!activeNetwork) {
    const warn = document.createElement("div");
    warn.textContent = "Please load a network first.";
    container.appendChild(warn);
    return;
  }

  const section = document.createElement("div");
  section.classList.add(styles.section);

  const title = document.createElement("div");
  title.classList.add(styles.title);
  title.textContent = `Network: ${activeNetwork.id}`;
  section.appendChild(title);

  if (activeNetwork.description) {
    const desc = document.createElement("div");
    desc.classList.add(styles.subtitle);
    desc.textContent = activeNetwork.description;
    section.appendChild(desc);
  }

  const select = document.createElement("select");
  select.classList.add(styles.select);
  if (Array.isArray(activeNetwork.nodes)) {
    activeNetwork.nodes.forEach((node) => {
      const option = document.createElement("option");
      option.value = node.id;
      option.textContent = `${node.id}: ${truncateText(node.text || "", 140)}`;
      select.appendChild(option);
    });
  }
  section.appendChild(select);

  const buttons = document.createElement("div");

  const startBtn = document.createElement("button");
  startBtn.classList.add(styles.button);
  startBtn.textContent = "Start from this sentence";
  startBtn.addEventListener("click", () => {
    const selectedOption = select.options[select.selectedIndex];
    const nodeId = selectedOption ? selectedOption.value : null;
    if (nodeId === null) return;
    const parsedId = isNaN(Number(nodeId)) ? nodeId : Number(nodeId);
    SEMNET_STATE.setCurrentNodeId(parsedId);
    renderNeighborsView(container);
  });

  const randomBtn = document.createElement("button");
  randomBtn.classList.add(styles.button);
  randomBtn.textContent = "Start from random sentence";
  randomBtn.addEventListener("click", () => {
    const randomNode = randomChoice(activeNetwork.nodes);
    if (!randomNode) return;
    SEMNET_STATE.setCurrentNodeId(randomNode.id);
    renderNeighborsView(container);
  });

  buttons.appendChild(startBtn);
  buttons.appendChild(randomBtn);
  section.appendChild(buttons);
  container.appendChild(section);
}

/**
 * Render the neighbors view for walking the semantic network.
 * @param {HTMLElement} container
 */
export function renderNeighborsView(container) {
  clear(container);
  container.classList.add(styles.container);

  const node = SEMNET_STATE.getCurrentNode();
  if (!node) {
    const warn = document.createElement("div");
    warn.textContent = "Select a starting sentence to begin walking the network.";
    container.appendChild(warn);
    return;
  }

  const section = document.createElement("div");
  section.classList.add(styles.section);

  const title = document.createElement("div");
  title.classList.add(styles.title);
  title.textContent = `Current sentence (id: ${node.id})`;
  section.appendChild(title);

  const current = document.createElement("div");
  current.classList.add(styles.currentSentence);
  current.textContent = node.text || "(No text available)";
  section.appendChild(current);

  const neighborsContainer = document.createElement("div");
  neighborsContainer.classList.add(styles.neighborsContainer);

  if (!Array.isArray(node.neighbors) || node.neighbors.length === 0) {
    const none = document.createElement("div");
    none.textContent = "No neighbors found for this sentence.";
    neighborsContainer.appendChild(none);
  } else {
    node.neighbors.forEach((neighbor) => {
      const neighborNode = findNodeById(SEMNET_STATE.activeNetwork, neighbor.id);
      const button = document.createElement("button");
      button.classList.add(styles.neighborButton);
      const labelParts = [truncateText(neighborNode?.text || "", 160)];
      const simLabel = formatSimilarity(neighbor.sim);
      if (simLabel) {
        labelParts.push(simLabel);
      }
      button.textContent = labelParts.join(" ");
      button.addEventListener("click", () => {
        SEMNET_STATE.setCurrentNodeId(neighbor.id);
        renderNeighborsView(container);
      });
      neighborsContainer.appendChild(button);
    });
  }

  section.appendChild(neighborsContainer);

  const finishBtn = document.createElement("button");
  finishBtn.classList.add(styles.button, styles.finishButton);
  finishBtn.textContent = "Finish";
  finishBtn.addEventListener("click", () => {
    clear(container);
    const summary = document.createElement("div");
    summary.classList.add(styles.section);
    const visited = SEMNET_STATE.history.length;
    summary.textContent = `Walk finished. Visited ${visited} sentence${visited === 1 ? "" : "s"}.`;
    container.appendChild(summary);
  });

  section.appendChild(finishBtn);
  container.appendChild(section);
}
