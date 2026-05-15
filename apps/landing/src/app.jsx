/* App root — composition + scroll reveal observer + tweaks. */

const { useEffect: useEffectA, useState: useStateA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "growth",
  "showGrid": true,
  "reducedMotion": false
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = window.useTweaks
    ? window.useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  // Apply tweaks to root
  useEffectA(() => {
    const root = document.documentElement;
    const accentMap = {
      growth:  { light: "oklch(0.60 0.13 152)", dark: "oklch(0.78 0.13 152)" },
      revenue: { light: "oklch(0.62 0.13 65)",  dark: "oklch(0.82 0.13 80)" },
      release: { light: "oklch(0.55 0.14 285)", dark: "oklch(0.76 0.14 285)" },
    };
    const a = accentMap[tweaks.accent] || accentMap.growth;
    // We don't override the per-signal colors — only the "primary live accent" reads.
    // (The signal palette stays multi-coloured by design; this just shifts the *live* dot tone.)
    root.style.setProperty("--growth", a.light);
    root.style.setProperty("--growth-dk", a.dark);

    if (tweaks.reducedMotion) {
      root.style.setProperty("--motion", "0");
    } else {
      root.style.removeProperty("--motion");
    }
  }, [tweaks.accent, tweaks.reducedMotion]);

  // Scroll reveal observer
  useEffectA(() => {
    const els = document.querySelectorAll(".vreveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Nav />
      <Hero />
      <Manifesto />
      <FiveSignals />
      <WorkspaceSection />
      <CockpitSection />
      <DailyRitual />
      <Connectors />
      <Principles />
      <Terminal />
      <Roadmap />
      <FinalCTA />
      <Footer />

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          {window.TweakSection && (
            <window.TweakSection title="Accent tone">
              <window.TweakRadio
                label="Live signal"
                value={tweaks.accent}
                options={["growth", "revenue", "release"]}
                onChange={(v) => setTweak("accent", v)}
              />
            </window.TweakSection>
          )}
          {window.TweakSection && (
            <window.TweakSection title="Motion">
              <window.TweakToggle
                label="Reduce motion"
                value={tweaks.reducedMotion}
                onChange={(v) => setTweak("reducedMotion", v)}
              />
            </window.TweakSection>
          )}
        </window.TweaksPanel>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
