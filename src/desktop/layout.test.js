import {
  createFolder,
  defaultLayout,
  deleteFolder,
  moveIntoFolder,
  moveToDesktop,
  moveToDock,
  normalizeLayout,
} from "./layout";

test("moves an app off the dock, into a folder, and back", () => {
  const folderLayout = createFolder(defaultLayout());
  const folderId = folderLayout.desktop[0].id;

  const onDesktop = moveToDesktop(folderLayout, "notes", 40, 80);
  expect(onDesktop.dock).not.toContain("notes");
  expect(onDesktop.desktop.some((item) => item.id === "notes")).toBe(true);

  const inside = moveIntoFolder(onDesktop, "opentable", folderId);
  expect(inside.dock).not.toContain("opentable");
  expect(inside.folders[folderId].items).toEqual(["opentable"]);

  const removed = deleteFolder(inside, folderId);
  expect(removed.folders[folderId]).toBeUndefined();
  expect(removed.desktop.some((item) => item.id === "opentable")).toBe(true);

  const docked = moveToDock(removed, "notes", 0);
  expect(docked.dock[0]).toBe("notes");
  expect(docked.desktop.some((item) => item.id === "notes")).toBe(false);
});

test("puts a missing app back on the dock", () => {
  const layout = normalizeLayout({ dock: ["experiences"], desktop: [], folders: {} });
  expect(layout.dock).toEqual([
    "experiences",
    "opentable",
    "cibc",
    "cooperators",
    "projects",
    "notes",
  ]);
});
