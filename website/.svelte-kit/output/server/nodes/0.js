import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.CUgWQhqP.js","_app/immutable/chunks/DRDxJc_p.js","_app/immutable/chunks/Cv6_QaEz.js","_app/immutable/chunks/DEVAJQRs.js","_app/immutable/chunks/DEdQsfrf.js","_app/immutable/chunks/DeQ-pRbm.js","_app/immutable/chunks/BJTy3oeD.js","_app/immutable/chunks/BlDj-qXf.js","_app/immutable/chunks/B_c6p1Fr.js","_app/immutable/chunks/DQi8feYn.js"];
export const stylesheets = ["_app/immutable/assets/0.CPk2QJ4M.css"];
export const fonts = [];
