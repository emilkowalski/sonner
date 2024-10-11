'use server';
import { createStreamableUI } from 'ai/rsc';

export async function action() {
  'use server';
  let progress = 0;
  const ui = createStreamableUI('loading 0%');
  const interval = setInterval(() => {
    progress += 10;
    ui.update('loading ' + progress + '%');
    if (progress >= 100) {
      clearInterval(interval);
      ui.update('load complete');
    }
  }, 100);
  return ui.value;
}
