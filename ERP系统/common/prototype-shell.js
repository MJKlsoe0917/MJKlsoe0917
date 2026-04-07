/**
 * 产品原型 · 公共顶栏（导航栏）+ 左侧菜单栏
 * 脚本与样式位于「产品原型/common/」，供城际要车、排舱系统、配舱系统、外销订单、运单管理等模块引用。
 *
 * 顶栏切换（排舱 / 配舱 / 要车 / 外销 / 运单）时，左侧菜单按模块自动切换。
 *
 * 引用路径（按当前 HTML 到「产品原型/common/」的相对深度填写）：
 * - 城际要车/城际运输报价/<模块>/：../../../common/prototype-shell.css（.js）
 * - 排舱系统、外销订单、运单管理、配舱系统等模块内一级子目录：../common/prototype-shell.*
 * - 每多一层子目录，多加一个 ../
 *
 * 示例（城际要车/城际运输报价/国内空运/某页.html）：
 * 1. <link rel="stylesheet" href="../../../common/prototype-shell.css" />
 * 2. <script>window.__PROTOTYPE_SHELL__ = { module: "…", active: "…", topbarActive: "要车" };</script>
 *    <div id="prototype-shell-topbar"></div>
 *    <div class="app-layout"><div id="prototype-shell-sidebar"></div><main class="main-area">…</main></div>
 * 3. <script src="../../../common/prototype-shell.js"></script>
 *
 * page-shell-template.html 与本文件同目录，打开模板时可用同目录引用：href="prototype-shell.css"。
 *
 * 仍兼容：__INTERCITY_SHELL__、#intercity-shell-*
 *
 * module / active：'专车报价' | '拼车报价' | '国内空运'（仅「要车」顶栏下报价子菜单高亮用）
 * topbarActive：'排舱' | '配舱' | '要车' | '外销' | '运单'（默认 '排舱'）
 *
 * 可选 sidebarFromProductRoot：从当前页所在目录到「产品原型」根的相对路径，用于侧栏外链与顶栏切换跳转。
 * 例：页面在 城际要车/城际运输报价/国内空运/ 下时写 "../../../"。
 * 不设置时除「要车·城际运输报价」三项外，二级菜单多为 # 占位；顶栏点击也不会整页跳转（仅切换当前页侧栏）。
 * topbarNavigate：设为 false 可关闭「点击顶栏模块跳转到该模块默认页」。
 * sidebarActiveL1 / sidebarActiveL2：与侧栏一级、二级文案一致时，该二级项带 .active 且所属一级展开（也可由顶栏跳转经 sessionStorage 自动写入）。
 */
