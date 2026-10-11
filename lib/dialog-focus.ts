/** A dialog may have been opened from another dialog whose trigger is now gone.
 * Return only when focus was lost; never override a newer focused control/modal. */
export function restoreDialogFocus(event: Event, trigger: HTMLElement | null, fallback: HTMLElement | null) {
  event.preventDefault();
  const document = trigger?.ownerDocument ?? fallback?.ownerDocument;
  if (!document) return;
  const active = document.activeElement;
  if (active && active !== document.body && active !== document.documentElement && active.isConnected) return;
  if (document.querySelector('[data-state="open"][data-slot="dialog-content"], [data-state="open"][data-slot="alert-dialog-content"]')) return;
  const available = (element: HTMLElement | null) => element?.isConnected && !element.matches(':disabled') && !element.closest('[hidden], [inert], [aria-hidden="true"]');
  const target = available(trigger) ? trigger : available(fallback) ? fallback : null;
  target?.focus({preventScroll: true});
}
