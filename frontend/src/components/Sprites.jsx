// Pixel-art sprites drawn as crisp SVG. The agent is an original mascot.

const MASCOT_BODY = 'M2 1h6v1H2z M1 2h8v1H1z M0 3h10v4H0z M1 7h8v1H1z';
const PUPILS = {
  LEFT: 'M2 3h1v2H2z M6 3h1v2H6z',
  RIGHT: 'M3 3h1v2H3z M7 3h1v2H7z',
  UP: 'M2 3h2v1H2z M6 3h2v1H6z',
  DOWN: 'M2 4h2v1H2z M6 4h2v1H6z',
};
const GHOST_BODY = 'M1 0h1v1H1z M6 0h1v1H6z M2 1h4v1H2z M1 2h6v1H1z M0 3h8v1H0z M1 4h6v1H1z M2 5h4v1H2z M1 6h1v1H1z M6 6h1v1H6z';

export function Mascot({ dir = 'RIGHT', mouth = 'open', className, style, width, height, title }) {
  return (
    <svg
      className={className}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 10 9"
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path d={MASCOT_BODY} fill="#FEE761" />
      <path d="M1 0h1v2H1z M8 0h1v2H8z" fill="#FEAE34" />
      <path d="M1 8h3v1H1z M6 8h3v1H6z" fill="#F77622" />
      <path d="M2 3h2v2H2z M6 3h2v2H6z" fill="#FFFFFF" />
      <path d={PUPILS[dir] ?? PUPILS.RIGHT} fill="#181425" />
      <path d="M1 5h1v1H1z M8 5h1v1H8z" fill="#F6757A" />
      {mouth === 'open' ? (
        <>
          <path d="M3 5h4v2H3z" fill="#3E2731" />
          <path d="M4 6h2v1H4z" fill="#E43B44" />
        </>
      ) : (
        <path d="M3 6h4v1H3z" fill="#3E2731" />
      )}
      {mouth === 'chomp' && (
        <>
          <path className="anim-chomp" d="M3 5h4v2H3z" fill="#3E2731" />
          <path className="anim-chomp" d="M4 6h2v1H4z" fill="#E43B44" />
        </>
      )}
    </svg>
  );
}

export function Ghost({ body = '#E43B44', eye = '#FFFFFF', className, style, width, height }) {
  return (
    <svg className={className} style={style} width={width} height={height} viewBox="0 0 8 7" shapeRendering="crispEdges" aria-hidden="true">
      <path d={GHOST_BODY} fill={body} />
      <path d="M2 3h1v1H2z M5 3h1v1H5z" fill={eye} />
    </svg>
  );
}

export function Coin({ className, style, width, height }) {
  return (
    <svg className={className} style={style} width={width} height={height} viewBox="0 0 6 6" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M2 0h2v1H2z M1 1h4v1H1z M0 2h6v2H0z M1 4h4v1H1z M2 5h2v1H2z" fill="#FEAE34" />
      <path d="M3 1h1v4H3z" fill="#F77622" />
      <path d="M2 2h1v1H2z" fill="#FEE761" />
    </svg>
  );
}
