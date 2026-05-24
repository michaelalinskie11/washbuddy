const fs = require('fs');

const cssAppend = `
/* HORAI RESTAURANT STYLE FIXED BG */
.fixed-video-bg { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: -2; overflow: hidden; }
.fixed-video-bg .hero-video { width: 100%; height: 100%; object-fit: cover; transform: scale(1.05); transition: transform 0.3s ease-out; }
.fixed-video-bg .video-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15,23,42,0.6); transition: background 0.3s ease-out; }
.section.clear-bg { background-color: #F8FAFC !important; border-top: 1px solid #E2E8F0; }
`;

const jsAppend = `
// Horai scroll animation
window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY;
  const bgVideo = document.querySelector('#horai-bg .hero-video');
  const bgOverlay = document.querySelector('#horai-overlay');
  if(bgVideo) {
    bgVideo.style.transform = \`scale(\${1.05 + (scrollPos * 0.0005)})\`;
  }
  if(bgOverlay) {
    bgOverlay.style.background = \`rgba(15,23,42,\${Math.min(0.9, 0.6 + (scrollPos * 0.001))})\`;
  }
});
`;

fs.appendFileSync('style.css', cssAppend, 'utf8');
fs.appendFileSync('main.js', jsAppend, 'utf8');
console.log("Appended successfully");
