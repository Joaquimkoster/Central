export default function MuscleBreadcrumb({ items, onNavigate }) {
  return (
    <nav className="muscle-breadcrumb" aria-label="Navegação da biblioteca">
      {items.map((item, index) => (
        <span key={`${item.type}-${item.id || "root"}`}>
          {index > 0 && <i>/</i>}
          <button type="button" onClick={() => onNavigate(item)} disabled={index === items.length - 1}>
            {item.name}
          </button>
        </span>
      ))}
    </nav>
  );
}
