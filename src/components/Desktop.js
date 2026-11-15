import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { experiences } from "../data/experience";
import { projects } from "../data/projects";
import opentableLogo from "../assets/logos/opentable.svg";
import cibcLogo from "../assets/logos/cibc.svg";
import cooperatorsLogo from "../assets/logos/cooperators.svg";
import wallpaper from "../assets/img/bg.png";
import { Finder } from "./Finder";
import "./Desktop.css";

const logos = {
  opentable: opentableLogo,
  cibc: cibcLogo,
  cooperators: cooperatorsLogo,
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

function FolderGlyph() {
  return (
    <svg viewBox="0 0 64 52" aria-hidden="true">
      <path d="M4 16c0-3.4 2.6-6 6-6h16l5 6h23c3.4 0 6 2.6 6 6v22c0 3.4-2.6 6-6 6H10c-3.4 0-6-2.6-6-6V16z" fill="#4c97ef" />
      <path d="M4 24h56v20c0 3.4-2.6 6-6 6H10c-3.4 0-6-2.6-6-6V24z" fill="#8ec4ff" />
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

export const Desktop = () => {
  const [openId, setOpenId] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [finderView, setFinderView] = useState("column");
  const [projectId, setProjectId] = useState(projects[0].id);
  const [now, setNow] = useState(() => new Date());
  const [caret, setCaret] = useState("50%");
  const buttonRefs = useRef({});
  const dialogRef = useRef(null);
  const lastId = useRef(null);
  const wasOpen = useRef(false);
  const titleId = useId();
  const role = experiences.find((item) => item.id === openId) ?? null;
  const experiencesOpen = openId === "experiences";
  const projectsOpen = openId === "projects";
  const menuName = role ? role.company : experiencesOpen ? "Experiences" : projectsOpen ? "Finder" : "Desktop";

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openId) {
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setZoomed(false);
        setOpenId(null);
        return;
      }
      if (openId !== "projects") {
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
  }, [openId, zoomed]);

  const toggle = (id) => {
    setZoomed(false);
    setOpenId((current) => (current === id ? null : id));
  };

  const close = () => {
    setZoomed(false);
    setOpenId(null);
  };

  const onStageMouseDown = (event) => {
    if (!openId) {
      return;
    }
    if (event.target.closest(".desk-window") || event.target.closest(".desk-app")) {
      return;
    }
    close();
  };

  return (
    <div className="desk" style={{ backgroundImage: `url(${wallpaper})` }}>
      <header className="desk-menu">
        <div className="desk-menu-left">
          <span className="desk-mark" aria-hidden="true">RZ</span>
          <span className="desk-menu-app">{menuName}</span>
          <span className="desk-menu-name">Ruitong Zhang</span>
        </div>
        <div className="desk-menu-right">
          <span>Toronto</span>
          <time dateTime={now.toISOString()}>{formatMenuClock(now)}</time>
        </div>
      </header>

      <main className="desk-stage" onMouseDown={onStageMouseDown}>
        <div className="desk-island" role="toolbar" aria-label="Experience apps">
          <button
            type="button"
            className={`desk-app${experiencesOpen ? " is-open" : ""}`}
            aria-pressed={experiencesOpen}
            aria-expanded={experiencesOpen}
            aria-label="Open Experiences"
            ref={(node) => {
              buttonRefs.current.experiences = node;
            }}
            onClick={() => toggle("experiences")}
          >
            <span className="desk-icon desk-icon-experiences">
              <ExperiencesGlyph />
            </span>
            <span className="desk-label">Experiences</span>
          </button>

          {experiences.map((item) => {
            const isOpen = openId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`desk-app${isOpen ? " is-open" : ""}`}
                aria-pressed={isOpen}
                aria-expanded={isOpen}
                aria-label={`Open ${item.company}`}
                ref={(node) => {
                  buttonRefs.current[item.id] = node;
                }}
                onClick={() => toggle(item.id)}
              >
                <span className="desk-icon">
                  <img src={logos[item.id]} alt="" />
                </span>
                <span className="desk-label">{item.company}</span>
              </button>
            );
            })}
          <span className="desk-divider" aria-hidden="true" />
          <button
            type="button"
            className={`desk-app${projectsOpen ? " is-open" : ""}`}
            aria-pressed={projectsOpen}
            aria-expanded={projectsOpen}
            aria-label="Open Projects"
            ref={(node) => {
              buttonRefs.current.projects = node;
            }}
            onClick={() => toggle("projects")}
          >
            <span className="desk-icon desk-icon-folder">
              <FolderGlyph />
            </span>
            <span className="desk-label">Projects</span>
          </button>
        </div>

        <div className="desk-slot">
          {experiencesOpen && (
            <article
              className={`desk-window${zoomed ? " is-zoomed" : ""}`}
              role="dialog"
              aria-labelledby={titleId}
              tabIndex={-1}
              ref={dialogRef}
              style={{ "--caret": zoomed ? "50%" : caret }}
            >
              <WindowChrome
                titleId={titleId}
                title="Experiences"
                zoomed={zoomed}
                onClose={close}
                onZoom={() => setZoomed((value) => !value)}
                glyph={<ExperiencesGlyph />}
              />
              <div className="desk-body">
                <p className="desk-lead">Pick a company to read the role.</p>
                <div className="desk-roster">
                  {experiences.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="desk-roster-item"
                      onClick={() => toggle(item.id)}
                    >
                      <span className="desk-roster-logo">
                        <img src={logos[item.id]} alt="" />
                      </span>
                      <span className="desk-roster-copy">
                        <strong>{item.company}</strong>
                        <span>{item.title}</span>
                        <span>{item.dates}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          )}

          {role && (
            <article
              key={role.id}
              className={`desk-window${zoomed ? " is-zoomed" : ""}`}
              role="dialog"
              aria-labelledby={titleId}
              tabIndex={-1}
              ref={dialogRef}
              style={{ "--caret": zoomed ? "50%" : caret, "--accent": role.accent }}
            >
              <WindowChrome
                titleId={titleId}
                title={role.company}
                zoomed={zoomed}
                onClose={close}
                onZoom={() => setZoomed((value) => !value)}
                logo={logos[role.id]}
              />
              <div className="desk-body">
                {role.parent && <p className="desk-parent">{role.parent}</p>}
                <p className="desk-role">{role.title}</p>
                <p className="desk-meta">
                  <span>{role.dates}</span>
                  <span className="desk-dot" aria-hidden="true" />
                  <span>{role.location}</span>
                </p>
                <ul>
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </article>
          )}

          {projectsOpen && (
            <article
              className={`desk-window is-finder${zoomed ? " is-zoomed" : ""}`}
              role="dialog"
              aria-labelledby={titleId}
              tabIndex={-1}
              ref={dialogRef}
              style={{ "--caret": zoomed ? "50%" : caret }}
            >
              <WindowChrome
                titleId={titleId}
                title="Projects"
                zoomed={zoomed}
                onClose={close}
                onZoom={() => setZoomed((value) => !value)}
                glyph={<FolderGlyph />}
              />
              <Finder
                view={finderView}
                onView={setFinderView}
                selectedId={projectId}
                onSelect={setProjectId}
              />
            </article>
          )}

          {!openId && <p className="desk-hint">Open an app, or the Projects folder.</p>}
        </div>
      </main>
    </div>
  );
};

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
        <button
          type="button"
          className="desk-light is-zoom"
          aria-label={zoomed ? "Shrink window" : "Zoom window"}
          aria-pressed={zoomed}
          onClick={onZoom}
        >
          <TrafficGlyph kind="zoom" />
        </button>
      </div>
      <h1 id={titleId}>
        {glyph && <span className="desk-title-glyph" aria-hidden="true">{glyph}</span>}
        {logo && (
          <span className="desk-title-logo" aria-hidden="true">
            <img src={logo} alt="" />
          </span>
        )}
        {title}
      </h1>
    </div>
  );
}
