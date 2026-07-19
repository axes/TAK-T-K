import { GAME_CONFIG, TOUCH_TARGETS } from '../config.js';

const OUTER_PADDING = 16;
const HEADER_HEIGHT = 64;
const CONTENT_GAP = 24;
const SIDEBAR_WIDTH = 300;
const SIDEBAR_PADDING = 16;

function createRect(x, y, width, height) {
  return { x, y, width, height };
}

export function createDesktopTacticalLayout() {
  const viewport = createRect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
  const boardSize = GAME_CONFIG.cellSize * GAME_CONFIG.gridCols;
  const contentGroupWidth = boardSize + CONTENT_GAP + SIDEBAR_WIDTH;
  const contentGroup = createRect(158, 72, contentGroupWidth, boardSize);

  // El header comparte el ancho del bloque tablero + sidebar para evitar
  // que se perciba flotando sobre una composición más estrecha.
  const header = createRect(
    contentGroup.x,
    0,
    contentGroup.width,
    HEADER_HEIGHT
  );

  const main = createRect(
    contentGroup.x,
    contentGroup.y,
    contentGroup.width,
    contentGroup.height
  );

  const sidebar = createRect(
    contentGroup.x + boardSize + CONTENT_GAP,
    contentGroup.y,
    SIDEBAR_WIDTH,
    boardSize
  );

  sidebar.content = createRect(
    sidebar.x + 20,
    sidebar.y + 20,
    sidebar.width - 40,
    sidebar.height - 40
  );
  sidebar.unitInfo = createRect(sidebar.content.x, sidebar.content.y, sidebar.content.width, 132);
  sidebar.actions = createRect(sidebar.content.x, sidebar.y + 172, sidebar.content.width, 160);
  sidebar.description = createRect(sidebar.content.x, sidebar.y + 348, sidebar.content.width, 148);
  sidebar.endTurn = createRect(sidebar.content.x, sidebar.y + 548, sidebar.content.width, 48);
  sidebar.surrender = createRect(sidebar.content.x, sidebar.y + 608, sidebar.content.width, 20);
  sidebar.surrenderButton = createRect(sidebar.endTurn.x + 204 + 8, sidebar.endTurn.y, 48, 48);

  const boardRegion = createRect(
    contentGroup.x,
    contentGroup.y,
    boardSize,
    boardSize
  );

  const board = { ...boardRegion };

  return {
    viewport,
    header,
    main,
    contentGroup,
    boardRegion,
    board,
    sidebar,
    cellSize: GAME_CONFIG.cellSize,
    spacing: {
      outerPadding: OUTER_PADDING,
      contentGap: CONTENT_GAP,
      sidebarPadding: SIDEBAR_PADDING,
      headerHeight: HEADER_HEIGHT
    },
    touchTargets: TOUCH_TARGETS
  };
}

// Reservado para una futura variante horizontal móvil. No se implementa ni
// se selecciona todavía.

export function centerOfCell(layout, x, y) {
  return {
    x: layout.board.x + x * layout.cellSize + layout.cellSize / 2,
    y: layout.board.y + y * layout.cellSize + layout.cellSize / 2
  };
}
