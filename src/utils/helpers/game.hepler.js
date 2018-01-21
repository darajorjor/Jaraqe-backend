function isFull(tile) {
  if (tile && tile.value) {
    return tile
  }

  return null
}

export function checkSiblingTiles(pattern, rowIndex, columnIndex) {
  return {
    right: isFull(pattern[rowIndex] ? pattern[rowIndex][columnIndex + 1] : false),
    left: isFull(pattern[rowIndex] ? pattern[rowIndex][columnIndex - 1] : false),
    top: isFull(pattern[rowIndex - 1] ? pattern[rowIndex - 1][columnIndex] : false),
    bottom: isFull(pattern[rowIndex + 1] ? pattern[rowIndex + 1][columnIndex] : false),
  }
}