
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const npm_command: string;
	export const SESSION_MANAGER: string;
	export const COREPACK_ENABLE_AUTO_PIN: string;
	export const __ETC_PROFILE_DONE: string;
	export const COLORTERM: string;
	export const __HM_SESS_VARS_SOURCED: string;
	export const XDG_CONFIG_DIRS: string;
	export const XDG_SESSION_PATH: string;
	export const NIX_LD_LIBRARY_PATH: string;
	export const XDG_MENU_PREFIX: string;
	export const TERM_PROGRAM_VERSION: string;
	export const AI_AGENT: string;
	export const ICEAUTHORITY: string;
	export const CLAUDE_CODE_SESSION_ID: string;
	export const NODE: string;
	export const LC_ADDRESS: string;
	export const VDPAU_DRIVER: string;
	export const LC_NAME: string;
	export const SSH_AUTH_SOCK: string;
	export const XDG_DATA_HOME: string;
	export const CLAUDE_EFFORT: string;
	export const XDG_CONFIG_HOME: string;
	export const XCURSOR_PATH: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const LOCALE_ARCHIVE_2_27: string;
	export const npm_config_local_prefix: string;
	export const WEZTERM_EXECUTABLE: string;
	export const LIBVA_DRIVER_NAME: string;
	export const DESKTOP_SESSION: string;
	export const LC_MONETARY: string;
	export const GDK_PIXBUF_MODULE_FILE: string;
	export const GTK_RC_FILES: string;
	export const EDITOR: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const NIX_PROFILES: string;
	export const XDG_VIDEOS_DIR: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const CUPS_DATADIR: string;
	export const NIX_PATH: string;
	export const SYSTEMD_EXEC_PID: string;
	export const NIXPKGS_CONFIG: string;
	export const _: string;
	export const XAUTHORITY: string;
	export const XDG_PICTURES_DIR: string;
	export const NoDefaultCurrentDirectoryInExePath: string;
	export const CLAUDECODE: string;
	export const XKB_DEFAULT_MODEL: string;
	export const GTK2_RC_FILES: string;
	export const NIXPKGS_QT6_QML_IMPORT_PATH: string;
	export const HOME: string;
	export const XDG_PUBLICSHARE_DIR: string;
	export const SSH_ASKPASS: string;
	export const LC_PAPER: string;
	export const LANG: string;
	export const WEZTERM_UNIX_SOCKET: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const NH_FLAKE: string;
	export const npm_package_version: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const STARSHIP_SHELL: string;
	export const WAYLAND_DISPLAY: string;
	export const STARSHIP_CONFIG: string;
	export const GIO_EXTRA_MODULES: string;
	export const XDG_DOWNLOAD_DIR: string;
	export const XDG_SEAT_PATH: string;
	export const XDG_MUSIC_DIR: string;
	export const XDG_TEMPLATES_DIR: string;
	export const INVOCATION_ID: string;
	export const MANAGERPID: string;
	export const STARSHIP_SESSION_KEY: string;
	export const MOZ_DISABLE_RDD_SANDBOX: string;
	export const KDE_SESSION_UID: string;
	export const XDG_CACHE_HOME: string;
	export const NIX_USER_PROFILE_DIR: string;
	export const INFOPATH: string;
	export const npm_lifecycle_script: string;
	export const USE_BUILTIN_RIPGREP: string;
	export const XKB_DEFAULT_LAYOUT: string;
	export const XDG_ACTIVATION_TOKEN: string;
	export const XDG_SESSION_CLASS: string;
	export const XDG_DESKTOP_DIR: string;
	export const TERM: string;
	export const LC_IDENTIFICATION: string;
	export const npm_package_name: string;
	export const DISABLE_INSTALLATION_CHECKS: string;
	export const GTK_PATH: string;
	export const USER: string;
	export const TZDIR: string;
	export const NIX_LD: string;
	export const QT_WAYLAND_RECONNECT: string;
	export const KDE_SESSION_VERSION: string;
	export const PAM_KWALLET5_LOGIN: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const GIT_EDITOR: string;
	export const PAGER: string;
	export const LC_TELEPHONE: string;
	export const QTWEBKIT_PLUGIN_PATH: string;
	export const LC_MEASUREMENT: string;
	export const __NIXOS_SET_ENVIRONMENT_DONE: string;
	export const XDG_VTNR: string;
	export const XDG_SESSION_ID: string;
	export const LOCALE_ARCHIVE: string;
	export const MANAGERPIDFDID: string;
	export const LESSKEYIN_SYSTEM: string;
	export const npm_config_user_agent: string;
	export const QML2_IMPORT_PATH: string;
	export const TERMINFO_DIRS: string;
	export const XDG_STATE_HOME: string;
	export const npm_execpath: string;
	export const LD_LIBRARY_PATH: string;
	export const DISABLE_AUTOUPDATER: string;
	export const XDG_RUNTIME_DIR: string;
	export const CLAUDE_CODE_ENTRYPOINT: string;
	export const NIX_XDG_DESKTOP_PORTAL_DIR: string;
	export const npm_package_json: string;
	export const LC_TIME: string;
	export const XDG_DOCUMENTS_DIR: string;
	export const JOURNAL_STREAM: string;
	export const XDG_DATA_DIRS: string;
	export const KDE_FULL_SESSION: string;
	export const LIBEXEC_PATH: string;
	export const CLAUDE_CODE_EXECPATH: string;
	export const PATH: string;
	export const __fish_nixos_env_preinit_sourced: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const KDE_APPLICATIONS_AS_SCOPE: string;
	export const KPACKAGE_DEP_RESOLVERS_PATH: string;
	export const QT_PLUGIN_PATH: string;
	export const XKB_DEFAULT_OPTIONS: string;
	export const npm_node_execpath: string;
	export const LC_NUMERIC: string;
	export const WEZTERM_PANE: string;
	export const FORCE_AUTOUPDATE_PLUGINS: string;
	export const TERM_PROGRAM: string;
	export const WEZTERM_EXECUTABLE_DIR: string;
	export const NODE_ENV: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		npm_command: string;
		SESSION_MANAGER: string;
		COREPACK_ENABLE_AUTO_PIN: string;
		__ETC_PROFILE_DONE: string;
		COLORTERM: string;
		__HM_SESS_VARS_SOURCED: string;
		XDG_CONFIG_DIRS: string;
		XDG_SESSION_PATH: string;
		NIX_LD_LIBRARY_PATH: string;
		XDG_MENU_PREFIX: string;
		TERM_PROGRAM_VERSION: string;
		AI_AGENT: string;
		ICEAUTHORITY: string;
		CLAUDE_CODE_SESSION_ID: string;
		NODE: string;
		LC_ADDRESS: string;
		VDPAU_DRIVER: string;
		LC_NAME: string;
		SSH_AUTH_SOCK: string;
		XDG_DATA_HOME: string;
		CLAUDE_EFFORT: string;
		XDG_CONFIG_HOME: string;
		XCURSOR_PATH: string;
		MEMORY_PRESSURE_WRITE: string;
		LOCALE_ARCHIVE_2_27: string;
		npm_config_local_prefix: string;
		WEZTERM_EXECUTABLE: string;
		LIBVA_DRIVER_NAME: string;
		DESKTOP_SESSION: string;
		LC_MONETARY: string;
		GDK_PIXBUF_MODULE_FILE: string;
		GTK_RC_FILES: string;
		EDITOR: string;
		XDG_SEAT: string;
		PWD: string;
		NIX_PROFILES: string;
		XDG_VIDEOS_DIR: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		CUPS_DATADIR: string;
		NIX_PATH: string;
		SYSTEMD_EXEC_PID: string;
		NIXPKGS_CONFIG: string;
		_: string;
		XAUTHORITY: string;
		XDG_PICTURES_DIR: string;
		NoDefaultCurrentDirectoryInExePath: string;
		CLAUDECODE: string;
		XKB_DEFAULT_MODEL: string;
		GTK2_RC_FILES: string;
		NIXPKGS_QT6_QML_IMPORT_PATH: string;
		HOME: string;
		XDG_PUBLICSHARE_DIR: string;
		SSH_ASKPASS: string;
		LC_PAPER: string;
		LANG: string;
		WEZTERM_UNIX_SOCKET: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		XDG_CURRENT_DESKTOP: string;
		NH_FLAKE: string;
		npm_package_version: string;
		MEMORY_PRESSURE_WATCH: string;
		STARSHIP_SHELL: string;
		WAYLAND_DISPLAY: string;
		STARSHIP_CONFIG: string;
		GIO_EXTRA_MODULES: string;
		XDG_DOWNLOAD_DIR: string;
		XDG_SEAT_PATH: string;
		XDG_MUSIC_DIR: string;
		XDG_TEMPLATES_DIR: string;
		INVOCATION_ID: string;
		MANAGERPID: string;
		STARSHIP_SESSION_KEY: string;
		MOZ_DISABLE_RDD_SANDBOX: string;
		KDE_SESSION_UID: string;
		XDG_CACHE_HOME: string;
		NIX_USER_PROFILE_DIR: string;
		INFOPATH: string;
		npm_lifecycle_script: string;
		USE_BUILTIN_RIPGREP: string;
		XKB_DEFAULT_LAYOUT: string;
		XDG_ACTIVATION_TOKEN: string;
		XDG_SESSION_CLASS: string;
		XDG_DESKTOP_DIR: string;
		TERM: string;
		LC_IDENTIFICATION: string;
		npm_package_name: string;
		DISABLE_INSTALLATION_CHECKS: string;
		GTK_PATH: string;
		USER: string;
		TZDIR: string;
		NIX_LD: string;
		QT_WAYLAND_RECONNECT: string;
		KDE_SESSION_VERSION: string;
		PAM_KWALLET5_LOGIN: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		GIT_EDITOR: string;
		PAGER: string;
		LC_TELEPHONE: string;
		QTWEBKIT_PLUGIN_PATH: string;
		LC_MEASUREMENT: string;
		__NIXOS_SET_ENVIRONMENT_DONE: string;
		XDG_VTNR: string;
		XDG_SESSION_ID: string;
		LOCALE_ARCHIVE: string;
		MANAGERPIDFDID: string;
		LESSKEYIN_SYSTEM: string;
		npm_config_user_agent: string;
		QML2_IMPORT_PATH: string;
		TERMINFO_DIRS: string;
		XDG_STATE_HOME: string;
		npm_execpath: string;
		LD_LIBRARY_PATH: string;
		DISABLE_AUTOUPDATER: string;
		XDG_RUNTIME_DIR: string;
		CLAUDE_CODE_ENTRYPOINT: string;
		NIX_XDG_DESKTOP_PORTAL_DIR: string;
		npm_package_json: string;
		LC_TIME: string;
		XDG_DOCUMENTS_DIR: string;
		JOURNAL_STREAM: string;
		XDG_DATA_DIRS: string;
		KDE_FULL_SESSION: string;
		LIBEXEC_PATH: string;
		CLAUDE_CODE_EXECPATH: string;
		PATH: string;
		__fish_nixos_env_preinit_sourced: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		KDE_APPLICATIONS_AS_SCOPE: string;
		KPACKAGE_DEP_RESOLVERS_PATH: string;
		QT_PLUGIN_PATH: string;
		XKB_DEFAULT_OPTIONS: string;
		npm_node_execpath: string;
		LC_NUMERIC: string;
		WEZTERM_PANE: string;
		FORCE_AUTOUPDATE_PLUGINS: string;
		TERM_PROGRAM: string;
		WEZTERM_EXECUTABLE_DIR: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
