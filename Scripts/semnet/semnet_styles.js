const STYLE_ID = "semnet-styles";

export const styles = {
  container: "semnet-container",
  section: "semnet-section",
  title: "semnet-title",
  subtitle: "semnet-subtitle",
  select: "semnet-select",
  button: "semnet-button",
  neighborsContainer: "semnet-neighbors",
  neighborButton: "semnet-neighbor-button",
  finishButton: "semnet-finish-button",
  currentSentence: "semnet-current-sentence"
};

/**
 * Injects a small style block to keep the UI legible.
 */
export function injectStylesOnce() {
  if (document.getElementById(STYLE_ID)) return;
  const styleTag = document.createElement("style");
  styleTag.id = STYLE_ID;
  styleTag.textContent = `
    .${styles.container} {
      font-family: var(--font-interface, sans-serif);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.5rem;
    }
    .${styles.section} {
      background: var(--background-secondary, #f3f3f3);
      border: 1px solid var(--background-modifier-border, #d0d0d0);
      border-radius: 8px;
      padding: 0.75rem;
    }
    .${styles.title} {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }
    .${styles.subtitle} {
      color: var(--text-muted, #666);
      margin-bottom: 0.5rem;
    }
    .${styles.select} {
      width: 100%;
      padding: 0.45rem;
      border-radius: 6px;
      border: 1px solid var(--background-modifier-border, #ccc);
      background: var(--background-primary, #fff);
      font-size: 0.95rem;
    }
    .${styles.button} {
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--background-modifier-border, #ccc);
      background: var(--interactive-accent, #5b6ee1);
      color: #fff;
      cursor: pointer;
      margin-right: 0.5rem;
      font-size: 0.95rem;
    }
    .${styles.button}:hover {
      filter: brightness(0.95);
    }
    .${styles.neighborsContainer} {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .${styles.neighborButton} {
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      border: 1px solid var(--background-modifier-border, #ccc);
      background: var(--background-primary, #fff);
      cursor: pointer;
      text-align: left;
    }
    .${styles.neighborButton}:hover {
      background: var(--background-primary-alt, #f6f6ff);
    }
    .${styles.finishButton} {
      align-self: flex-start;
      background: var(--text-accent, #c0392b);
      color: #fff;
    }
    .${styles.currentSentence} {
      font-weight: 600;
      padding: 0.5rem;
      border-left: 3px solid var(--interactive-accent, #5b6ee1);
      background: var(--background-primary-alt, #f7f7f7);
      border-radius: 6px;
    }
  `;
  document.head.appendChild(styleTag);
}
