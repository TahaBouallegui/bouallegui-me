// Colour tokens live as CSS custom properties in src/input.css, so light/dark is a
// variable swap rather than 200 `dark:` prefixes in the markup. Values are "r g b"
// triplets so Tailwind's slash-opacity still works.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  // One glob per kind of source: 404.html and any new page are picked up automatically,
  // and fr/*.html is the French mirror of the six index pages.
  content: ["./*.html", "./fr/*.html", "./posts/*.html", "./js/**/*.js"],
  // The toggle sets <html data-theme="dark">. Users without JS get the OS preference,
  // which is handled by the @media block in src/input.css.
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ocean: {
          DEFAULT: "#0077B6",
          // ocean.dark is the link/heading colour on a light surface; in dark mode the
          // token becomes ocean.glow, which clears AA against the dark background.
          dark: token("--ocean-ink"),
          deep: "#01324F",
          light: "#0096C7",
          // Lighter accent for small text on the dark heroes: #0096C7 only reaches 3.94:1
          // against ocean-deep, this reaches 6.89:1 (AA needs 4.5:1 for body-size text).
          glow: "#4CC9E8"
        },
        navy: "#023E8A",
        // Semantic accent-for-text token: ocean.dark on a light surface, ocean.glow on a
        // dark one. Used by every link and heading so contrast holds in both themes.
        link: token("--ocean-ink"),
        surface: token("--surface"),
        ink: token("--ink"),
        slate: {
          50: token("--slate-50"),
          100: token("--slate-100"),
          200: token("--slate-200"),
          300: token("--slate-300"),
          400: token("--slate-400"),
          500: token("--slate-500"),
          600: token("--slate-600"),
          700: token("--slate-700"),
          800: token("--slate-800"),
          900: token("--slate-900")
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        "soft": "0 8px 30px rgba(2, 62, 138, 0.12)",
        "glow": "0 0 0 1px rgba(0, 119, 182, 0.15), 0 18px 50px rgba(0, 119, 182, 0.25)"
      },
      borderRadius: {
        "lg": "0.9rem",
        "xl": "1.1rem",
        "card": "1rem"
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        "fade-up": "fade-up 0.7s ease both",
        "float": "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
}
