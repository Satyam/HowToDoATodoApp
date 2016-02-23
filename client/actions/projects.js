export const TOGGLE_COMPLETED = 'Toggle task completed';

export function toggleCompleted(pid, tid) {
  return {
    type: TOGGLE_COMPLETED,
    pid,
    tid,
  };
}
