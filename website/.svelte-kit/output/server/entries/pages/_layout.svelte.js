import { a as ensure_array_like, b as attr, c as attr_class, e as escape_html, d as derived } from "../../chunks/index.js";
import { p as page } from "../../chunks/index2.js";
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    const navLinks = [
      { href: "/", label: "Start" },
      { href: "/download", label: "Download" },
      { href: "/docs/getting-started", label: "Dokumentation" }
    ];
    const docsLinks = [
      { href: "/docs/getting-started", label: "Erste Schritte" },
      { href: "/docs/style-dimensions", label: "Style-Regler" },
      { href: "/docs/faq", label: "FAQ" },
      { href: "/docs/privacy", label: "Datenschutz" }
    ];
    let isDocs = derived(() => page.url.pathname.startsWith("/docs"));
    $$renderer2.push(`<div class="min-h-screen flex flex-col bg-base-100"><nav class="navbar bg-base-200 border-b border-base-300 px-4 md:px-8"><div class="navbar-start"><a href="/" class="flex items-center gap-2 font-bold text-lg"><span class="text-primary">Tequalizer</span></a></div> <div class="navbar-center hidden lg:flex"><ul class="menu menu-horizontal px-1 gap-1"><!--[-->`);
    const each_array = ensure_array_like(navLinks);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let link = each_array[$$index];
      $$renderer2.push(`<li><a${attr("href", link.href)}${attr_class("", void 0, {
        "active": page.url.pathname === link.href || link.href.startsWith("/docs") && isDocs()
      })}>${escape_html(link.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--></ul></div> <div class="navbar-end gap-2"><a href="/download" class="btn btn-primary btn-sm hidden md:flex">Download</a> <div class="dropdown dropdown-end lg:hidden"><div tabindex="0" role="button" class="btn btn-ghost btn-square"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></div> <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-52 p-2 shadow"><!--[-->`);
    const each_array_1 = ensure_array_like(navLinks);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let link = each_array_1[$$index_1];
      $$renderer2.push(`<li><a${attr("href", link.href)}>${escape_html(link.label)}</a></li>`);
    }
    $$renderer2.push(`<!--]--> `);
    if (isDocs()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<li class="menu-title mt-2">Dokumentation</li> <!--[-->`);
      const each_array_2 = ensure_array_like(docsLinks);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let link = each_array_2[$$index_2];
        $$renderer2.push(`<li><a${attr("href", link.href)}>${escape_html(link.label)}</a></li>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></ul></div></div></nav> `);
    if (isDocs()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex flex-1"><aside class="hidden lg:flex flex-col w-56 shrink-0 border-r border-base-300 bg-base-200 py-6 px-4 gap-1"><p class="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 px-2">Dokumentation</p> <!--[-->`);
      const each_array_3 = ensure_array_like(docsLinks);
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let link = each_array_3[$$index_3];
        $$renderer2.push(`<a${attr("href", link.href)}${attr_class("btn btn-ghost btn-sm justify-start font-normal", void 0, { "btn-active": page.url.pathname === link.href })}>${escape_html(link.label)}</a>`);
      }
      $$renderer2.push(`<!--]--></aside> <main class="flex-1 min-w-0 py-10 px-6 md:px-12 max-w-3xl">`);
      children($$renderer2);
      $$renderer2.push(`<!----></main></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<main class="flex-1">`);
      children($$renderer2);
      $$renderer2.push(`<!----></main>`);
    }
    $$renderer2.push(`<!--]--> <footer class="footer footer-center bg-base-200 border-t border-base-300 py-6 px-4 text-base-content/60 text-sm"><div class="flex flex-wrap justify-center gap-x-6 gap-y-2"><a href="/" class="hover:text-base-content transition-colors">Start</a> <a href="/download" class="hover:text-base-content transition-colors">Download</a> <a href="/docs/getting-started" class="hover:text-base-content transition-colors">Dokumentation</a> <a href="/docs/privacy" class="hover:text-base-content transition-colors">Datenschutz</a></div> <p class="mt-3">© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} Elias Klassen - Tequalizer</p></footer></div>`);
  });
}
export {
  _layout as default
};
