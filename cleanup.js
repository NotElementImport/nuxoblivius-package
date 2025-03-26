import * as fs from "fs";
try { fs.rmdirSync('dist', { recursive: true, force: true }); } catch (e) { console.log('dist empty'); }