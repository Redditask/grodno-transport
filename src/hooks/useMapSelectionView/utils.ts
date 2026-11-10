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
