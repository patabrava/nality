const postcss = require('postcss');
const fs = require('fs');

try {
  const css = fs.readFileSync('./src/styles/timeline.css', 'utf8');
  const result = postcss().process(css, { from: './src/styles/timeline.css' });
  console.log('CSS is valid');
} catch (error) {
  console.error('CSS Error:', error.message);
  console.error('Line:', error.line);
  console.error('Column:', error.column);
}
