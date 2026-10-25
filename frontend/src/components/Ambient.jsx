// Decorative motion around the cabinet: twinkling stars, rising pellets and a
// chase parade that loops around the cabinet. All of it stops when the viewer
// has reduced motion turned on (see theme.css).

import { Coin, Ghost, Mascot } from './Sprites.jsx';

const rnd = (n) => {
  const x = Math.sin(n * 99.17) * 10000;
  return x - Math.floor(x);
};

const STAR_COLORS = ['#FFFFFF', '#2CE8F5', '#FEE761', '#F6757A'];

const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: `${(rnd(i + 1) * 100).toFixed(1)}%`,
  top: `${(rnd(i + 101) * 100).toFixed(1)}%`,
  size: [2, 3, 4][Math.floor(rnd(i + 201) * 3)],
  color: STAR_COLORS[Math.floor(rnd(i + 301) * 4)],
  duration: `${(2 + rnd(i + 401) * 3).toFixed(1)}s`,
  delay: `${(-rnd(i + 501) * 4).toFixed(1)}s`,
}));

const FLOATERS = Array.from({ length: 18 }, (_, i) => ({
  left: `${(rnd(i + 601) * 100).toFixed(1)}%`,
  size: [4, 6, 8][Math.floor(rnd(i + 701) * 3)],
  color: rnd(i + 801) > 0.75 ? '#FEAE34' : '#FEE761',
  opacity: (0.3 + rnd(i + 901) * 0.45).toFixed(2),
  duration: `${Math.round(18 + rnd(i + 1001) * 14)}s`,
  delay: `${(-rnd(i + 1101) * 30).toFixed(1)}s`,
}));

export function Background() {
  return (
    <div className="ambient" aria-hidden="true">
      {STARS.map((s, i) => (
        <span
          key={`s${i}`}
          className="star"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, background: s.color, animationDuration: s.duration, animationDelay: s.delay }}
        />
      ))}
      {FLOATERS.map((f, i) => (
        <span
          key={`f${i}`}
          className="floater"
          style={{ left: f.left, width: f.size, height: f.size, background: f.color, opacity: f.opacity, animationDuration: f.duration, animationDelay: f.delay }}
        />
      ))}
    </div>
  );
}

const LAP = 30;
const PELLET_DELAYS = [-3.3, -3.5, -3.7, -4.2, -4.4, -4.6];
const GHOSTS = [
  { body: '#F77622', eye: '#FFFFFF', delay: -1.25, bob: 0.45 },
  { body: '#2CE8F5', eye: '#181425', delay: -1.6, bob: 0.3 },
  { body: '#F6757A', eye: '#FFFFFF', delay: -1.95, bob: 0.15 },
  { body: '#E43B44', eye: '#FFFFFF', delay: -2.3, bob: 0 },
];
const LEADER_DELAY = -3;

const orbit = (delay) => ({ animationDuration: `${LAP}s`, animationDelay: `${delay}s` });

export function Parade() {
  return (
    <div className="parade" aria-hidden="true">
      {PELLET_DELAYS.map((d) => (
        <span key={d} className="orbiter orbiter-pellet" style={orbit(d)} />
      ))}
      <span className="orbiter orbiter-coin" style={orbit(-3.95)}>
        <Coin width={18} height={18} />
      </span>
      {GHOSTS.map((g) => (
        <span key={g.body} className="orbiter orbiter-ghost" style={orbit(g.delay)}>
          <Ghost className="bob" style={{ animationDelay: `${g.bob}s` }} width={32} height={28} body={g.body} eye={g.eye} />
        </span>
      ))}
      <span className="orbiter orbiter-leader" style={orbit(LEADER_DELAY)}>
        <span className="facing" style={{ '--lap': `${LAP}s`, '--lap-delay': `${LEADER_DELAY}s` }}>
          <Mascot className="face face-r" width={40} height={36} dir="RIGHT" mouth="chomp" />
          <Mascot className="face face-d" width={40} height={36} dir="DOWN" mouth="chomp" />
          <Mascot className="face face-l" width={40} height={36} dir="LEFT" mouth="chomp" />
          <Mascot className="face face-u" width={40} height={36} dir="UP" mouth="chomp" />
        </span>
      </span>
    </div>
  );
}
