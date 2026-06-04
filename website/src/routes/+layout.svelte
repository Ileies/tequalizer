<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  const navLinks = [
    { href: '/', label: 'Start' },
    { href: '/download', label: 'Download' },
    { href: '/docs/getting-started', label: 'Dokumentation' }
  ];

  const docsLinks = [
    { href: '/docs/getting-started', label: 'Erste Schritte' },
    { href: '/docs/style-dimensions', label: 'Style-Regler' },
    { href: '/docs/faq', label: 'FAQ' },
    { href: '/docs/privacy', label: 'Datenschutz' }
  ];

  let isDocs = $derived(page.url.pathname.startsWith('/docs'));
</script>

<div class="min-h-screen flex flex-col bg-base-100">
  <nav class="navbar bg-base-200 border-b border-base-300 px-4 md:px-8">
    <div class="navbar-start">
      <a href="/" class="flex items-center gap-2 font-bold text-lg">
        <span class="text-primary">Tequalizer</span>
      </a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-1">
        {#each navLinks as link}
          <li>
            <a
              href={link.href}
              class:active={page.url.pathname === link.href || (link.href.startsWith('/docs') && isDocs)}
            >
              {link.label}
            </a>
          </li>
        {/each}
      </ul>
    </div>
    <div class="navbar-end gap-2">
      <a href="/download" class="btn btn-primary btn-sm hidden md:flex">Download</a>
      <div class="dropdown dropdown-end lg:hidden">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div tabindex="0" role="button" class="btn btn-ghost btn-square">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <ul tabindex="0" class="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-52 p-2 shadow">
          {#each navLinks as link}
            <li><a href={link.href}>{link.label}</a></li>
          {/each}
          {#if isDocs}
            <li class="menu-title mt-2">Dokumentation</li>
            {#each docsLinks as link}
              <li><a href={link.href}>{link.label}</a></li>
            {/each}
          {/if}
        </ul>
      </div>
    </div>
  </nav>

  {#if isDocs}
    <div class="flex flex-1">
      <aside class="hidden lg:flex flex-col w-56 shrink-0 border-r border-base-300 bg-base-200 py-6 px-4 gap-1">
        <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 px-2">Dokumentation</p>
        {#each docsLinks as link}
          <a
            href={link.href}
            class="btn btn-ghost btn-sm justify-start font-normal"
            class:btn-active={page.url.pathname === link.href}
          >
            {link.label}
          </a>
        {/each}
      </aside>
      <main class="flex-1 min-w-0 py-10 px-6 md:px-12 max-w-3xl">
        {@render children()}
      </main>
    </div>
  {:else}
    <main class="flex-1">
      {@render children()}
    </main>
  {/if}

  <footer class="footer footer-center bg-base-200 border-t border-base-300 py-6 px-4 text-base-content/60 text-sm">
    <div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
      <a href="/" class="hover:text-base-content transition-colors">Start</a>
      <a href="/download" class="hover:text-base-content transition-colors">Download</a>
      <a href="/docs/getting-started" class="hover:text-base-content transition-colors">Dokumentation</a>
      <a href="/docs/privacy" class="hover:text-base-content transition-colors">Datenschutz</a>
    </div>
    <p class="mt-3">&copy; {new Date().getFullYear()} Elias Klassen - Tequalizer</p>
  </footer>
</div>
