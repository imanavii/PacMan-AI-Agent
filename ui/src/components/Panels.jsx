import { Coin, Ghost, Mascot, Pellet } from './Sprites.jsx';
import { pad } from '../game/derive.js';

export function AnalysisPanel({ state }) {
  const agent = state?.agent;
  const algorithm = { bfs: 'BFS', astar: 'A*', minimax: 'Minimax' }[agent?.algorithm] ?? '—';
  return <section className="info-panel analysis-panel" aria-label="Live analysis">
    <h2>Live analysis</h2>
    <dl><div><dt>Nodes explored</dt><dd>{agent?.exploredNodes ?? '—'}</dd></div>
      <div><dt>Path length</dt><dd>{agent?.path.length ?? '—'}</dd></div>
      <div><dt>Decision time</dt><dd>{agent?.decisionTimeMs == null ? '—' : `${agent.decisionTimeMs.toFixed(2)} ms`}</dd></div>
      <div><dt>Algorithm</dt><dd className="algorithm-badge">{algorithm}</dd></div>
      <div><dt>Moves</dt><dd data-testid="moves">{pad(state?.tick ?? 0, 4)}</dd></div>
    </dl>
  </section>;
}

export function LegendPanel() {
  return <section className="info-panel legend-panel" aria-label="Legend"><h2>Legend</h2>
    <ul className="legend-list">
      <li><Mascot width={20} height={18} dir="LEFT" /><span>Agent (Pac-Man)</span></li>
      {[['red', '#E43B44'], ['pink', '#F6757A'], ['cyan', '#2CE8F5'], ['orange', '#F77622']].map(([name, color]) => <li key={name}><Ghost width={20} height={18} body={color} /><span>{name[0].toUpperCase() + name.slice(1)} ghost</span></li>)}
      <li><Pellet className="legend-dot" width={18} height={18} /><span>Pellet <small>+10</small></span></li>
      <li><Coin width={18} height={18} /><span>Fruit <small>+50</small></span></li>
      <li><span className="legend-route" /><span>Planned path</span></li>
    </ul>
  </section>;
}
