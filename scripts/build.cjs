const fs=require('node:fs');
fs.mkdirSync('dist',{recursive:true});
for(const name of ['index.html','style.css','app.js','models.js','manuscript.js','source-manifest.json','.nojekyll'])fs.copyFileSync(name,`dist/${name}`);
fs.cpSync('assets','dist/assets',{recursive:true});
console.log('Static preview prepared in dist/. GitHub Pages may serve main / root directly.');
