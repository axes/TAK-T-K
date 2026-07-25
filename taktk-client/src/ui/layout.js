import { GAME_CONFIG, TOUCH_TARGETS, COLORS } from '../config.js';

export const DESKTOP_LAYOUT = Object.freeze({
  outerMargin: 24,
  columnGap: 16,
  panelPadding: 18,
  sectionGap: 16,
  smallGap: 8,
  headerHeight: 72,
  footerHeight: 18,
  leftSidebarWidth: 260,
  boardSize: 720,
  rightSidebarWidth: 380,
  cellSize: 90,
  gridSize: 8
});

function createRect(x, y, width, height) {
  return { x, y, width, height };
}

export function createDesktopTacticalLayout() {
  const viewport = createRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
  const { outerMargin, columnGap, panelPadding, sectionGap, headerHeight, footerHeight, leftSidebarWidth, boardSize, rightSidebarWidth, cellSize, gridSize } = DESKTOP_LAYOUT;
  const innerWidth = GAME_CONFIG.width - outerMargin * 2;
  const mainHeight = GAME_CONFIG.height - headerHeight - footerHeight;
  const centralWidth = boardSize;
  const header = createRect(outerMargin, 0, innerWidth, headerHeight);
  const headerLeft = createRect(outerMargin, 0, leftSidebarWidth, headerHeight);
  const headerCenter = createRect(headerLeft.x + leftSidebarWidth + columnGap, 0, centralWidth, headerHeight);
  const headerRight = createRect(headerCenter.x + centralWidth + columnGap, 0, rightSidebarWidth, headerHeight);
  const main = createRect(outerMargin, headerHeight, innerWidth, mainHeight);
  const leftSidebar = createRect(outerMargin, headerHeight, leftSidebarWidth, mainHeight);
  const boardArea = createRect(headerCenter.x, headerHeight, centralWidth, mainHeight);
  const rightSidebar = createRect(headerRight.x, headerHeight, rightSidebarWidth, mainHeight);
  const footer = createRect(outerMargin, headerHeight + mainHeight, innerWidth, footerHeight);
  const board = { ...createRect(boardArea.x, boardArea.y, boardSize, boardSize), cellSize };
  const leftContent = createRect(leftSidebar.x + panelPadding, leftSidebar.y + panelPadding, leftSidebar.width - panelPadding * 2, leftSidebar.height - panelPadding * 2);
  const rightContent = createRect(rightSidebar.x + panelPadding, rightSidebar.y + panelPadding, rightSidebar.width - panelPadding * 2, rightSidebar.height - panelPadding * 2);
  const unitInfo = createRect(rightContent.x, rightContent.y, rightContent.width, 150);
  const actions = createRect(rightContent.x, unitInfo.y + unitInfo.height + sectionGap, rightContent.width, 180);
  const controls = createRect(rightContent.x, rightContent.y + rightContent.height - 76, rightContent.width, 76);
  const description = createRect(rightContent.x, actions.y + actions.height + sectionGap, rightContent.width, controls.y - (actions.y + actions.height + sectionGap));
  const surrenderWidth = 48;
  const endTurn = createRect(controls.x, controls.y + 14, controls.width - surrenderWidth - sectionGap, 48);
  const surrenderButton = createRect(endTurn.x + endTurn.width + sectionGap, controls.y + 14, surrenderWidth, 48);

  const layout = {
    viewport, canvas: viewport, header, headerLeft, headerCenter, headerRight, main,
    leftSidebar: { ...leftSidebar, content: leftContent },
    boardArea: { ...boardArea, board: { ...board, cellSize: GAME_CONFIG.cellSize } },
    rightSidebar: { ...rightSidebar, content: rightContent, unitInfo, actions, description, controls, endTurn, surrenderButton },
    footer, cellSize: GAME_CONFIG.cellSize,
    // Alias conservado para consumidores existentes de HUD/Battle.
    sidebar: { ...rightSidebar, content: rightContent, unitInfo, actions, description, controls, endTurn, surrenderButton },
    boardRegion: board, board: { ...board, cellSize: GAME_CONFIG.cellSize },
    spacing: { outerPadding: outerMargin, contentGap: columnGap, sidebarPadding: panelPadding, sectionGap, headerHeight, footerHeight },
    touchTargets: TOUCH_TARGETS
  };

  if (GAME_CONFIG.width !== 1440 || GAME_CONFIG.height !== 810 || board.width !== board.height || board.width !== board.cellSize * gridSize || board.height !== board.cellSize * gridSize) {
    throw new Error('Desktop tactical layout: board dimensions are inconsistent');
  }
  return layout;
}

export function createDesktopPanel(scene, region, { borderColor = 0x00f5ff, fillColor = 0x111118, alpha = 1, depth = 10 } = {}) {
  return scene.add.rectangle(region.x + region.width / 2, region.y + region.height / 2, region.width, region.height, fillColor, alpha)
    .setStrokeStyle(1, borderColor, 0.45)
    .setDepth(depth);
}

export function createDesktopFooter(scene, layout, depth = 11) {
  return scene.add.text(layout.footer.x + 10, layout.footer.y + layout.footer.height / 2, 'TAK-T-K · VERSION TBD · COPYLEFT · AUTOR TBD · PROYECTO TBD', {
    fontFamily: 'monospace', fontSize: '8px', color: 'rgba(255,255,255,0.38)', letterSpacing: 1
  }).setOrigin(0, 0.5).setDepth(depth);
}

export function createDesktopChrome(scene, layout, { leftTitle = 'REGISTRO DE ACCIONES', leftLines = [], drawLeftPanel = true, drawRightPanel = true, showLeftContent = true } = {}) {
  const panelColor = 0x111118;
  const borderColor = 0x00f5ff;
  if (drawLeftPanel) createDesktopPanel(scene, layout.leftSidebar, { fillColor: panelColor, borderColor });
  if (drawRightPanel) createDesktopPanel(scene, layout.rightSidebar, { fillColor: panelColor, borderColor });
  const title = showLeftContent ? scene.add.text(layout.leftSidebar.content.x, layout.leftSidebar.content.y, leftTitle, { fontFamily: 'monospace', fontSize: '11px', fontStyle: 'bold', color: COLORS.player1, letterSpacing: 1 }).setDepth(11) : null;
  const lines = showLeftContent ? scene.add.text(layout.leftSidebar.content.x, layout.leftSidebar.content.y + 42, leftLines.join('\n'), { fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.48)', lineSpacing: 10, wordWrap: { width: layout.leftSidebar.content.width } }).setDepth(11) : null;
  const footerText = createDesktopFooter(scene, layout);
  return { title, lines, footerText };
}

// Reservado para una futura variante horizontal móvil. No se implementa ni
// se selecciona todavía.

export function centerOfCell(layout, x, y) {
  return {
    x: layout.board.x + x * layout.cellSize + layout.cellSize / 2,
    y: layout.board.y + y * layout.cellSize + layout.cellSize / 2
  };
}
