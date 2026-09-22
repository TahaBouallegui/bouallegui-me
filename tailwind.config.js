module.exports = {
  content: ["./index.html", "./portfolio.html", "./blog.html", "./about.html", "./contact.html", "./blog-post-template.html", "./posts/*.html"],
  theme: {
    extend: {
      colors: {
        ocean: {
          DEFAULT: "#0077B6",
          dark: "#023E8A",
          deep: "#01324F",
          light: "#0096C7"
        },
        navy: "#023E8A",
        surface: "#FFFFFF",
        ink: "#0A1A2F"
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
