import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap.js";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/lib/logo.js";

interface LoginPageProps {
  onSignIn: () => void;
}

export function LoginPage({ onSignIn }: LoginPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      const logo = container.querySelector('[data-login="logo"]');
      const wordmark = container.querySelector('[data-login="wordmark"]');
      const divider = container.querySelector('[data-login="divider"]');
      const subtitle = container.querySelector('[data-login="subtitle"]');
      const button = container.querySelector('[data-login="button"]');
      const footer = container.querySelector('[data-login="footer"]');

      const tl = gsap.timeline({
        defaults: { ease: "expo.out", duration: 1.2 },
      });

      // Logo fades in and scales up
      if (logo) {
        tl.fromTo(
          logo,
          { autoAlpha: 0, scale: 0.8 },
          { autoAlpha: 1, scale: 1, duration: 1.4, ease: "expo.out" },
        );
      }

      // Wordmark slides up
      if (wordmark) {
        tl.fromTo(
          wordmark,
          { autoAlpha: 0, yPercent: 30 },
          { autoAlpha: 1, yPercent: 0 },
          "<0.3",
        );
      }

      // Divider expands from center
      if (divider) {
        tl.fromTo(
          divider,
          { scaleX: 0, autoAlpha: 0 },
          { scaleX: 1, autoAlpha: 1, duration: 0.8, ease: "expo.inOut" },
          "<0.2",
        );
      }

      // Subtitle fades in
      if (subtitle) {
        tl.fromTo(
          subtitle,
          { autoAlpha: 0, yPercent: 20 },
          { autoAlpha: 1, yPercent: 0, duration: 0.9 },
          "<0.15",
        );
      }

      // Button slides up
      if (button) {
        tl.fromTo(
          button,
          { autoAlpha: 0, yPercent: 40 },
          { autoAlpha: 1, yPercent: 0, duration: 0.9 },
          "<0.1",
        );
      }

      // Footer fades in
      if (footer) {
        tl.fromTo(
          footer,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8 },
          "<0.2",
        );
      }
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center bg-bg-deep"
    >
      {/* Subtle radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, color-mix(in srgb, var(--color-energetic-blue) 15%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-sm">
        {/* Logo symbol */}
        <svg
          data-login="logo"
          viewBox={LOGO_VIEWBOX}
          className="w-20 h-auto mb-6 invisible"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Velais logo"
        >
          <path d={LOGO_PATH} fill="var(--color-soft-sky)" />
        </svg>

        {/* Wordmark */}
        <h1
          data-login="wordmark"
          className="font-heading text-2xl tracking-[0.2em] uppercase text-text-primary mb-1 invisible"
        >
          Velais
        </h1>

        {/* Divider */}
        <div
          data-login="divider"
          className="w-12 h-px bg-border-default my-5 origin-center invisible"
        />

        {/* Subtitle */}
        <p
          data-login="subtitle"
          className="text-sm text-text-secondary text-center mb-8 invisible"
        >
          Sign in to access your sprint dashboard
        </p>

        {/* Sign In button */}
        <button
          data-login="button"
          type="button"
          onClick={onSignIn}
          className="w-full bg-interactive text-off-white hover:bg-energetic-blue/90 rounded-sm px-6 py-3 text-sm font-semibold tracking-[0.08em] uppercase transition-colors duration-150 invisible"
        >
          Sign In
        </button>
      </div>

      {/* Footer */}
      <p
        data-login="footer"
        className="absolute bottom-6 text-xs text-text-tertiary tracking-[0.06em] invisible"
      >
        Client Dashboard
      </p>
    </div>
  );
}
