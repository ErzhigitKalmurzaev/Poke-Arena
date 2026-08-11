interface LogoMarkProps {
  /**
   * Replaces the red half. The landing hero tints the mark to whichever
   * fighter is on stage; everywhere else the mark stays brand red.
   */
  tone?: string;
  className?: string;
}

/**
 * The Arena mark: a ball split by a tilted dark seam, red on one side, white
 * on the other, with the faint bloom the supplied artwork has.
 *
 * Drawn as a hard-stop gradient inside a circle rather than shipped as the
 * source PNG - that file is a 1536px raster of a glow on black with the
 * wordmark cropped, which would read as a smudge in a 34px header slot. A
 * gradient stays crisp at any size, weighs nothing, and picks up the theme's
 * red from the token instead of baking it in.
 */
export function LogoMark({ tone, className = '' }: LogoMarkProps) {
  return (
    <span
      aria-hidden
      className={`block size-8.5 shrink-0 rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_0_18px_-4px_rgba(255,255,255,0.55)] transition-[background,box-shadow] duration-300 ${className}`}
      style={{
        background: `linear-gradient(97deg, ${tone ?? 'var(--brand-red)'} 0 46%, #141414 46% 52%, #ffffff 52% 100%)`,
      }}
    />
  );
}

interface LogoProps extends LogoMarkProps {
  /** For hiding the wordmark on narrow screens without touching the mark. */
  wordmarkClassName?: string;
}

/** Mark + wordmark, the lockup used by every header in the app. */
export function Logo({ tone, className = '', wordmarkClassName = '' }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark tone={tone} />
      <span
        className={`font-heading text-xl font-semibold [text-shadow:0_0_20px_rgba(255,255,255,0.3)] ${wordmarkClassName}`}
        style={{ letterSpacing: '-.01em' }}
      >
        Arena
      </span>
    </span>
  );
}
