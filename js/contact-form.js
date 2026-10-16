// Copyright (c) 2026 Ahmed Taha Bouallegui
// SPDX-License-Identifier: GPL-3.0-or-later
// No server endpoint: compose a draft in the visitor's own mail client.
(function () {
  var form = document.querySelector("form[data-mailto-form]");
  if (!form) return;
  var note = form.querySelector("[data-form-note]");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var d = new FormData(form);
    var from = String(d.get("name") || "").trim();
    var reply = String(d.get("email") || "").trim();
    var subject = String(d.get("subject") || "").trim() || "Message from bouallegui.pages.dev";
    var body = String(d.get("message") || "").trim() + "\n\n - \n" + from + " <" + reply + ">";
    window.location.href = "mailto:ahmedtbou@tutamail.com"
      + "?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(body);
    if (note) note.classList.remove("hidden");
  });
})();
