// Priming screen: sets the psychological frame and provides the user
// gesture that unlocks Web Audio. Resolves when the user starts.
export function showWelcomeScreen(root: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const screen = document.createElement('div');
    screen.className = 'welcome';
    screen.innerHTML = `
      <div class="welcome-inner">
        <h1>GodView</h1>
        <p class="welcome-lead">You are about to see Earth as astronauts see it.</p>
        <p>
          Fewer than 600 people in history have watched our planet from space.
          Many returned changed — describing awe, a dissolving of borders,
          and a deep sense of care for the world below.
        </p>
        <p>Explore freely. And when you are ready&hellip; turn on the GodView.</p>
        <p class="welcome-hint">Headphones and fullscreen recommended.</p>
        <button class="welcome-start" type="button">Begin</button>
      </div>
    `;
    root.appendChild(screen);

    const button = screen.querySelector<HTMLButtonElement>('.welcome-start');
    button?.addEventListener(
      'click',
      () => {
        screen.classList.add('welcome-hidden');
        screen.addEventListener('transitionend', () => screen.remove(), { once: true });
        resolve();
      },
      { once: true },
    );
  });
}
