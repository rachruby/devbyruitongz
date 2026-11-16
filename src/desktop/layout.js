export const APP_IDS = ["experiences", "opentable", "cibc", "cooperators", "projects", "notes", "news"];

const APP_SET = new Set(APP_IDS);

export function defaultLayout() {
  return {
    dock: [...APP_IDS],
    desktop: [],
    folders: {},
  };
}

function spotFor(desktop) {
  const used = new Set(desktop.map((item) => `${item.x},${item.y}`));
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const x = 28 + col * 108;
      const y = 24 + row * 118;
      if (!used.has(`${x},${y}`)) {
        return { x, y };
      }
    }
  }
  return { x: 28, y: 24 };
}

function blank() {
  return { dock: [], desktop: [], folders: {} };
}

export function normalizeLayout(value) {
  const next = blank();
  const seen = new Set();
  const source = value && typeof value === "object" ? value : {};
  const folders = source.folders && typeof source.folders === "object" ? source.folders : {};

  Object.entries(folders).forEach(([id, folder]) => {
    if (!id.startsWith("folder-") || !folder || typeof folder !== "object") {
      return;
    }
    const items = Array.isArray(folder.items) ? folder.items.filter((item) => APP_SET.has(item) && !seen.has(item)) : [];
    items.forEach((item) => seen.add(item));
    const name = String(folder.name || "untitled folder").trim().slice(0, 40) || "untitled folder";
    next.folders[id] = { name, items };
  });

  const claim = (id) => {
    if (seen.has(id)) {
      return false;
    }
    if (!APP_SET.has(id) && !next.folders[id]) {
      return false;
    }
    seen.add(id);
    return true;
  };

  if (Array.isArray(source.dock)) {
    source.dock.forEach((id) => {
      if (claim(id)) {
        next.dock.push(id);
      }
    });
  }

  if (Array.isArray(source.desktop)) {
    source.desktop.forEach((item) => {
      if (!item || !claim(item.id)) {
        return;
      }
      const x = Number.isFinite(item.x) ? item.x : 28;
      const y = Number.isFinite(item.y) ? item.y : 24;
      next.desktop.push({ id: item.id, x, y });
    });
  }

  APP_IDS.forEach((id) => {
    if (!seen.has(id)) {
      next.dock.push(id);
    }
  });

  Object.keys(next.folders).forEach((id) => {
    if (!seen.has(id)) {
      const spot = spotFor(next.desktop);
      next.desktop.push({ id, ...spot });
      seen.add(id);
    }
  });

  return next;
}

export function loadLayout(raw) {
  if (!raw) {
    return defaultLayout();
  }
  try {
    return normalizeLayout(JSON.parse(raw));
  } catch {
    return defaultLayout();
  }
}

function without(layout, id) {
  const folders = {};
  Object.entries(layout.folders).forEach(([folderId, folder]) => {
    folders[folderId] = {
      name: folder.name,
      items: folder.items.filter((item) => item !== id),
    };
  });
  return {
    dock: layout.dock.filter((item) => item !== id),
    desktop: layout.desktop.filter((item) => item.id !== id),
    folders,
  };
}

export function homeOf(layout, id) {
  if (layout.dock.includes(id)) {
    return "dock";
  }
  if (layout.desktop.some((item) => item.id === id)) {
    return "desktop";
  }
  if (Object.values(layout.folders).some((folder) => folder.items.includes(id))) {
    return "folder";
  }
  return null;
}

export function createFolder(layout, id = `folder-${Math.random().toString(36).slice(2, 10)}`) {
  if (layout.folders[id]) {
    return layout;
  }
  const spot = spotFor(layout.desktop);
  return {
    ...layout,
    desktop: [...layout.desktop, { id, ...spot }],
    folders: {
      ...layout.folders,
      [id]: { name: "untitled folder", items: [] },
    },
  };
}

export function renameFolder(layout, id, name) {
  const folder = layout.folders[id];
  if (!folder) {
    return layout;
  }
  const clean = String(name || "").replace(/[<>]/g, "").slice(0, 40);
  return {
    ...layout,
    folders: {
      ...layout.folders,
      [id]: { ...folder, name: clean },
    },
  };
}

export function deleteFolder(layout, id) {
  const folder = layout.folders[id];
  if (!folder) {
    return layout;
  }
  const next = without(layout, id);
  const folders = { ...next.folders };
  delete folders[id];
  let desktop = next.desktop;
  folder.items.forEach((appId) => {
    desktop = [...desktop, { id: appId, ...spotFor(desktop) }];
  });
  return { ...next, folders, desktop };
}

export function moveToDesktop(layout, id, x, y) {
  if (!APP_SET.has(id) && !layout.folders[id]) {
    return layout;
  }
  const next = without(layout, id);
  return {
    ...next,
    desktop: [...next.desktop, { id, x, y }],
  };
}

export function moveToDock(layout, id, index) {
  if (!APP_SET.has(id) && !layout.folders[id]) {
    return layout;
  }
  const next = without(layout, id);
  const at = Math.max(0, Math.min(index ?? next.dock.length, next.dock.length));
  const dock = [...next.dock];
  dock.splice(at, 0, id);
  return { ...next, dock };
}

export function moveIntoFolder(layout, id, folderId) {
  if (!APP_SET.has(id) || !layout.folders[folderId]) {
    return layout;
  }
  const next = without(layout, id);
  const folder = next.folders[folderId];
  return {
    ...next,
    folders: {
      ...next.folders,
      [folderId]: { ...folder, items: [...folder.items, id] },
    },
  };
}
