// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later
// Runs before the first paint so a returning visitor never sees a flash of the wrong theme.
// It is loaded from <head> without defer or async on purpose: it has to block, and it is tiny.
// The response headers allow script-src 'self', so this file cannot be inlined.
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
  document.documentElement.classList.add("js");
})();
