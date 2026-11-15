import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { experiences } from "../data/experience";
import "./Experience.css";

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
  const period = get("dayPeriod").toUpperCase();
  return `${get("weekday")} ${get("month")} ${get("day")}  ${get("hour")}:${get("minute")} ${period}`;
}

function AppGlyph({ id }) {
  if (id === "opentable") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="34" r="16" fill="none" stroke="#fff" strokeWidth="3.2" />
        <circle cx="32" cy="34" r="5" fill="#fff" />
        <path d="M32 14v8M44 22l-5 6" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M22 18h8" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "cibc") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <text
          x="32"
          y="38"
          textAnchor="middle"
          fill="#fff"
          fontFamily="-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.5"
        >
          CIBC
        </text>
        <rect x="16" y="44" width="32" height="3" rx="1.5" fill="#f0c36a" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="30" r="9" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="40" cy="30" r="9" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="32" cy="40" r="9" fill="none" stroke="#fff7d6" strokeWidth="3" />
    </svg>
  );
}

function TrafficGlyph({ kind }) {
  if (kind === "close") {
    return (
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M3.2 3.2l5.6 5.6M8.8 3.2L3.2 8.8" />
      </svg>
    );
  }
  if (kind === "min") {
    return (
      <svg viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.6 6h6.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 2.8v6.4M2.8 6h6.4" />
    </svg>
  );
}

export const Experience = () => {
  const [openId, setOpenId] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [caret, setCaret] = useState("50%");
  const buttonRefs = useRef({});
  const dialogRef = useRef(null);
  const slotRef = useRef(null);
  const lastId = useRef(null);
  const wasOpen = useRef(false);
  const titleId = useId();
  const open = experiences.find((role) => role.id === openId) ?? null;

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
      }
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
    window.addEventListener("resize", placeCaret);
    return () => window.removeEventListener("resize", placeCaret);
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
    if (event.target.closest(".mac-window") || event.target.closest(".mac-app")) {
      return;
    }
    close();
  };

  const onIslandKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }
    event.preventDefault();
    const currentIndex = Math.max(0, experiences.findIndex((role) => role.id === (openId || lastId.current)));
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next = experiences[(currentIndex + direction + experiences.length) % experiences.length];
    setZoomed(false);
    setOpenId(next.id);
    buttonRefs.current[next.id]?.focus();
  };

  return (
    <section className="experience" id="experience">
      <div className="mac-screen" onKeyDown={onIslandKeyDown}>
        <header className="mac-menu">
          <div className="mac-menu-left">
            <span className="mac-mark" aria-hidden="true">RZ</span>
            <span className="mac-menu-app">{open ? open.company : "Experience"}</span>
          </div>
          <div className="mac-menu-right">
            <span>Toronto</span>
            <time dateTime={now.toISOString()}>{formatMenuClock(now)}</time>
          </div>
        </header>

        <div className="mac-stage" onMouseDown={onStageMouseDown}>
          <div className="mac-caption">
            <h2>Work Experience</h2>
            <p>Each role is an app in the island. Open one and the work prompts out.</p>
          </div>

          <div
            className="mac-island"
            role="toolbar"
            aria-label="Work experience apps"
          >
            {experiences.map((role) => {
              const isOpen = openId === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  className={`mac-app${isOpen ? " is-open" : ""}`}
                  style={{ "--rest": role.rest, "--delay": role.delay }}
                  aria-pressed={isOpen}
                  aria-expanded={isOpen}
                  aria-label={`Open ${role.company}, ${role.title}`}
                  ref={(node) => {
                    buttonRefs.current[role.id] = node;
                  }}
                  onClick={() => toggle(role.id)}
                >
                  <span className="mac-app-icon" style={{ background: role.gradient }}>
                    <AppGlyph id={role.id} />
                  </span>
                  <span className="mac-app-label">{role.company}</span>
                </button>
              );
            })}
          </div>

          <div className="mac-prompt-slot" ref={slotRef}>
            {open ? (
              <article
                key={open.id}
                className={`mac-window${zoomed ? " is-zoomed" : ""}`}
                role="dialog"
                aria-labelledby={titleId}
                tabIndex={-1}
                ref={dialogRef}
                style={{ "--caret": zoomed ? "50%" : caret, "--accent": open.accent }}
              >
                <div className="mac-titlebar">
                  <div className="mac-traffic">
                    <button type="button" className="mac-light is-close" aria-label="Close" onClick={close}>
                      <TrafficGlyph kind="close" />
                    </button>
                    <button type="button" className="mac-light is-min" aria-label="Minimize" onClick={close}>
                      <TrafficGlyph kind="min" />
                    </button>
                    <button
                      type="button"
                      className="mac-light is-zoom"
                      aria-label={zoomed ? "Shrink window" : "Zoom window"}
                      aria-pressed={zoomed}
                      onClick={() => setZoomed((value) => !value)}
                    >
                      <TrafficGlyph kind="zoom" />
                    </button>
                  </div>
                  <h3 id={titleId}>
                    <span className="mac-title-icon" style={{ background: open.gradient }} aria-hidden="true">
                      <AppGlyph id={open.id} />
                    </span>
                    {open.company}
                  </h3>
                </div>
                <div className="mac-window-body">
                  {open.parent && open.parent !== open.company && (
                    <p className="mac-parent">{open.parent}</p>
                  )}
                  <p className="mac-role">{open.title}</p>
                  <p className="mac-meta">
                    <span>{open.dates}</span>
                    <span className="mac-dot" aria-hidden="true" />
                    <span>{open.location}</span>
                  </p>
                  <ul>
                    {open.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ) : (
              <p className="mac-hint">Nothing open yet. Choose OpenTable, CIBC, or Co-operators.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
