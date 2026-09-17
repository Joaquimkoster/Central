import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";
const modules = [
  ["Notas", "notes", "Suas ideias, em um só lugar"],
  ["Tarefas", "tasks", "Organize e faça acontecer"],
  ["Lembretes", "bell", "Nunca mais esqueça"],
  ["Calendário", "calendar", "Seus compromissos"],
  ["Objetivos", "goal", "Planos de hoje e do futuro"],
  ["Treinos", "goal", "Disciplina gera resultados"],
  ["Estudos", "book", "Seu aprendizado organizado"],
  ["Tempo de tela", "clock", "Mais foco, mais resultados"],
  ["Controle de vícios", "goal", "Menos impulso, mais liberdade"],
  ["Diário", "notes", "Seus pensamentos, sua evolução"],
  ["Sono", "moon", "Descanse para um melhor amanhã"],
  ["Controle do PC", "pc", "Gerencie seu computador"],
  ["Darly", "bot", "Sua IA pessoal"],
];
export default function Home({ onNavigate, onRefresh }) {
  return (
    <div className="page-content">
      <PageHeader
        onRefresh={onRefresh}
        title="Central"
        subtitle="Sua central pessoal"
      />
      <div className="section-label">SEU ESPAÇO, ORGANIZADO</div>
      <div className="home-menu">
        {modules.map(([title, icon, subtitle], index) => (
          <button
            key={title}
            className="module-card"
            onClick={() => onNavigate(title)}
          >
            <span className="module-icon">
              <Icon name={icon} size={23} />
            </span>
            <span className="module-copy">
              <strong>{title}</strong>
              <span>{subtitle}</span>
            </span>
            {index > 2 ? (
              <span className="soon-label">Em breve</span>
            ) : (
              <Icon name="chevron" size={16} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
