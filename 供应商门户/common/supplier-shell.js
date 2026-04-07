/**
 * 供应商门户 · 公共顶栏 + 侧栏
 *
 * 在各业务页 <head> 引入 supplier-shell.css，<body class="supplier-portal-body"> 内：
 * 1. 先于脚本设置 window.__SUPPLIER_SHELL__
 * 2. <div id="supplier-shell-topbar"></div>
 * 3. <div class="body-row"><div id="supplier-shell-sidebar"></div><main class="main">…</main></div>
 * 4. <script src="…/common/supplier-shell.js"></script>
 *
 * 配置项：
 * - portalRoot: 从当前 HTML 文件所在目录到「供应商门户」文件夹的相对路径（须以 / 结尾或脚本内会补全）
 * - tabLabel: 顶栏当前页签文案
 * - pageTitle: 可选，设置 document.title
 * - activeNav: 与侧栏二级菜单 label 完全一致，用于高亮
 * - airClaimNavBadgeCount: 可选，空运索赔菜单角标数字（待处理+申诉驳回条数）；≥1 显示红角标，0 隐藏；不传时原型默认 3（与列表示例一致）
 * - userCompany: 可选，顶栏右侧企业名称
 * - showTabClose: 可选，默认 true；每个页签右侧显示关闭「×」
 * - headerTabs: 可选，[{ label, href?, active? }] 自定义多页签；不提供时由 tabLabel 自动生成
 * - tabLabel: 当前页名称，用于侧栏高亮联动及默认页签
 */
