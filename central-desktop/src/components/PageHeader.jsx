import Icon from "./Icon";
export default function PageHeader({ title, subtitle, onRefresh }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <button
        type="button"
        className="page-badge"
        aria-label="Atualizar página"
        title="Atualizar página"
        onClick={onRefresh}
      >
        <Icon name="refresh" />
      </button>
    </header>
  );
}
