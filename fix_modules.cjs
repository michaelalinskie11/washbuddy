const fs = require('fs');

const files = ['index.html', 'app/index.html', 'admin/index.html'];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace('<script src="./main.js"></script>', '<script type="module" src="./main.js"></script>');
    c = c.replace('<script src="app.js"></script>', '<script type="module" src="app.js"></script>');
    c = c.replace('<script src="admin.js"></script>', '<script type="module" src="admin.js"></script>');
    fs.writeFileSync(f, c, 'utf8');
  }
});
console.log('Fixed modules');