(function () {
  "use strict";

  /**
   * 相对「供应商门户」根的路径；一级菜单顺序：线下洽谈舱位 → 运输跟进 → 账单管理
   * icon：与侧栏 SVG 对应（握手/仓库/账单）
   */
  var NAV_GROUPS = [
    {
      l1: "线下洽谈舱位",
      icon: "handshake",
      items: [
        { label: "线下洽谈舱位录入", href: "线下洽谈舱位/线下洽谈舱位录入.html" },
        { label: "线下洽谈舱位导入", href: "线下洽谈舱位/线下洽谈舱位导入.html" },
        { label: "线下洽谈舱位列表", href: "线下洽谈舱位/线下洽谈舱位列表.html" },
      ],
    },
    {
      l1: "运输跟进",
      icon: "warehouse",
      items: [
        { label: "仓库地址管理", href: "运输跟进/仓库地址管理.html" },
        { label: "送货仓库维护", href: "运输跟进/送货仓库维护.html" },
        { label: "提单信息维护", href: "运输跟进/提单信息维护.html" },
        { label: "航班运输跟进", href: "运输跟进/航班运输跟进.html" },
      ],
    },
    {
      l1: "账单管理",
      icon: "bill",
      items: [
        { label: "空运索赔", href: "账单管理/空运索赔/空运索赔列表.html", navBadgeKind: "airClaim" },
        { label: "账单对账", href: "账单管理/账单对账/账单对账列表.html" },
      ],
    },
  ];

  var ICONS = {
    home:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-7H10v7H5a1 1 0 01-1-1v-9.5z"/></svg>',
    bill:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/></svg>',
    handshake:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 14h2a2 2 0 002-2v-2a2 2 0 00-2-2h-1l-2-2H6v6"/><path d="M7 14v2a2 2 0 002 2h1"/><path d="M16.5 9.5L18 11l2 2v2a2 2 0 01-2 2h-2"/><path d="M13 14l2.5 2.5"/></svg>',
    warehouse:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21V10.5L12 4l9 6.5V21"/><path d="M9 21V12h6v9"/><path d="M9 21H3M21 21h-6"/></svg>',
    gear:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
    chevLeft:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
    globe:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    bellOutline:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    searchOutline:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
  };

  function iconWrap(name) {
    var svg = ICONS[name];
    if (!svg) return "";
    return '<span class="nav-ico" aria-hidden="true">' + svg + "</span>";
  }

  function getCfg() {
    return window.__SUPPLIER_SHELL__ || {};
  }

  function normalizeRoot(root) {
    if (root == null || String(root).trim() === "") return "./";
    var s = String(root).trim();
    return /\/$/.test(s) ? s : s + "/";
  }

  function escAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function escHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function buildTopBrandHtml(root) {
    var homeHref = escAttr(root + "首页.html");
    return (
      '<div class="top-header-brand">' +
      '<a href="' +
      homeHref +
      '" class="top-brand-link">' +
      '<div class="top-brand-logo-col">' +
      '<div class="top-brand-wanb-line" aria-hidden="true">' +
      '<span class="top-brand-w">W</span><span class="top-brand-an">AN</span><span class="top-brand-b">B</span>' +
      "</div>" +
      '<div class="top-brand-express">EXPRESS</div>' +
      "</div>" +
      '<span class="top-brand-product">供应商系统</span>' +
      "</a>" +
      "</div>"
    );
  }

  function buildHeaderTabsHtml(cfg, root) {
    var homeHref = escAttr(root + "首页.html");
    var tabLabel = cfg.tabLabel != null ? String(cfg.tabLabel) : "页面";
    var showClose = cfg.showTabClose !== false;
    var closeEl = function (isActive) {
      if (!showClose) return "";
      var c = isActive ? "header-tab-close is-on-active" : "header-tab-close";
      return (
        '<span class="' +
        c +
        '" title="关闭" role="button" tabindex="0" aria-label="关闭页签">×</span>'
      );
    };

    var raw = cfg.headerTabs;
    var list = [];
    if (raw && raw.length) {
      var hasExplicit = raw.some(function (t) {
        return t.active === true;
      });
      raw.forEach(function (t) {
        var label = t.label != null ? String(t.label) : "";
        if (!label) return;
        var href =
          t.href != null && String(t.href).trim() !== ""
            ? escAttr(root + String(t.href).replace(/^\//, ""))
            : "";
        var active = t.active === true || (!hasExplicit && label === tabLabel);
        list.push({ label: label, href: href, active: active });
      });
      if (list.length && !list.some(function (x) {
        return x.active;
      })) {
        list[list.length - 1].active = true;
      }
    } else if (tabLabel === "首页") {
      list = [{ label: "首页", href: homeHref, active: true }];
    } else {
      list = [
        { label: "首页", href: homeHref, active: false },
        { label: tabLabel, href: "", active: true },
      ];
    }

    return list
      .map(function (t) {
        var text = escHtml(t.label);
        var inner = '<span class="header-tab-text">' + text + "</span>" + closeEl(t.active);
        var cls = "header-tab" + (t.active ? " is-active" : "");
        if (t.active && !t.href) {
          return (
            '<span class="' +
            cls +
            '" role="tab" aria-selected="true">' +
            inner +
            "</span>"
          );
        }
        var h = t.href || homeHref;
        return (
          '<a href="' +
          h +
          '" class="' +
          cls +
          '" role="tab" aria-selected="' +
          (t.active ? "true" : "false") +
          '">' +
          inner +
          "</a>"
        );
      })
      .join("");
  }

  function buildTopbarHtml() {
    var cfg = getCfg();
    var userCompany =
      cfg.userCompany != null && String(cfg.userCompany).trim() !== ""
        ? escHtml(String(cfg.userCompany).trim())
        : "厦门火炬集团货运代理有限公司";
    var root = normalizeRoot(cfg.portalRoot);
    var tabsInner = buildHeaderTabsHtml(cfg, root);

    return (
      '<header class="top-header">' +
      buildTopBrandHtml(root) +
      '<div class="tab-strip" role="tablist">' +
      tabsInner +
      "</div>" +
      '<div class="header-tools">' +
      '<button type="button" class="header-tool-btn" aria-label="搜索" title="搜索">' +
      ICONS.searchOutline +
      "</button>" +
      '<button type="button" class="header-tool-btn" aria-label="通知" title="通知">' +
      ICONS.bellOutline +
      "</button>" +
      '<button type="button" class="header-lang-btn" aria-label="语言">' +
      '<span class="header-lang-ico" aria-hidden="true">' +
      ICONS.globe +
      "</span>" +
      "<span>English</span>" +
      "</button>" +
      '<div class="user-company" role="button" tabindex="0">' +
      "<span>" +
      userCompany +
      '</span><span class="chevron-down" aria-hidden="true">▼</span></div>' +
      "</div></header>"
    );
  }

  /** 空运索赔侧栏角标：待处理 + 申诉驳回数量（原型可由 airClaimNavBadgeCount 覆盖） */
  function getAirClaimNavBadgeCount(cfg) {
    var n = cfg.airClaimNavBadgeCount;
    if (n === undefined || n === null) return 3;
    n = Number(n);
    if (isNaN(n) || n < 0) return 0;
    return Math.min(999, Math.floor(n));
  }

  function getNavItemBadgeCount(it, cfg) {
    if (it.navBadgeKind === "airClaim") return getAirClaimNavBadgeCount(cfg);
    return 0;
  }

  function buildNavItemL2InnerHtml(it, cfg) {
    var count = getNavItemBadgeCount(it, cfg);
    if (count <= 0) return escHtml(it.label);
    var display = count > 99 ? "99+" : String(count);
    var aria =
      "待处理或申诉驳回 " + (count > 99 ? "99 条以上" : count + " 条");
    return (
      '<span class="nav-item-l2-row">' +
      '<span class="nav-item-l2-text">' +
      escHtml(it.label) +
      "</span>" +
      '<span class="nav-item-l2-badge" aria-label="' +
      escAttr(aria) +
      '">' +
      escHtml(display) +
      "</span></span>"
    );
  }

  function buildSidebarHtml() {
    var cfg = getCfg();
    var active = cfg.activeNav != null ? String(cfg.activeNav).trim() : "";
    var root = normalizeRoot(cfg.portalRoot);

    var homeHref = escAttr(root + "首页.html");
    var l0 =
      '<div class="nav-block"><a href="' +
      homeHref +
      '" class="nav-item-l0' +
      (active === "首页" ? " is-active" : "") +
      '">' +
      iconWrap("home") +
      "<span>" +
      escHtml("首页") +
      "</span></a></div>";

    var groups = NAV_GROUPS.map(function (g) {
      var hasActive = g.items.some(function (it) {
        return it.label === active;
      });
      var openClass = hasActive ? " is-open" : "";
      var activeChildClass = hasActive ? " has-active-child" : "";
      var sub = g.items
        .map(function (it) {
          var href = root + it.href.replace(/^\//, "");
          var ac = it.label === active ? " is-active" : "";
          var inner = buildNavItemL2InnerHtml(it, cfg);
          return (
            '<a href="' +
            escAttr(href) +
            '" class="nav-item-l2' +
            ac +
            '">' +
            inner +
            "</a>"
          );
        })
        .join("");
      return (
        '<div class="nav-block nav-group' +
        openClass +
        activeChildClass +
        '">' +
        '<button type="button" class="nav-l1" aria-expanded="' +
        (hasActive ? "true" : "false") +
        '">' +
        '<span class="nav-l1-left">' +
        iconWrap(g.icon || "bill") +
        '<span class="nav-l1-text">' +
        escHtml(g.l1) +
        "</span></span>" +
        '<span class="nav-l1-chev">▼</span></button>' +
        '<div class="nav-sub">' +
        sub +
        "</div></div>"
      );
    }).join("");

    var foot =
      '<div class="sidebar-foot">' +
      '<button type="button" class="sidebar-foot-btn" title="设置" aria-label="设置">' +
      ICONS.gear +
      "</button>" +
      '<button type="button" class="sidebar-foot-btn sidebar-foot-btn--collapse" data-supplier-sidebar-collapse title="收起侧栏" aria-label="收起侧栏">' +
      ICONS.chevLeft +
      "</button>" +
      "</div>";

    return (
      '<aside class="sidebar-shell" aria-label="侧栏导航">' +
      '<nav class="sidebar-nav">' +
      l0 +
      groups +
      "</nav>" +
      foot +
      "</aside>"
    );
  }

  function bindTopbar(header) {
    if (!header) return;
    header.addEventListener(
      "mousedown",
      function (e) {
        if (e.target.closest(".header-tab-close")) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
    header.addEventListener("click", function (e) {
      var x = e.target.closest(".header-tab-close");
      if (!x) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        window.alert("原型：关闭页签");
      } catch (err) {}
    });
  }

  function parseHtml(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function bindSidebarAccordion(aside) {
    if (!aside) return;
    var groups = aside.querySelectorAll(".nav-group");
    function setOpen(group, open) {
      group.classList.toggle("is-open", open);
      var btn = group.querySelector("button.nav-l1");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      var hasCur = !!group.querySelector(".nav-item-l2.is-active");
      group.classList.toggle("has-active-child", hasCur && open);
    }
    groups.forEach(function (group) {
      var btn = group.querySelector("button.nav-l1");
      if (!btn) return;
      btn.addEventListener("click", function () {
        if (group.querySelector(".nav-item-l2.is-active")) {
          setOpen(group, true);
          return;
        }
        var willOpen = !group.classList.contains("is-open");
        setOpen(group, willOpen);
      });
    });
    groups.forEach(function (group) {
      if (group.querySelector(".nav-item-l2.is-active")) {
        setOpen(group, true);
      }
    });
  }

  function bindSidebarChrome(aside) {
    if (!aside) return;
    var c = aside.querySelector("[data-supplier-sidebar-collapse]");
    if (c) {
      c.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-collapsed");
        var expanded = !document.body.classList.contains("sidebar-collapsed");
        c.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
    }
    var settings = aside.querySelector(".sidebar-foot .sidebar-foot-btn:not([data-supplier-sidebar-collapse])");
    if (settings) {
      settings.addEventListener("click", function () {
        try {
          window.alert("原型：系统设置");
        } catch (e) {}
      });
    }
  }

  function mount() {
    var cfg = getCfg();
    if (cfg.pageTitle) {
      document.title = String(cfg.pageTitle);
    }

    var topMount = document.getElementById("supplier-shell-topbar");
    var sideMount = document.getElementById("supplier-shell-sidebar");
    if (!topMount || !sideMount) return;

    var header = parseHtml(buildTopbarHtml());
    topMount.replaceWith(header);
    bindTopbar(header);

    var aside = parseHtml(buildSidebarHtml());
    sideMount.replaceWith(aside);
    bindSidebarAccordion(aside);
    bindSidebarChrome(aside);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
