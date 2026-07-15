/* =============================================================
   AURORA UI · components.js
   Wires up every interactive component using event delegation on
   `document` wherever practical, so markup can be added/removed
   dynamically without re-binding listeners.
   ============================================================= */

window.AuroraUI = window.AuroraUI || {};

(function () {
  "use strict";

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  function ensureToastRegion() {
    var region = document.querySelector(".aur-toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "aur-toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    return region;
  }

  function showToast(message, type, duration) {
    type = type || "info";
    duration = duration || 4000;
    var region = ensureToastRegion();
    var toast = document.createElement("div");
    toast.className = "aur-toast aur-toast--" + type;
    toast.style.setProperty("animation-duration", duration + "ms");
    toast.innerHTML =
      '<div class="aur-flex aur-items-center aur-justify-between aur-gap-3">' +
      '<span>' + message + "</span>" +
      '<button class="aur-btn aur-btn--icon aur-btn--sm" data-toast-close aria-label="닫기">✕</button>' +
      "</div>" +
      '<div class="aur-toast__bar" style="animation-duration:' + duration + 'ms"></div>';
    region.appendChild(toast);

    var timer = window.setTimeout(function () { dismiss(); }, duration);

    function dismiss() {
      window.clearTimeout(timer);
      toast.classList.add("is-leaving");
      window.setTimeout(function () { toast.remove(); }, 200);
    }

    toast.querySelector("[data-toast-close]").addEventListener("click", dismiss);
  }

  /* ---------------------------------------------------------
     Navbar: hamburger + scroll morph
     --------------------------------------------------------- */
  function initNavbar() {
    var navbar = document.querySelector(".aur-navbar");
    if (navbar) {
      window.addEventListener("scroll", function () {
        navbar.classList.toggle("aur-navbar--scrolled", window.scrollY > 24);
      }, { passive: true });
    }

    document.addEventListener("click", function (evt) {
      var toggle = evt.target.closest("[data-nav-toggle]");
      if (toggle) {
        toggle.classList.toggle("is-active");
        var mobile = document.querySelector(".aur-navbar__mobile");
        var backdrop = document.querySelector('[data-backdrop="nav"]');
        if (mobile) mobile.classList.toggle("is-open");
        if (backdrop) backdrop.classList.toggle("is-visible");
      }
    });
  }

  /* ---------------------------------------------------------
     Dropdown / mega menu (click to open, outside click / Escape closes)
     --------------------------------------------------------- */
  function initDropdowns() {
    document.addEventListener("click", function (evt) {
      var trigger = evt.target.closest("[data-dropdown-trigger]");
      var openDropdowns = document.querySelectorAll(".aur-dropdown.is-open");

      if (trigger) {
        var dropdown = trigger.closest(".aur-dropdown");
        var wasOpen = dropdown.classList.contains("is-open");
        openDropdowns.forEach(function (d) { d.classList.remove("is-open"); });
        if (!wasOpen) dropdown.classList.add("is-open");
        return;
      }

      if (!evt.target.closest(".aur-dropdown")) {
        openDropdowns.forEach(function (d) { d.classList.remove("is-open"); });
      }
    });
  }

  /* ---------------------------------------------------------
     Generic open/close overlays: modal (<dialog>), drawer, popover,
     command palette, context menu, notification panel
     --------------------------------------------------------- */
  function closeDialogAnimated(dialog) {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    dialog.classList.add("is-closing");

    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      window.clearTimeout(fallback);
      dialog.removeEventListener("animationend", onAnimEnd);
      dialog.classList.remove("is-closing");
      dialog.close();
    };
    var onAnimEnd = function (evt) {
      if (evt.target === dialog) finish();
    };

    /* Not every dialog variant is guaranteed to define a matching
       .is-closing keyframe (and reusing the same keyframe name as the
       entrance animation is not guaranteed to replay in every engine),
       so a fallback timer guarantees the dialog always actually closes
       instead of getting stuck open if no animationend ever fires. */
    dialog.addEventListener("animationend", onAnimEnd);
    var fallback = window.setTimeout(finish, 220);
  }

  /* ---------------------------------------------------------
     Native <dialog> cursor guard
     A <dialog> shown via showModal() (every .aur-modal / .aur-command
     in this library) is promoted by the browser to the "top layer" —
     a stacking context that sits above the ENTIRE regular document
     unconditionally, regardless of any z-index. The custom cursor
     (spatial.js) lives in that regular document, so no z-index can
     make it paint above an open dialog: it would otherwise be stuck
     invisible behind the dialog/its ::backdrop for as long as the
     dialog stays open. While any dialog is open, this adds a body
     class that spatial.css uses to hide the fake cursor and bring
     back the real OS one, so there's always a visible pointer.
     A MutationObserver on each dialog's `open` attribute catches
     every open/close path (button, Escape/cancel, backdrop click,
     or a direct .close() call) without needing to hook each one. */
  function initDialogCursorGuard() {
    var dialogs = document.querySelectorAll("dialog");
    if (!dialogs.length) return;

    function sync() {
      var anyOpen = document.querySelector("dialog[open]");
      document.body.classList.toggle("aur-native-overlay-open", !!anyOpen);
    }

    dialogs.forEach(function (dialog) {
      new MutationObserver(sync).observe(dialog, { attributes: true, attributeFilter: ["open"] });
    });
    sync();
  }

  function initOverlays() {
    document.addEventListener("click", function (evt) {
      var openTrigger = evt.target.closest("[data-modal-target]");
      if (openTrigger) {
        var target = document.getElementById(openTrigger.getAttribute("data-modal-target"));
        if (target && typeof target.showModal === "function") target.showModal();
        return;
      }

      var closeTrigger = evt.target.closest("[data-modal-close]");
      if (closeTrigger) {
        var dialog = closeTrigger.closest("dialog");
        if (dialog) closeDialogAnimated(dialog);
        return;
      }

      var drawerTrigger = evt.target.closest("[data-drawer-target]");
      if (drawerTrigger) {
        var drawer = document.getElementById(drawerTrigger.getAttribute("data-drawer-target"));
        var backdrop = document.querySelector('[data-backdrop="drawer"]');
        if (drawer) drawer.classList.add("is-open");
        if (backdrop) backdrop.classList.add("is-visible");
        return;
      }

      var drawerClose = evt.target.closest("[data-drawer-close]");
      if (drawerClose) {
        document.querySelectorAll(".aur-drawer.is-open").forEach(function (d) { d.classList.remove("is-open"); });
        var b = document.querySelector('[data-backdrop="drawer"]');
        if (b) b.classList.remove("is-visible");
        return;
      }

      if (evt.target.matches("[data-backdrop]")) {
        evt.target.classList.remove("is-visible");
        document.querySelectorAll(".aur-drawer.is-open").forEach(function (d) { d.classList.remove("is-open"); });
        document.querySelector(".aur-navbar__mobile") && document.querySelector(".aur-navbar__mobile").classList.remove("is-open");
        document.querySelector("[data-nav-toggle]") && document.querySelector("[data-nav-toggle]").classList.remove("is-active");
      }

      /* click-outside for dialogs rendered as non-modal popovers isn't
         needed: <dialog>.showModal() already traps focus + provides a
         ::backdrop that we can click to dismiss */
      if (evt.target.tagName === "DIALOG") {
        closeDialogAnimated(evt.target);
      }
    });

    /* Escape closes the topmost open dialog (native <dialog> already
       handles Escape itself by firing "cancel"; we intercept it so the
       closing animation still plays) */
    document.addEventListener("cancel", function (evt) {
      if (evt.target.tagName === "DIALOG") {
        evt.preventDefault();
        closeDialogAnimated(evt.target);
      }
    }, true);
  }

  /* ---------------------------------------------------------
     Tabs
     --------------------------------------------------------- */
  function initTabs() {
    document.querySelectorAll(".aur-tabs").forEach(function (tabs) {
      var list = tabs.querySelector(".aur-tabs__list");
      var indicator = tabs.querySelector(".aur-tabs__indicator");
      var buttons = Array.prototype.slice.call(tabs.querySelectorAll(".aur-tabs__tab"));

      function moveIndicator(btn) {
        if (!indicator) return;
        indicator.style.width = btn.offsetWidth + "px";
        indicator.style.transform = "translateX(" + btn.offsetLeft + "px)";
      }

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          moveIndicator(btn);
          var panelId = btn.getAttribute("data-tab");
          tabs.querySelectorAll(".aur-tabs__panel").forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-tab-panel") === panelId);
          });
        });
      });

      var active = tabs.querySelector(".aur-tabs__tab.is-active") || buttons[0];
      if (active) moveIndicator(active);
      window.addEventListener("resize", function () {
        var current = tabs.querySelector(".aur-tabs__tab.is-active");
        if (current) moveIndicator(current);
      });
    });
  }

  /* ---------------------------------------------------------
     Accordion (single-open-at-a-time per group, via data-accordion-group)
     --------------------------------------------------------- */
  function initAccordion() {
    document.addEventListener("click", function (evt) {
      var trigger = evt.target.closest(".aur-accordion__trigger");
      if (!trigger) return;
      var item = trigger.closest(".aur-accordion__item");
      var group = item.closest("[data-accordion-group]");
      var isOpen = item.classList.contains("is-open");

      if (group) {
        group.querySelectorAll(".aur-accordion__item").forEach(function (i) { i.classList.remove("is-open"); });
      }
      item.classList.toggle("is-open", !isOpen);
    });
  }

  /* ---------------------------------------------------------
     Expandable + flip cards
     --------------------------------------------------------- */
  function initCardToggles() {
    document.addEventListener("click", function (evt) {
      var moreBtn = evt.target.closest("[data-card-expand]");
      if (moreBtn) {
        moreBtn.closest(".aur-card--expandable").classList.toggle("is-expanded");
        return;
      }
      var flipBtn = evt.target.closest("[data-card-flip]");
      if (flipBtn) {
        flipBtn.closest(".aur-flip").classList.toggle("is-flipped");
      }
    });
  }

  /* ---------------------------------------------------------
     Password visibility toggle
     --------------------------------------------------------- */
  function initPasswordToggle() {
    document.addEventListener("click", function (evt) {
      var btn = evt.target.closest(".aur-toggle-visibility");
      if (!btn) return;
      var input = btn.previousElementSibling;
      if (!input) return;
      var toText = input.type === "password";
      input.type = toText ? "text" : "password";
      btn.classList.toggle("is-visible", toText);
      btn.textContent = toText ? "🙈" : "👁";
      btn.setAttribute("aria-label", toText ? "비밀번호 숨기기" : "비밀번호 표시");
    });
  }

  /* ---------------------------------------------------------
     Range slider live fill + linked <output>
     --------------------------------------------------------- */
  function initRangeInputs() {
    document.querySelectorAll(".aur-range").forEach(function (range) {
      var output = document.querySelector('[data-range-output="' + range.id + '"]');
      function update() {
        var min = parseFloat(range.min) || 0;
        var max = parseFloat(range.max) || 100;
        var pct = ((range.value - min) / (max - min)) * 100;
        range.style.setProperty("--val", pct + "%");
        if (output) output.textContent = range.value;
      }
      range.addEventListener("input", update);
      update();
    });
  }

  /* ---------------------------------------------------------
     OTP input: auto-advance + backspace + paste split
     --------------------------------------------------------- */
  function initOtp() {
    document.querySelectorAll(".aur-otp").forEach(function (otp) {
      var boxes = Array.prototype.slice.call(otp.querySelectorAll(".aur-otp__box"));
      boxes.forEach(function (box, idx) {
        box.addEventListener("input", function () {
          box.value = box.value.replace(/[^0-9a-zA-Z]/g, "").slice(0, 1);
          if (box.value && boxes[idx + 1]) boxes[idx + 1].focus();
        });
        box.addEventListener("keydown", function (evt) {
          if (evt.key === "Backspace" && !box.value && boxes[idx - 1]) {
            boxes[idx - 1].focus();
          }
        });
        box.addEventListener("paste", function (evt) {
          var text = (evt.clipboardData || window.clipboardData).getData("text");
          if (!text) return;
          evt.preventDefault();
          text.split("").slice(0, boxes.length - idx).forEach(function (ch, i) {
            if (boxes[idx + i]) boxes[idx + i].value = ch;
          });
          var next = boxes[Math.min(idx + text.length, boxes.length - 1)];
          if (next) next.focus();
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Tag input
     --------------------------------------------------------- */
  function initTagInput() {
    document.querySelectorAll(".aur-tag-input").forEach(function (wrap) {
      var input = wrap.querySelector("input");
      if (!input) return;

      function addChip(text) {
        text = text.trim();
        if (!text) return;
        var chip = document.createElement("span");
        chip.className = "aur-chip";
        chip.innerHTML = "<span>" + text + '</span><button type="button" class="aur-chip__remove" aria-label="태그 삭제">✕</button>';
        wrap.insertBefore(chip, input);
      }

      input.addEventListener("keydown", function (evt) {
        if (evt.key === "Enter" || evt.key === ",") {
          evt.preventDefault();
          addChip(input.value);
          input.value = "";
        } else if (evt.key === "Backspace" && !input.value) {
          var chips = wrap.querySelectorAll(".aur-chip");
          if (chips.length) chips[chips.length - 1].remove();
        }
      });

      wrap.addEventListener("click", function (evt) {
        var remove = evt.target.closest(".aur-chip__remove");
        if (remove) remove.closest(".aur-chip").remove();
      });
    });
  }

  /* ---------------------------------------------------------
     Dropzone (drag & drop + click-to-browse)
     --------------------------------------------------------- */
  function initDropzone() {
    document.querySelectorAll(".aur-dropzone").forEach(function (zone) {
      var input = zone.querySelector('input[type="file"]');
      var label = zone.querySelector("[data-dropzone-label]");

      ["dragenter", "dragover"].forEach(function (evtName) {
        zone.addEventListener(evtName, function (evt) {
          evt.preventDefault();
          zone.classList.add("is-dragover");
        });
      });
      ["dragleave", "drop"].forEach(function (evtName) {
        zone.addEventListener(evtName, function (evt) {
          evt.preventDefault();
          zone.classList.remove("is-dragover");
        });
      });
      zone.addEventListener("drop", function (evt) {
        var files = evt.dataTransfer.files;
        if (files.length && label) label.textContent = files.length + "개 파일 선택됨: " + files[0].name;
      });
      zone.addEventListener("click", function () { if (input) input.click(); });
      if (input) {
        input.addEventListener("change", function () {
          if (input.files.length && label) label.textContent = input.files.length + "개 파일 선택됨: " + input.files[0].name;
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Sortable + filterable table
     --------------------------------------------------------- */
  function initTable() {
    document.querySelectorAll(".aur-table--sortable").forEach(function (table) {
      var tbody = table.querySelector("tbody");
      table.querySelectorAll("th[data-sort-key]").forEach(function (th) {
        th.addEventListener("click", function () {
          var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
          var idx = Array.prototype.indexOf.call(th.parentElement.children, th);
          var asc = !th.classList.contains("is-asc");

          table.querySelectorAll("th").forEach(function (t) { t.classList.remove("is-asc", "is-desc"); });
          th.classList.add(asc ? "is-asc" : "is-desc");

          rows.sort(function (a, b) {
            var av = a.children[idx].textContent.trim();
            var bv = b.children[idx].textContent.trim();
            var an = parseFloat(av.replace(/[^0-9.-]/g, ""));
            var bn = parseFloat(bv.replace(/[^0-9.-]/g, ""));
            var cmp = (!isNaN(an) && !isNaN(bn)) ? an - bn : av.localeCompare(bv);
            return asc ? cmp : -cmp;
          });
          rows.forEach(function (row) { tbody.appendChild(row); });
        });
      });
    });

    document.querySelectorAll("[data-table-filter]").forEach(function (input) {
      var table = document.getElementById(input.getAttribute("data-table-filter"));
      if (!table) return;
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        table.querySelectorAll("tbody tr").forEach(function (row) {
          row.style.display = row.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Form validation (novalidate + manual constraint checking)
     --------------------------------------------------------- */
  function initFormValidation() {
    document.querySelectorAll("form[data-validate]").forEach(function (form) {
      function validateField(field) {
        var wrapper = field.closest(".aur-field");
        if (!wrapper) return true;
        var valid = field.checkValidity();
        wrapper.classList.toggle("is-invalid", !valid);
        wrapper.classList.toggle("is-valid", valid && field.value !== "");
        var hint = wrapper.querySelector(".aur-field__hint");
        if (hint && !valid) hint.textContent = field.validationMessage;
        return valid;
      }

      form.querySelectorAll(".aur-input, .aur-textarea, .aur-select").forEach(function (field) {
        field.addEventListener("blur", function () { validateField(field); });
      });

      form.addEventListener("submit", function (evt) {
        evt.preventDefault();
        var fields = form.querySelectorAll(".aur-input, .aur-textarea, .aur-select");
        var allValid = true;
        fields.forEach(function (field) { if (!validateField(field)) allValid = false; });
        if (allValid) {
          showToast("폼이 성공적으로 제출되었습니다.", "success");
          form.reset();
          form.querySelectorAll(".aur-field").forEach(function (w) { w.classList.remove("is-valid", "is-invalid"); });
        } else {
          showToast("입력값을 다시 확인해 주세요.", "danger");
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Calendar UI
     --------------------------------------------------------- */
  function initCalendar() {
    document.querySelectorAll("[data-calendar]").forEach(function (cal) {
      var monthLabel = cal.querySelector("[data-calendar-label]");
      var grid = cal.querySelector("[data-calendar-grid]");
      var state = { date: new Date() };

      function render() {
        var year = state.date.getFullYear();
        var month = state.date.getMonth();
        var first = new Date(year, month, 1);
        var startDay = first.getDay();
        var daysInMonth = new Date(year, month + 1, 0).getDate();
        var today = new Date();

        monthLabel.textContent = year + "년 " + (month + 1) + "월";
        grid.innerHTML = "";

        for (var i = 0; i < startDay; i++) {
          var pad = document.createElement("div");
          pad.className = "aur-calendar__day is-muted";
          pad.textContent = "";
          grid.appendChild(pad);
        }
        for (var d = 1; d <= daysInMonth; d++) {
          var cell = document.createElement("button");
          cell.type = "button";
          cell.className = "aur-calendar__day";
          cell.textContent = d;
          if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
            cell.classList.add("is-today");
          }
          cell.addEventListener("click", function () {
            grid.querySelectorAll(".aur-calendar__day.is-selected").forEach(function (s) { s.classList.remove("is-selected"); });
            this.classList.add("is-selected");
          });
          grid.appendChild(cell);
        }
      }

      cal.querySelectorAll("[data-calendar-prev]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.date = new Date(state.date.getFullYear(), state.date.getMonth() - 1, 1);
          render();
        });
      });
      cal.querySelectorAll("[data-calendar-next]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.date = new Date(state.date.getFullYear(), state.date.getMonth() + 1, 1);
          render();
        });
      });

      render();
    });
  }

  /* ---------------------------------------------------------
     Kanban (native HTML5 drag & drop)
     --------------------------------------------------------- */
  function initKanban() {
    document.querySelectorAll(".aur-kanban__card").forEach(function (card) {
      card.setAttribute("draggable", "true");
      card.addEventListener("dragstart", function () {
        card.classList.add("is-dragging");
      });
      card.addEventListener("dragend", function () {
        card.classList.remove("is-dragging");
        updateKanbanCounts();
      });
    });

    document.querySelectorAll(".aur-kanban__col").forEach(function (col) {
      col.addEventListener("dragover", function (evt) {
        evt.preventDefault();
        col.classList.add("is-over");
      });
      col.addEventListener("dragleave", function () {
        col.classList.remove("is-over");
      });
      col.addEventListener("drop", function (evt) {
        evt.preventDefault();
        col.classList.remove("is-over");
        var dragging = document.querySelector(".aur-kanban__card.is-dragging");
        if (dragging) col.appendChild(dragging);
        updateKanbanCounts();
      });
    });

    function updateKanbanCounts() {
      document.querySelectorAll(".aur-kanban__col").forEach(function (col) {
        var badge = col.querySelector("[data-kanban-count]");
        if (badge) badge.textContent = col.querySelectorAll(".aur-kanban__card").length;
      });
    }
    updateKanbanCounts();
  }

  /* ---------------------------------------------------------
     Chat UI
     --------------------------------------------------------- */
  function initChat() {
    document.querySelectorAll("[data-chat]").forEach(function (chat) {
      var messages = chat.querySelector(".aur-chat__messages");
      var input = chat.querySelector("[data-chat-input]");
      var sendBtn = chat.querySelector("[data-chat-send]");

      function addMessage(text, who) {
        var bubble = document.createElement("div");
        bubble.className = "aur-chat__bubble aur-chat__bubble--" + who;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
      }

      function send() {
        var text = input.value.trim();
        if (!text) return;
        addMessage(text, "me");
        input.value = "";
        window.setTimeout(function () {
          addMessage("좋은 질문이에요! 곧 확인해서 답변드릴게요 🙂", "them");
        }, 700);
      }

      if (sendBtn) sendBtn.addEventListener("click", send);
      if (input) {
        input.addEventListener("keydown", function (evt) {
          if (evt.key === "Enter") send();
        });
      }
    });
  }

  /* ---------------------------------------------------------
     Context menu (right-click)
     --------------------------------------------------------- */
  function initContextMenu() {
    var menu = document.querySelector("[data-context-menu]");
    var zone = document.querySelector("[data-context-zone]");
    if (!menu || !zone) return;

    zone.addEventListener("contextmenu", function (evt) {
      evt.preventDefault();
      menu.style.left = evt.clientX + "px";
      menu.style.top = evt.clientY + "px";
      menu.classList.add("is-open");
    });

    document.addEventListener("click", function (evt) {
      if (!evt.target.closest("[data-context-menu]")) menu.classList.remove("is-open");
    });
    document.addEventListener("keydown", function (evt) {
      if (evt.key === "Escape") menu.classList.remove("is-open");
    });
  }

  /* ---------------------------------------------------------
     Command palette (Ctrl/Cmd+K, type-to-filter, arrow keys)
     --------------------------------------------------------- */
  function initCommandPalette() {
    var palette = document.querySelector(".aur-command");
    if (!palette) return;
    var input = palette.querySelector(".aur-command__input");
    var items = Array.prototype.slice.call(palette.querySelectorAll(".aur-command__item"));
    var selected = 0;

    function highlight() {
      items.forEach(function (item, i) { item.classList.toggle("is-selected", i === selected); });
    }

    document.addEventListener("keydown", function (evt) {
      var isMac = navigator.platform.toUpperCase().indexOf("MAC") > -1;
      var mod = isMac ? evt.metaKey : evt.ctrlKey;
      if (mod && evt.key.toLowerCase() === "k") {
        evt.preventDefault();
        palette.showModal();
        input.focus();
        selected = 0;
        highlight();
      }
    });

    if (input) {
      input.addEventListener("input", function () {
        var q = input.value.toLowerCase();
        items.forEach(function (item) {
          item.style.display = item.textContent.toLowerCase().indexOf(q) > -1 ? "" : "none";
        });
      });
      input.addEventListener("keydown", function (evt) {
        var visible = items.filter(function (i) { return i.style.display !== "none"; });
        if (evt.key === "ArrowDown") { evt.preventDefault(); selected = Math.min(selected + 1, visible.length - 1); highlight(); }
        if (evt.key === "ArrowUp") { evt.preventDefault(); selected = Math.max(selected - 1, 0); highlight(); }
        if (evt.key === "Enter" && visible[selected]) { visible[selected].click(); }
      });
    }

    palette.addEventListener("click", function (evt) {
      if (evt.target.closest(".aur-command__item")) {
        palette.close();
        showToast("실행됨: " + evt.target.closest(".aur-command__item").textContent.trim(), "info");
      }
    });
  }

  window.AuroraUI.components = {
    init: function () {
      initNavbar();
      initDropdowns();
      initOverlays();
      initDialogCursorGuard();
      initTabs();
      initAccordion();
      initCardToggles();
      initPasswordToggle();
      initRangeInputs();
      initOtp();
      initTagInput();
      initDropzone();
      initTable();
      initFormValidation();
      initCalendar();
      initKanban();
      initChat();
      initContextMenu();
      initCommandPalette();
    },
    showToast: showToast
  };
})();
