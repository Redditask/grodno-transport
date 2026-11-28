export const getCenterOffset = (
  container: HTMLElement,
  overlay: HTMLElement | null,
  clearButton: HTMLButtonElement | null,
): [number, number] => {
  if (!overlay) return [0, 0];

  const mapBounds = container.getBoundingClientRect();
  const overlayBounds = overlay.getBoundingClientRect();
  const coveredWidth = overlayBounds.right - mapBounds.left;
  const coveredHeight = overlayBounds.bottom - mapBounds.top;
  const markerClearance = 16;

  if (
    coveredWidth + markerClearance < mapBounds.width / 2 ||
    coveredHeight + markerClearance < mapBounds.height / 2
  ) {
    return [0, 0];
  }

  const bottomInset = clearButton ? mapBounds.bottom - clearButton.getBoundingClientRect().top : 0;
  const areaOnRight = (mapBounds.width - coveredWidth) * mapBounds.height;
  const areaBelow = (mapBounds.height - coveredHeight - bottomInset) * mapBounds.width;

  return areaOnRight > areaBelow ? [coveredWidth / 2, 0] : [0, (coveredHeight - bottomInset) / 2];
};

export const getRoutePadding = (
  container: HTMLElement,
  overlay: HTMLElement | null,
  clearButton: HTMLButtonElement | null,
) => {
  const map = container.getBoundingClientRect();
  const viewport = container.parentElement?.getBoundingClientRect() ?? map;
  const margin = 20;
  const padding = {
    top: Math.max(0, viewport.top - map.top) + margin,
    bottom: Math.max(0, map.bottom - viewport.bottom) + 32,
    left: margin,
    right: margin,
  };

  const panel = overlay?.getBoundingClientRect();
  if (!panel?.width || !panel.height) return padding;

  const left = Math.max(padding.left, panel.right - map.left + margin);
  const top = Math.max(padding.top, panel.bottom - map.top + margin);
  const bottom = clearButton
    ? Math.max(padding.bottom, map.bottom - clearButton.getBoundingClientRect().top + margin / 2)
    : padding.bottom;
  const areaOnRight =
    Math.max(0, map.width - left - padding.right) * (map.height - padding.top - padding.bottom);
  const areaBelow =
    (map.width - padding.left - padding.right) * Math.max(0, map.height - top - bottom);

  if (areaOnRight > areaBelow) return { ...padding, left };
  if (areaBelow > 0) return { ...padding, top, bottom };

  return padding;
};
