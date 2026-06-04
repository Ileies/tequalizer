
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/docs" | "/docs/faq" | "/docs/getting-started" | "/docs/privacy" | "/docs/style-dimensions" | "/download";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/docs": Record<string, never>;
			"/docs/faq": Record<string, never>;
			"/docs/getting-started": Record<string, never>;
			"/docs/privacy": Record<string, never>;
			"/docs/style-dimensions": Record<string, never>;
			"/download": Record<string, never>
		};
		Pathname(): "/" | "/docs/faq" | "/docs/getting-started" | "/docs/privacy" | "/docs/style-dimensions" | "/download";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | string & {};
	}
}