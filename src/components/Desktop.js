import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { experiences } from "../data/experience";
import { projects } from "../data/projects";
import opentableLogo from "../assets/logos/opentable.svg";
import cibcLogo from "../assets/logos/cibc.svg";
import cooperatorsLogo from "../assets/logos/cooperators.svg";
import wallpaper from "../assets/img/bg.png";
import brandLogo from "../assets/img/dev-by-ruitong.png";
import { skills, profiles, mlhProfile } from "../data/skills";
import { Finder } from "./Finder";
import { Notes } from "./Notes";
import {
  APP_IDS,
  createFolder,
  deleteFolder,
  homeOf,
  loadLayout,
  moveIntoFolder,
  moveToDesktop,
  moveToDock,
  renameFolder,
} from "../desktop/layout";
import "./Desktop.css";

const STORAGE_KEY = "rz-desktop-layout";
const logos = {
  opentable: opentableLogo,
  cibc: cibcLogo,
  cooperators: cooperatorsLogo,
};
const labels = {
  experiences: "Experiences",
  opentable: "OpenTable",
  cibc: "CIBC",
  cooperators: "Co-operators",
  projects: "Projects",
  notes: "Notes",
  news: "News",
};

function formatMenuClock(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h12",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("weekday")} ${get("month")} ${get("day")}  ${get("hour")}:${get("minute")} ${get("dayPeriod").toUpperCase()}`;
}

function ExperiencesGlyph() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="12" width="20" height="20" rx="5" fill="#fff" />
      <rect x="34" y="12" width="20" height="20" rx="5" fill="#fff" opacity="0.72" />
      <rect x="22" y="32" width="20" height="20" rx="5" fill="#fff" opacity="0.88" />
    </svg>
  );
}

function FolderGlyph({ user }) {
  return (
    <svg viewBox="0 0 64 52" aria-hidden="true">
      <path d="M4 16c0-3.4 2.6-6 6-6h16l5 6h23c3.4 0 6 2.6 6 6v22c0 3.4-2.6 6-6 6H10c-3.4 0-6-2.6-6-6V16z" fill={user ? "#3d8eef" : "#4c97ef"} />
      <path d="M4 24h56v20c0 3.4-2.6 6-6 6H10c-3.4 0-6-2.6-6-6V24z" fill={user ? "#f6d36b" : "#8ec4ff"} />
    </svg>
  );
}

function NewsGlyph() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="10" width="48" height="44" rx="6" fill="#fff" />
      <rect x="14" y="18" width="16" height="12" rx="2" fill="#7a5cff" />
      <path d="M34 20h14M34 26h14M14 38h34M14 44h22" stroke="#3d3654" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ProfileGlyph({ id }) {
  if (id === "github") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.5-1.08-1.78-.2-3.65-.89-3.65-3.96 0-.88.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.27.83 2.15 0 3.08-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 8 0z" />
      </svg>
    );
  }
  if (id === "devpost") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" d="M2 2h5.2v5.2H2zM8.8 2H14v5.2H8.8zM2 8.8h5.2V14H2zM8.8 8.8H14V14H8.8z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path fill="currentColor" d="M3.6 6.2H1.2V14h2.4V6.2zM2.4 1.4A1.4 1.4 0 1 0 2.4 4.2 1.4 1.4 0 0 0 2.4 1.4zM14.8 8.7c0-1.9-1-2.8-2.4-2.8-1.1 0-1.8.6-2.1 1.2h-.1V6.2H8v7.8h2.3V9.6c0-1.2.2-2.3 1.7-2.3 1.4 0 1.4 1.3 1.4 2.4V14h2.4V8.7z" />
    </svg>
  );
}

function NotesGlyph() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="8" width="44" height="48" rx="6" fill="#ffe56a" />
      <path d="M18 24h28M18 32h28M18 40h18" stroke="#8a6a12" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function TrafficGlyph({ kind }) {
  const paths = {
    close: "M3.2 3.2l5.6 5.6M8.8 3.2L3.2 8.8",
    min: "M2.6 6h6.8",
    zoom: "M6 2.8v6.4M2.8 6h6.4",
  };
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d={paths[kind]} />
    </svg>
  );
}

function labelFor(layout, id) {
  const folderName = layout.folders[id]?.name?.trim();
  return folderName || labels[id] || "untitled folder";
}

