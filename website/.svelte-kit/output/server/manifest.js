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
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/docs/faq","/docs/getting-started","/docs/privacy","/docs/style-dimensions","/download"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
