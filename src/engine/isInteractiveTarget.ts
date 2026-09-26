/** Controls embedded in slides keep their own click and keyboard behaviour. */
export function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(
    'button, a, input, textarea, select, [role="tab"], [role="slider"], [role="switch"], [contenteditable="true"], [data-slide-interactive]',
  ))
}