(function () {
  "use strict";

  var MENU_META = {
    专车报价: { folder: "专车报价", listFile: "专车报价列表.html" },
    拼车报价: { folder: "拼车报价", listFile: "拼车报价列表.html" },
    国内空运: { folder: "国内空运", listFile: "空运报价列表.html" },
  };

  /** 顶栏模块 -> 侧栏：{ l1, l2[] }；l2 为空表示无二级（仅一级文案） */
  var SIDEBAR_TREE = {
    配舱: [
      { l1: "出库计划", l2: ["出库计划模板", "出库计划列表", "虚拟舱列表"] },
      { l1: "舱位配载", l2: ["舱位配载", "箱号导入"] },
    ],
    排舱: [
      {
        l1: "系统管理",
        l2: ["区域管理", "航司信息", "线路负责人", "板型配置", "消息通知配置", "审批配置"],
      },
      { l1: "需求管理", l2: ["需求列表", "导入需求价格", "需求日历"] },
      {
        l1: "舱位管理",
        l2: ["创建舱位", "导入舱位", "提报舱位", "已采舱位"],
      },
      { l1: "空运报表", l2: ["舱位采购报表", "采购价格管理"] },
      { l1: "账单管理", l2: ["费用变更审批", "空运索赔", "账单管理"] },
    ],
    外销: [
      {
        l1: "外销订单",
        l2: ["外销订单列表", "外销订单导入", "收入导入", "归属平台组别"],
      },
      { l1: "箱子管理", l2: ["箱子列表", "导入箱子"] },
    ],
    运单: [
      {
        l1: "运单管理",
        l2: ["运单概览", "主运单列表", "运单列表", "异常运单", "新建运单"],
      },
      { l1: "运单节点", l2: ["新建运单节点", "运单节点列表"] },
      { l1: "监控报表", l2: ["提单时效监控"] },
    ],
    要车: [
      {
        l1: "城际运输资料",
        l2: ["提/卸货仓列表", "封关口岸列表", "提/卸货地列表"],
      },
      { l1: "城际运输报价", l2: ["专车报价", "拼车报价", "空运报价"] },
      { l1: "城际运输管理", l2: ["创建城际要车", "城际要车列表"] },
    ],
  };

  /**
   * 相对「产品原型」根的路径（需配合 sidebarFromProductRoot）
   * key = 顶栏|一级|二级
   */
  var SIDEBAR_HREF_REL = {
    "配舱|出库计划|出库计划模板": "配舱系统/出库计划/出库计划模板.html",
    "配舱|出库计划|出库计划列表": "配舱系统/出库计划/出库计划.html",
    "排舱|系统管理|区域管理": "排舱系统/系统管理/区域管理.html",
    "排舱|舱位管理|创建舱位": "排舱系统/提报舱位/创建舱位.html",
    "排舱|舱位管理|提报舱位": "排舱系统/舱位管理/提报舱位.html",
    "排舱|舱位管理|已采舱位": "排舱系统/舱位管理/已采舱位.html",
    "排舱|空运报表|舱位采购报表": "排舱系统/空运报表/舱位采购报表.html",
    "排舱|空运报表|采购价格管理": "排舱系统/空运报表/采购价格管理.html",
    "排舱|账单管理|空运索赔": "排舱系统/账单管理/空运索赔/空运索赔列表.html",
    "外销|外销订单|外销订单列表": "外销订单/外销订单列表.html",
    "运单|运单管理|运单列表": "运单管理/运单列表.html",
    "要车|城际运输管理|创建城际要车": "城际要车/城际要车管理/创建城际要车.html",
    "要车|城际运输管理|城际要车列表": "城际要车/城际要车管理/城际要车列表.html",
    "要车|城际运输报价|专车报价": "城际要车/城际运输报价/专车报价/专车报价列表.html",
    "要车|城际运输报价|拼车报价": "城际要车/城际运输报价/拼车报价/拼车报价列表.html",
    "要车|城际运输报价|空运报价": "城际要车/城际运输报价/国内空运/空运报价列表.html",
    "要车|城际运输资料|封关口岸列表": "城际要车/城际要车资料/封关口岸列表.html",
    "要车|城际运输资料|提/卸货地列表": "城际要车/城际要车资料/提卸货地列表.html",
    "要车|城际运输资料|提/卸货仓列表": "城际要车/城际要车资料/提卸货仓列表.html",
  };

  var ICON_L1 =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M3 7V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9C21 7.9 20.1 7 19 7H12L10 5H5C3.9 5 3 5.9 3 7Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
    "</svg>";
  var ICON_L2 =
    '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M14 2V8H20" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
    "</svg>";

  function getCfg() {
    return window.__PROTOTYPE_SHELL__ || window.__INTERCITY_SHELL__ || {};
  }

  function relListHref(targetKey, currentModule) {
    var m = MENU_META[targetKey];
    if (!m) return "#";
    var cfg = getCfg();
    var prefix =
      cfg.listHrefPrefix != null && String(cfg.listHrefPrefix).trim() !== ""
        ? String(cfg.listHrefPrefix).trim()
        : "";
    if (!/\/$/.test(prefix) && prefix !== "") {
      prefix += "/";
    }
    if (targetKey === currentModule) {
      return m.listFile;
    }
    if (prefix) {
      return prefix + m.folder + "/" + m.listFile;
    }
    return "../" + m.folder + "/" + m.listFile;
  }

  function subItemLink(key, label, activeKey, currentModule, isActiveOverride) {
    var href = relListHref(key, currentModule);
    var isActive =
      isActiveOverride !== undefined ? !!isActiveOverride : activeKey === key;
    var cls = "menu-item" + (isActive ? " active" : "");
    return (
      '<a href="' +
      href +
      '" class="' +
      cls +
      '">' +
      '<span class="menu-icon menu-icon--l2" aria-hidden="true">' +
      ICON_L2 +
      "</span>" +
      '<span class="menu-item-text">' +
      label +
      "</span></a>"
    );
  }

  function escapeHtmlText(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function isSidebarL2Active(cfg, l1, l2Label) {
    return (
      cfg.sidebarActiveL1 != null &&
      cfg.sidebarActiveL2 != null &&
      String(cfg.sidebarActiveL1) === l1 &&
      String(cfg.sidebarActiveL2) === l2Label
    );
  }

  function resolveSidebarHref(topbar, l1, l2) {
    var key = topbar + "|" + l1 + "|" + l2;
    var rel = SIDEBAR_HREF_REL[key];
    var root = getCfg().sidebarFromProductRoot;
    if (rel && root != null && String(root).trim() !== "") {
      var r = String(root).trim().replace(/\/?$/, "/");
      return r + rel.replace(/^\//, "");
    }
    return "#";
  }

  function l2RowHtml(topbar, l1, l2Label) {
    var cfg = getCfg();
    var currentModule = cfg.module || "专车报价";
    var activeKey = cfg.active != null ? cfg.active : currentModule;
    if (topbar === "要车" && l1 === "城际运输报价") {
      var hrefQuote = resolveSidebarHref(topbar, l1, l2Label);
      var innerQuote =
        '<span class="menu-icon menu-icon--l2" aria-hidden="true">' +
        ICON_L2 +
        "</span>" +
        '<span class="menu-item-text">' +
      escapeHtmlText(l2Label) +
      "</span>";
      var activeModQuote = cfg.active != null ? cfg.active : currentModule;
      var quoteActive = false;
      if (cfg.sidebarActiveL1 != null && cfg.sidebarActiveL2 != null) {
        quoteActive = isSidebarL2Active(cfg, l1, l2Label);
      } else {
        if (l2Label === "专车报价") quoteActive = activeModQuote === "专车报价";
        else if (l2Label === "拼车报价") quoteActive = activeModQuote === "拼车报价";
        else if (l2Label === "空运报价") quoteActive = activeModQuote === "国内空运";
      }
      var miClsQuote = quoteActive ? "menu-item active" : "menu-item";
      if (hrefQuote && hrefQuote !== "#") {
        return '<a href="' + escAttr(hrefQuote) + '" class="' + miClsQuote + '">' + innerQuote + "</a>";
      }
      var metaKey = l2Label === "空运报价" ? "国内空运" : l2Label;
      return subItemLink(metaKey, l2Label, activeKey, currentModule, quoteActive);
    }
    var href = resolveSidebarHref(topbar, l1, l2Label);
    var inner =
      '<span class="menu-icon menu-icon--l2" aria-hidden="true">' +
      ICON_L2 +
      "</span>" +
      '<span class="menu-item-text">' +
      escapeHtmlText(l2Label) +
      "</span>";
    var miCls = isSidebarL2Active(cfg, l1, l2Label) ? "menu-item active" : "menu-item";
    if (href && href !== "#") {
      return '<a href="' + escAttr(href) + '" class="' + miCls + '">' + inner + "</a>";
    }
    return '<div class="' + miCls + '">' + inner + "</div>";
  }

  function menuGroupHtml(topbar, group) {
    if (!group.l2 || group.l2.length === 0) {
      return (
        '<div class="menu-group">' +
        '<div class="menu-level1 menu-level1--static">' +
        escapeHtmlText(group.l1) +
        "</div></div>"
      );
    }
    var sub = group.l2
      .map(function (l2) {
        return l2RowHtml(topbar, group.l1, l2);
      })
      .join("");
    return (
      '<div class="menu-group">' +
      '<button type="button" class="menu-level1" aria-expanded="false">' +
      '<span class="menu-level1-main">' +
      '<span class="menu-icon menu-icon--l1" aria-hidden="true">' +
      ICON_L1 +
      "</span>" +
      '<span class="menu-level1-text">' +
      escapeHtmlText(group.l1) +
      "</span></span>" +
      '<span class="menu-chevron" aria-hidden="true">▼</span></button>' +
      '<div class="menu-sub">' +
      sub +
      "</div></div>"
    );
  }

  function buildSidebarHtmlForTopbar(topbarMod) {
    var tree = SIDEBAR_TREE[topbarMod];
    if (!tree || !tree.length) return "";
    return tree
      .map(function (g) {
        return menuGroupHtml(topbarMod, g);
      })
      .join("");
  }

  function normalizeTopbarMod(name) {
    if (TOPBAR_MOD_LABELS.indexOf(name) >= 0) return name;
    return "排舱";
  }

  var ICON_HAMBURGER =
    '<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>' +
    "</svg>";

  var ICON_TOPBAR_MOD =
    '<svg class="topbar-mod-icon" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect class="topbar-mod-icon-back" x="9" y="4" width="14" height="14" rx="1.5" />' +
    '<rect class="topbar-mod-icon-front" x="3" y="10" width="14" height="14" rx="1.5" />' +
    "</svg>";

  var TOPBAR_MOD_LABELS = ["排舱", "配舱", "要车", "外销", "运单"];

  /** 点击顶栏模块后打开的默认页（相对产品原型根，需配置 sidebarFromProductRoot） */
  var TOPBAR_DEFAULT_HREF_REL = {
    配舱: "配舱系统/出库计划/出库计划.html",
    排舱: "排舱系统/舱位管理/已采舱位.html",
    外销: "外销订单/外销订单列表.html",
    运单: "运单管理/运单列表.html",
    要车: "城际要车/城际要车管理/城际要车列表.html",
  };

  /** 跳转后 / 顶栏切换时期望展开的一级与选中的二级（展示文案须与 SIDEBAR_TREE 一致） */
  var TOPBAR_DEFAULT_SIDEBAR_FOCUS = {
    配舱: { l1: "出库计划", l2: "出库计划列表" },
    排舱: { l1: "舱位管理", l2: "已采舱位" },
    外销: { l1: "外销订单", l2: "外销订单列表" },
    运单: { l1: "运单管理", l2: "运单列表" },
    要车: { l1: "城际运输管理", l2: "城际要车列表" },
  };

  var PENDING_TOPBAR_KEY = "prototype-shell-topbar-mod";
  var PENDING_SIDEBAR_FOCUS_KEY = "prototype-shell-sidebar-focus";

  function applyPendingTopbarFromNavigation() {
    try {
      var v = sessionStorage.getItem(PENDING_TOPBAR_KEY);
      if (v && TOPBAR_MOD_LABELS.indexOf(v) >= 0) {
        sessionStorage.removeItem(PENDING_TOPBAR_KEY);
        window.__PROTOTYPE_SHELL__ = window.__PROTOTYPE_SHELL__ || {};
        window.__PROTOTYPE_SHELL__.topbarActive = v;
        if (window.__INTERCITY_SHELL__) {
          window.__INTERCITY_SHELL__.topbarActive = v;
        }
      }
    } catch (e) {}
  }

  function applyPendingSidebarFocus() {
    try {
      var raw = sessionStorage.getItem(PENDING_SIDEBAR_FOCUS_KEY);
      if (!raw) return;
      sessionStorage.removeItem(PENDING_SIDEBAR_FOCUS_KEY);
      var o = JSON.parse(raw);
      if (!o || o.l1 == null || o.l2 == null) return;
      window.__PROTOTYPE_SHELL__ = window.__PROTOTYPE_SHELL__ || {};
      window.__PROTOTYPE_SHELL__.sidebarActiveL1 = String(o.l1);
      window.__PROTOTYPE_SHELL__.sidebarActiveL2 = String(o.l2);
      if (window.__INTERCITY_SHELL__) {
        window.__INTERCITY_SHELL__.sidebarActiveL1 = String(o.l1);
        window.__INTERCITY_SHELL__.sidebarActiveL2 = String(o.l2);
      }
    } catch (e) {}
  }

  function applySidebarFocusToDom(aside, focus) {
    if (!aside || !focus || focus.l1 == null || focus.l2 == null) return;
    aside.querySelectorAll(".menu-item.active").forEach(function (el) {
      el.classList.remove("active");
    });
    aside.querySelectorAll(".menu-group").forEach(function (group) {
      var l1El = group.querySelector("button.menu-level1 .menu-level1-text");
      var l1Text = l1El ? l1El.textContent.trim() : "";
      if (l1Text !== String(focus.l1)) return;
      group.classList.add("is-open");
      var openBtn = group.querySelector("button.menu-level1");
      if (openBtn) openBtn.setAttribute("aria-expanded", "true");
      group.querySelectorAll(".menu-sub .menu-item").forEach(function (item) {
        var tn = item.querySelector(".menu-item-text");
        if (tn && tn.textContent.trim() === String(focus.l2)) {
          item.classList.add("active");
        }
      });
    });
  }

  /** @returns {boolean} 是否已触发整页跳转 */
  function navigateToTopbarDefaultPage(mod) {
    var cfg = getCfg();
    if (cfg.topbarNavigate === false) return false;
    var rel = TOPBAR_DEFAULT_HREF_REL[mod];
    var root = cfg.sidebarFromProductRoot;
    if (!rel || root == null || String(root).trim() === "") return false;
    var url = String(root).trim().replace(/\/?$/, "/") + rel.replace(/^\//, "");
    var same = false;
    try {
      var resolved = new URL(url, window.location.href).href.replace(/#.*$/, "");
      var here = window.location.href.replace(/#.*$/, "");
      same = resolved === here;
    } catch (e3) {}
    if (same) return false;
    var focus = TOPBAR_DEFAULT_SIDEBAR_FOCUS[mod];
    try {
      if (focus && focus.l1 != null && focus.l2 != null) {
        sessionStorage.setItem(PENDING_SIDEBAR_FOCUS_KEY, JSON.stringify(focus));
      }
      sessionStorage.setItem(PENDING_TOPBAR_KEY, mod);
    } catch (e2) {}
    window.location.href = url;
    return true;
  }

  function buildTopbarHtml() {
    var cfg = getCfg();
    var activeMod = normalizeTopbarMod(cfg.topbarActive || "排舱");
    var userName =
      cfg.topbarUserName != null && String(cfg.topbarUserName).trim() !== ""
        ? String(cfg.topbarUserName).trim()
        : "Feilong Shi";
    userName = escapeHtmlText(userName);

    var navInner = TOPBAR_MOD_LABELS.map(function (label) {
      var isActive = label === activeMod ? " is-active" : "";
      return (
        '<button type="button" class="topbar-mod' +
        isActive +
        '" data-topbar-mod="' +
        label +
        '">' +
        ICON_TOPBAR_MOD +
        '<span class="topbar-mod-label">' +
        label +
        "</span></button>"
      );
    }).join("");

    return (
      '<header class="topbar">' +
      '<div class="topbar-tray">' +
      '<div class="topbar-brand">' +
      '<span class="logo">万邦速达</span></div>' +
      '<button type="button" class="topbar-menu-btn" aria-label="收起或展开侧栏菜单" title="收起/展开侧栏" aria-expanded="true" data-topbar-toggle-sidebar>' +
      ICON_HAMBURGER +
      "</button></div>" +
      '<nav class="topbar-module-nav" aria-label="系统菜单">' +
      navInner +
      "</nav>" +
      '<div class="topbar-user">' +
      '<span class="topbar-user-name">' +
      userName +
      "</span></div></header>"
    );
  }

  function bindTopbar(header, aside) {
    if (!header) return;
    var layout = document.querySelector(".app-layout");
    var toggle = header.querySelector("[data-topbar-toggle-sidebar]");
    if (toggle && layout) {
      toggle.addEventListener("click", function () {
        var collapsed = layout.classList.toggle("sidebar-is-collapsed");
        document.body.classList.toggle("sidebar-is-collapsed", collapsed);
        toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      });
    }
    var mods = header.querySelectorAll(".topbar-mod[data-topbar-mod]");
    mods.forEach(function (btn) {
      btn.addEventListener("click", function () {
        mods.forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        var name = btn.getAttribute("data-topbar-mod");
        if (aside && name) {
          aside.innerHTML = buildSidebarHtmlForTopbar(name);
          bindSidebarAccordion(aside);
        }
        if (name && typeof window.CustomEvent === "function") {
          var detail = { mod: name };
          try {
            window.dispatchEvent(new CustomEvent("prototype-shell-topbar-mod", { detail: detail }));
          } catch (e) {}
          try {
            window.dispatchEvent(new CustomEvent("intercity-topbar-mod", { detail: detail }));
          } catch (e) {}
        }
        if (name) {
          var jumped = navigateToTopbarDefaultPage(name);
          if (!jumped && aside) {
            applySidebarFocusToDom(aside, TOPBAR_DEFAULT_SIDEBAR_FOCUS[name]);
          }
        }
      });
    });
  }

  function parseHtml(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function bindSidebarAccordion(root) {
    var groups = root.querySelectorAll(".menu-group");
    function setOpen(group, open) {
      group.classList.toggle("is-open", open);
      var btn = group.querySelector("button.menu-level1");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    groups.forEach(function (group) {
      var btn = group.querySelector("button.menu-level1");
      if (!btn) return;
      btn.addEventListener("click", function () {
        setOpen(group, !group.classList.contains("is-open"));
      });
    });
    groups.forEach(function (group) {
      var hasActive = !!group.querySelector(".menu-item.active");
      group.classList.toggle("has-active-child", hasActive);
      if (hasActive) {
        setOpen(group, true);
      }
    });
  }

  function mount() {
    applyPendingTopbarFromNavigation();
    applyPendingSidebarFocus();
    var topMount =
      document.getElementById("prototype-shell-topbar") ||
      document.getElementById("intercity-shell-topbar");
    var sideMount =
      document.getElementById("prototype-shell-sidebar") ||
      document.getElementById("intercity-shell-sidebar");
    if (topMount) {
      var h = parseHtml(buildTopbarHtml());
      topMount.replaceWith(h);
      var aside = null;
      if (sideMount) {
        aside = document.createElement("aside");
        aside.className = "sidebar-menu";
        var initialMod = normalizeTopbarMod(getCfg().topbarActive || "排舱");
        aside.innerHTML = buildSidebarHtmlForTopbar(initialMod);
        sideMount.replaceWith(aside);
        bindSidebarAccordion(aside);
      }
      bindTopbar(h, aside);
    } else if (sideMount) {
      var asideOnly = document.createElement("aside");
      asideOnly.className = "sidebar-menu";
      var im = normalizeTopbarMod(getCfg().topbarActive || "排舱");
      asideOnly.innerHTML = buildSidebarHtmlForTopbar(im);
      sideMount.replaceWith(asideOnly);
      bindSidebarAccordion(asideOnly);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