function AppFace({ id, userFolder }) {
  if (id === "experiences") {
    return <span className="desk-icon desk-icon-experiences"><ExperiencesGlyph /></span>;
  }
  if (id === "notes") {
    return <span className="desk-icon desk-icon-notes"><NotesGlyph /></span>;
  }
  if (id === "news") {
    return <span className="desk-icon desk-icon-news"><NewsGlyph /></span>;
  }
  if (id === "projects" || userFolder) {
    return <span className="desk-icon desk-icon-folder"><FolderGlyph user={userFolder} /></span>;
  }
  return (
    <span className="desk-icon">
      <img src={logos[id]} alt="" />
    </span>
  );
}

export const Desktop = () => {
  const [layout, setLayout] = useState(() => loadLayout(window.localStorage.getItem(STORAGE_KEY)));
  const [openId, setOpenId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [finderView, setFinderView] = useState("column");
  const [projectId, setProjectId] = useState(projects[0].id);
  const [now, setNow] = useState(() => new Date());
  const [caret, setCaret] = useState("50%");
  const [drag, setDrag] = useState(null);
  const buttonRefs = useRef({});
  const suppressClick = useRef(false);
  const dialogRef = useRef(null);
  const surfaceRef = useRef(null);
  const lastId = useRef(null);
  const wasOpen = useRef(false);
  const titleId = useId();

  const role = experiences.find((item) => item.id === openId) ?? null;
  const openFolder = layout.folders[openId] ? openId : null;
  const experiencesOpen = openId === "experiences";
  const projectsOpen = openId === "projects";
  const notesOpen = openId === "notes";
  const menuName = role
    ? role.company
    : experiencesOpen
      ? "Experiences"
      : projectsOpen
        ? "Finder"
        : notesOpen
          ? "Notes"
          : openId === "news"
            ? "News"
            : openFolder
            ? layout.folders[openFolder].name
            : "Desktop";

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openId) {
      return undefined;
    }
    const onKey = (event) => {
      const typing = ["INPUT", "TEXTAREA"].includes(event.target.tagName);
      if (event.key === "Escape") {
        event.preventDefault();
        setZoomed(false);
        setOpenId(null);
        return;
      }
      if (typing || openId !== "projects") {
        return;
      }
      const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
      const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
      if (!forward && !backward) {
        return;
      }
      event.preventDefault();
      setProjectId((current) => {
        const index = projects.findIndex((project) => project.id === current);
        const next = (index + (forward ? 1 : -1) + projects.length) % projects.length;
        return projects[next].id;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Delete" && event.key !== "Backspace") {
        return;
      }
      if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) {
        return;
      }
      if (!selectedId || !layout.folders[selectedId]) {
        return;
      }
      event.preventDefault();
      setLayout((current) => deleteFolder(current, selectedId));
      setOpenId((current) => (current === selectedId ? null : current));
      setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout.folders, selectedId]);

  useEffect(() => {
    if (openId) {
      wasOpen.current = true;
      lastId.current = openId;
      dialogRef.current?.focus();
      return;
    }
    if (wasOpen.current && lastId.current) {
      buttonRefs.current[lastId.current]?.focus();
    }
  }, [openId]);

  useLayoutEffect(() => {
    if (!openId) {
      return undefined;
    }
    const placeCaret = () => {
      const button = buttonRefs.current[openId];
      const windowEl = dialogRef.current;
      if (!button || !windowEl) {
        return;
      }
      const icon = button.getBoundingClientRect();
      const frame = windowEl.getBoundingClientRect();
      if (!frame.width) {
        return;
      }
      const center = icon.left + icon.width / 2;
      const percent = ((center - frame.left) / frame.width) * 100;
      setCaret(`${Math.min(90, Math.max(10, percent))}%`);
    };
    placeCaret();
    const frame = window.requestAnimationFrame(placeCaret);
    const timer = window.setTimeout(placeCaret, 460);
    window.addEventListener("resize", placeCaret);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      window.removeEventListener("resize", placeCaret);
    };
  }, [openId, zoomed, layout]);

  const toggle = (id) => {
    setSelectedId(id);
    setZoomed(false);
    setOpenId((current) => (current === id ? null : id));
  };

  const close = () => {
    setZoomed(false);
    setOpenId(null);
  };

  const onStageMouseDown = (event) => {
    if (event.target.closest(".desk-window") || event.target.closest(".desk-app") || event.target.closest(".desk-menu")) {
      return;
    }
    setSelectedId(null);
    if (openId) {
      close();
    }
  };

  const addFolder = () => {
    const id = `folder-${Math.random().toString(36).slice(2, 10)}`;
    setLayout((current) => createFolder(current, id));
    setSelectedId(id);
    setOpenId(id);
  };

  const removeSelectedFolder = () => {
    if (!selectedId || !layout.folders[selectedId]) {
      return;
    }
    const id = selectedId;
    setLayout((current) => deleteFolder(current, id));
    setOpenId((current) => (current === id ? null : current));
    setSelectedId(null);
  };

  const placeOnDesktop = (id) => {
    const surface = surfaceRef.current?.getBoundingClientRect();
    const x = surface ? Math.max(16, surface.width / 2 - 48) : 40;
    const y = surface ? 36 : 36;
    setLayout((current) => moveToDesktop(current, id, x, y));
  };

  const startDrag = (event, id) => {
    if (event.button !== 0) {
      return;
    }
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;
    const move = (pointer) => {
      if (!moved && Math.hypot(pointer.clientX - startX, pointer.clientY - startY) < 5) {
        return;
      }
      moved = true;
      setDrag({
        id,
        x: pointer.clientX,
        y: pointer.clientY,
        target: dropTarget(pointer.clientX, pointer.clientY, id),
      });
    };
    const up = (pointer) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDrag(null);
      if (!moved) {
        return;
      }
      suppressClick.current = true;
      const target = dropTarget(pointer.clientX, pointer.clientY, id);
      if (target.type === "dock") {
        setLayout((current) => moveToDock(current, id, dockIndex(pointer.clientX, id)));
      } else if (target.type === "folder") {
        setLayout((current) => moveIntoFolder(current, id, target.id));
      } else {
        const surface = surfaceRef.current?.getBoundingClientRect();
        const x = surface ? pointer.clientX - surface.left - 48 : 40;
        const y = surface ? pointer.clientY - surface.top - 36 : 40;
        setLayout((current) => moveToDesktop(current, id, Math.max(8, x), Math.max(8, y)));
      }
      setSelectedId(id);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const renderIcon = (id, placed) => {
    const userFolder = Boolean(layout.folders[id]);
    const name = labelFor(layout, id);
    const spot = placed ? layout.desktop.find((item) => item.id === id) : null;
    return (
      <button
        key={id}
        type="button"
        className={`desk-app${placed ? " is-placed" : ""}${openId === id ? " is-open" : ""}${selectedId === id ? " is-selected" : ""}${drag?.target?.type === "folder" && drag.target.id === id ? " is-drop" : ""}`}
        style={placed && spot ? { left: spot.x, top: spot.y } : undefined}
        aria-pressed={openId === id}
        aria-expanded={openId === id}
        aria-label={`Open ${name}`}
        data-dock-id={placed ? undefined : id}
        data-folder-id={userFolder ? id : undefined}
        ref={(node) => {
          buttonRefs.current[id] = node;
        }}
        onPointerDown={(event) => startDrag(event, id)}
        onClick={(event) => {
          if (suppressClick.current) {
            suppressClick.current = false;
            event.preventDefault();
            return;
          }
          toggle(id);
        }}
      >
        <AppFace id={id} userFolder={userFolder} />
        <span className="desk-label">{name}</span>
      </button>
    );
  };

  const placeActions = (id) => {
    if (!APP_IDS.includes(id) && !layout.folders[id]) {
      return null;
    }
    const home = homeOf(layout, id);
    return (
      <div className="desk-place">
        {home !== "desktop" && (
          <button type="button" onClick={() => placeOnDesktop(id)}>Move to the desktop</button>
        )}
        {home !== "dock" && (
          <button type="button" onClick={() => setLayout((current) => moveToDock(current, id, current.dock.length))}>
            Move to the dock
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="desk" style={{ backgroundImage: `url(${wallpaper})` }}>
      <header className="desk-menu">
        <div className="desk-menu-left">
          <img className="desk-logo" src={brandLogo} alt="Dev by Ruitong" />
          <span className="desk-menu-app">{menuName}</span>
          <button type="button" className="desk-menu-action" onClick={addFolder}>New Folder</button>
          <button
            type="button"
            className="desk-menu-action"
            onClick={removeSelectedFolder}
            disabled={!layout.folders[selectedId]}
          >
            Delete Folder
          </button>
          <span className="desk-menu-name">Ruitong Zhang</span>
        </div>
        <div className="desk-menu-right">
          <nav className="desk-status" aria-label="Skills">
            {skills.map((skill) => (
              <span className="desk-status-item" key={skill}>{skill}</span>
            ))}
          </nav>
          <nav className="desk-social" aria-label="Portfolios">
            {profiles.map((profile) => (
              <a key={profile.id} href={profile.href} target="_blank" rel="noopener noreferrer" aria-label={profile.label}>
                <ProfileGlyph id={profile.id} />
              </a>
            ))}
          </nav>
          <span className="desk-city">Toronto</span>
          <time dateTime={now.toISOString()}>{formatMenuClock(now)}</time>
        </div>
      </header>

      <main className="desk-stage" onMouseDown={onStageMouseDown}>
        <div className="desk-surface" ref={surfaceRef} data-surface="true">
          {layout.desktop.map((item) => renderIcon(item.id, true))}
        </div>

        <div
          className={`desk-island${layout.dock.length === 0 ? " is-empty" : ""}${drag?.target?.type === "dock" ? " is-target" : ""}`}
          role="toolbar"
          aria-label="Dock"
        >
          {layout.dock.map((id) => renderIcon(id, false))}
          {layout.dock.length === 0 && <span className="desk-dock-empty">Drop apps here</span>}
        </div>

        <div className="desk-slot">
          {experiencesOpen && (
            <article className={`desk-window${zoomed ? " is-zoomed" : ""}`} role="dialog" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef} style={{ "--caret": zoomed ? "50%" : caret }}>
              <WindowChrome titleId={titleId} title="Experiences" zoomed={zoomed} onClose={close} onZoom={() => setZoomed((value) => !value)} glyph={<ExperiencesGlyph />} />
              <div className="desk-body">
                <p className="desk-lead">Pick a company to read the role.</p>
                <div className="desk-roster">
                  {experiences.map((item) => (
                    <button key={item.id} type="button" className="desk-roster-item" onClick={() => toggle(item.id)}>
                      <span className="desk-roster-logo"><img src={logos[item.id]} alt="" /></span>
                      <span className="desk-roster-copy">
                        <strong>{item.company}</strong>
                        <span>{item.title}</span>
                        <span>{item.dates}</span>
                      </span>
                    </button>
                  ))}
                </div>
                {placeActions("experiences")}
              </div>
            </article>
          )}

          {role && (
            <article key={role.id} className={`desk-window${zoomed ? " is-zoomed" : ""}`} role="dialog" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef} style={{ "--caret": zoomed ? "50%" : caret, "--accent": role.accent }}>
              <WindowChrome titleId={titleId} title={role.company} zoomed={zoomed} onClose={close} onZoom={() => setZoomed((value) => !value)} logo={logos[role.id]} />
              <div className="desk-body">
                {role.parent && <p className="desk-parent">{role.parent}</p>}
                <p className="desk-role">{role.title}</p>
                <p className="desk-meta">
                  <span>{role.dates}</span>
                  <span className="desk-dot" aria-hidden="true" />
                  <span>{role.location}</span>
                </p>
                <ul>
                  {role.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
                {placeActions(role.id)}
              </div>
            </article>
          )}

          {projectsOpen && (
            <article className={`desk-window is-finder${zoomed ? " is-zoomed" : ""}`} role="dialog" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef} style={{ "--caret": zoomed ? "50%" : caret }}>
              <WindowChrome titleId={titleId} title="Projects" zoomed={zoomed} onClose={close} onZoom={() => setZoomed((value) => !value)} glyph={<FolderGlyph />} />
              <Finder view={finderView} onView={setFinderView} selectedId={projectId} onSelect={setProjectId} />
              {placeActions("projects")}
            </article>
          )}

          {openId === "news" && (
            <article className={`desk-window is-news${zoomed ? " is-zoomed" : ""}`} role="dialog" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef} style={{ "--caret": zoomed ? "50%" : caret }}>
              <WindowChrome titleId={titleId} title="News" zoomed={zoomed} onClose={close} onZoom={() => setZoomed((value) => !value)} glyph={<NewsGlyph />} />
              <div className="desk-body news-body">
                <p className="desk-parent">MLH Top 50 · 2025</p>
                <p className="desk-role">Rachel Zhang</p>
                <p className="desk-lead">This is my MLH Top 50 portfolio.</p>
                <p><a href={mlhProfile} target="_blank" rel="noopener noreferrer">Open the MLH Top 50 profile</a></p>
                <iframe className="news-frame" title="MLH Top 50 profile" src={mlhProfile} />
              </div>
              {placeActions("news")}
            </article>
          )}

          {notesOpen && (
            <article className={`desk-window is-notes${zoomed ? " is-zoomed" : ""}`} role="dialog" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef} style={{ "--caret": zoomed ? "50%" : caret }}>
              <WindowChrome titleId={titleId} title="Notes" zoomed={zoomed} onClose={close} onZoom={() => setZoomed((value) => !value)} glyph={<NotesGlyph />} />
              <Notes />
              {placeActions("notes")}
            </article>
          )}

          {openFolder && (
            <article className={`desk-window${zoomed ? " is-zoomed" : ""}`} role="dialog" aria-labelledby={titleId} tabIndex={-1} ref={dialogRef} style={{ "--caret": zoomed ? "50%" : caret }} data-folder-id={openFolder}>
              <WindowChrome titleId={titleId} title={layout.folders[openFolder].name} zoomed={zoomed} onClose={close} onZoom={() => setZoomed((value) => !value)} glyph={<FolderGlyph user />} />
              <div className="desk-body">
                <label className="folder-rename">
                  Folder name
                  <input
                    value={layout.folders[openFolder].name}
                    onChange={(event) => setLayout((current) => renameFolder(current, openFolder, event.target.value))}
                  />
                </label>
                {layout.folders[openFolder].items.length === 0 ? (
                  <p className="desk-lead">This folder is empty. Drag an app onto it.</p>
                ) : (
                  <div className="folder-items">
                    {layout.folders[openFolder].items.map((id) => (
                      <div key={id} className="folder-row">
                        <button type="button" onClick={() => toggle(id)}>Open {labelFor(layout, id)}</button>
                        <button type="button" onClick={() => setLayout((current) => moveToDock(current, id, current.dock.length))}>
                          Move to the dock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {placeActions(openFolder)}
              </div>
            </article>
          )}

          {!openId && <p className="desk-hint">Drag apps on or off the dock. New Folder makes a folder you can fill.</p>}
        </div>

        {drag && (
          <div className="desk-ghost" style={{ left: drag.x, top: drag.y }}>
            <AppFace id={drag.id} userFolder={Boolean(layout.folders[drag.id])} />
            <span>{labelFor(layout, drag.id)}</span>
          </div>
        )}
      </main>
    </div>
  );
};

function dropTarget(x, y, fromId) {
  const stack = document.elementsFromPoint(x, y);
  for (const element of stack) {
    const folder = element.closest?.("[data-folder-id]");
    if (folder && folder.dataset.folderId !== fromId) {
      return { type: "folder", id: folder.dataset.folderId };
    }
    if (element.closest?.(".desk-island")) {
      return { type: "dock" };
    }
  }
  return { type: "desktop" };
}

function dockIndex(x, draggingId) {
  const slots = [...document.querySelectorAll("[data-dock-id]")].filter((node) => node.dataset.dockId !== draggingId);
  for (let index = 0; index < slots.length; index += 1) {
    const rect = slots[index].getBoundingClientRect();
    if (x < rect.left + rect.width / 2) {
      return index;
    }
  }
  return slots.length;
}

function WindowChrome({ titleId, title, zoomed, onClose, onZoom, glyph, logo }) {
  return (
    <div className="desk-titlebar">
      <div className="desk-traffic">
        <button type="button" className="desk-light is-close" aria-label="Close" onClick={onClose}>
          <TrafficGlyph kind="close" />
        </button>
        <button type="button" className="desk-light is-min" aria-label="Minimize" onClick={onClose}>
          <TrafficGlyph kind="min" />
        </button>
        <button type="button" className="desk-light is-zoom" aria-label={zoomed ? "Shrink window" : "Zoom window"} aria-pressed={zoomed} onClick={onZoom}>
          <TrafficGlyph kind="zoom" />
        </button>
      </div>
      <h1 id={titleId}>
        {glyph && <span className="desk-title-glyph" aria-hidden="true">{glyph}</span>}
        {logo && <span className="desk-title-logo" aria-hidden="true"><img src={logo} alt="" /></span>}
        {title}
      </h1>
    </div>
  );
}
