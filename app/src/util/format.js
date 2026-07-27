/**
 * Render a number of seconds as HH:MM:SS.
 *
 * @param {number} time seconds
 * @returns {string}
 */
export function formatTime(time) {
  const total = Number.parseInt(String(time), 10) || 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total - hours * 3600) / 60);
  const seconds = total - hours * 3600 - minutes * 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
