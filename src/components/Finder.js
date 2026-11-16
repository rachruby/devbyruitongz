import { projects } from "../data/projects";

function FolderMark() {
  return (
    <svg viewBox="0 0 64 52" aria-hidden="true">
      <path d="M6 16c0-3.2 2.4-5.5 5.6-5.5h14.2l4.4 5.2h22.2c3.2 0 5.6 2.3 5.6 5.5v22.6c0 3.2-2.4 5.7-5.6 5.7H11.6C8.4 49.5 6 47 6 43.8V16z" fill="#5aa2f5" />
      <path d="M6 24h52v19.8c0 3.2-2.4 5.7-5.6 5.7H11.6C8.4 49.5 6 47 6 43.8V24z" fill="#8ec4ff" />
    </svg>
  );
}

function ViewIcon({ kind }) {
  if (kind === "column") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M1 2h4v12H1zM6 2h4v12H6zM11 2h4v12h-4z" />
      </svg>
    );
  }
  if (kind === "list") {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M1 3h14v2H1zM1 7h14v2H1zM1 11h14v2H1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2 2h12v9H2zM4 13h2v1H4zM7 13h2v1H7zM10 13h2v1h-2z" />
    </svg>
  );
}

function Preview({ project }) {
  return (
    <div className="finder-preview">
      <img src={project.image} alt="" />
      <h2>{project.name}</h2>
      <p>{project.description}</p>
    </div>
  );
}

export const Finder = ({ view, onView, selectedId, onSelect }) => {
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];
  const index = projects.findIndex((project) => project.id === selected.id);

  const step = (direction) => {
    const next = (index + direction + projects.length) % projects.length;
    onSelect(projects[next].id);
  };

  return (
    <div className="finder">
      <div className="finder-toolbar">
        <div className="finder-views" role="radiogroup" aria-label="Finder view">
          {[
            ["column", "Column view"],
            ["list", "List view"],
            ["gallery", "Gallery view"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={view === id}
              aria-label={label}
              className={view === id ? "is-selected" : ""}
              onClick={() => onView(id)}
            >
              <ViewIcon kind={id} />
            </button>
          ))}
        </div>
        <p className="finder-path">Projects / {selected.name}</p>
      </div>

      {view === "column" && (
        <div className="finder-columns">
          <div className="finder-col" role="listbox" aria-label="Project folders">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="option"
                aria-selected={project.id === selected.id}
                className={project.id === selected.id ? "is-selected" : ""}
                onClick={() => onSelect(project.id)}
              >
                <FolderMark />
                <span>{project.name}</span>
              </button>
            ))}
          </div>
          <div className="finder-col finder-files" role="listbox" aria-label={`${selected.name} files`}>
            <button type="button" role="option" aria-selected="true" className="is-selected">
              <img src={selected.image} alt="" />
              <span>{selected.name}</span>
            </button>
          </div>
          <Preview project={selected} />
        </div>
      )}

      {view === "list" && (
        <div className="finder-list">
          <div className="finder-rows" role="listbox" aria-label="Projects">
            <div className="finder-row finder-row-head" aria-hidden="true">
              <span>Name</span>
              <span>Description</span>
            </div>
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="option"
                aria-selected={project.id === selected.id}
                className={`finder-row${project.id === selected.id ? " is-selected" : ""}`}
                onClick={() => onSelect(project.id)}
              >
                <span className="finder-name">
                  <FolderMark />
                  {project.name}
                </span>
                <span className="finder-desc">{project.description}</span>
              </button>
            ))}
          </div>
          <Preview project={selected} />
        </div>
      )}

      {view === "gallery" && (
        <div className="finder-gallery">
          <div className="finder-stage">
            <button type="button" aria-label="Previous project" onClick={() => step(-1)}>‹</button>
            <img src={selected.image} alt="" />
            <button type="button" aria-label="Next project" onClick={() => step(1)}>›</button>
          </div>
          <div className="finder-caption">
            <h2>{selected.name}</h2>
            <p>{selected.description}</p>
            <span>{index + 1} of {projects.length}</span>
          </div>
          <div className="finder-film" role="listbox" aria-label="Project gallery">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                role="option"
                aria-selected={project.id === selected.id}
                aria-label={project.name}
                className={project.id === selected.id ? "is-selected" : ""}
                onClick={() => onSelect(project.id)}
              >
                <img src={project.image} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
