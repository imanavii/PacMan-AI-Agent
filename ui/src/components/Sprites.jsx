// Pixel-art sprites rendered from the PNG frames in src/assets/sprites.
// Every frame is 16x16; the .sprite CSS class keeps them crisp when scaled.

const pacFrames = import.meta.glob('../assets/sprites/pacman/*.png', { eager: true, import: 'default' });
const ghostImgs = import.meta.glob('../assets/sprites/ghosts/*.png', { eager: true, import: 'default' });
const itemImgs = import.meta.glob('../assets/sprites/items/*.png', { eager: true, import: 'default' });

const pacFrame = (dir, n) => pacFrames[`../assets/sprites/pacman/${dir}-${n}.png`];
const ghostImg = (name) => ghostImgs[`../assets/sprites/ghosts/${name}.png`];
const itemImg = (name) => itemImgs[`../assets/sprites/items/${name}.png`];

const DIRS = { UP: 'up', DOWN: 'down', LEFT: 'left', RIGHT: 'right' };
// Frame 1 = mouth wide open, 2 = half open, 3 = closed.
const MOUTH_FRAME = { open: 1, half: 2, closed: 3 };

// Ghost body colours used across the UI (see game/derive.js GHOST_COLORS).
const GHOST_BY_COLOR = {
  '#E43B44': 'blinky',
  '#F6757A': 'pinky',
  '#2CE8F5': 'inky',
  '#F77622': 'clyde',
};

function cx(...names) {
  return names.filter(Boolean).join(' ');
}

function SpriteImg({ src, className, title, ...rest }) {
  return (
    <img
      src={src}
      className={cx('sprite', className)}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      draggable={false}
      {...rest}
    />
  );
}

export function Mascot({ dir = 'RIGHT', mouth = 'open', className, style, width, height, title }) {
  const d = DIRS[dir] ?? 'right';
  if (mouth === 'chomp') {
    // Open frame underneath, closed frame blinking on top (uses .anim-chomp).
    return (
      <span
        className={cx('sprite-stack', className)}
        style={{ width, height, ...style }}
        role={title ? 'img' : undefined}
        aria-label={title}
        aria-hidden={title ? undefined : true}
      >
        <SpriteImg src={pacFrame(d, 1)} />
        <SpriteImg src={pacFrame(d, 3)} className="anim-chomp" />
      </span>
    );
  }
  return (
    <SpriteImg
      src={pacFrame(d, MOUTH_FRAME[mouth] ?? 1)}
      className={className}
      style={style}
      width={width}
      height={height}
      title={title}
    />
  );
}

// `eye` is still accepted so existing callers keep working; the PNGs carry their own eyes.
// eslint-disable-next-line no-unused-vars
export function Ghost({ body = '#E43B44', eye, frightened = false, className, style, width, height }) {
  const name = frightened ? 'blue_ghost' : (GHOST_BY_COLOR[String(body).toUpperCase()] ?? 'blinky');
  return <SpriteImg src={ghostImg(name)} className={className} style={style} width={width} height={height} />;
}

export function Coin({ className, style, width, height }) {
  return <SpriteImg src={itemImg('strawberry')} className={className} style={style} width={width} height={height} />;
}

export function Pellet(props) {
  return <SpriteImg src={itemImg('dot')} {...props} />;
}
