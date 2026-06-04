export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.DSy0f1j6.js",app:"_app/immutable/entry/app.C4gy8PNY.js",imports:["_app/immutable/entry/start.DSy0f1j6.js","_app/immutable/chunks/B_c6p1Fr.js","_app/immutable/chunks/Cv6_QaEz.js","_app/immutable/chunks/DQi8feYn.js","_app/immutable/entry/app.C4gy8PNY.js","_app/immutable/chunks/Cv6_QaEz.js","_app/immutable/chunks/DEVAJQRs.js","_app/immutable/chunks/DRDxJc_p.js","_app/immutable/chunks/DQi8feYn.js","_app/immutable/chunks/DEdQsfrf.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/docs/faq",
				pattern: /^\/docs\/faq\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/docs/getting-started",
				pattern: /^\/docs\/getting-started\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/docs/privacy",
				pattern: /^\/docs\/privacy\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/docs/style-dimensions",
				pattern: /^\/docs\/style-dimensions\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/download",
				pattern: /^\/download\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
