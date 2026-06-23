export function ModuleTabs({ tabs = [] }) {
  return (
    <div className="module-tabs" role="tablist" aria-label="Modulnavigation">
      {tabs.map((tab) => (
        <button
          className={`module-tab ${tab.active ? "is-active" : ""}`}
          type="button"
          key={tab.id}
          disabled={Boolean(tab.disabled)}
        >
          {tab.title}
        </button>
      ))}
    </div>
  );
}
