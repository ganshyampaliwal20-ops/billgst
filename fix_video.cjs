const fs = require('fs');
let content = fs.readFileSync('f:/bill/app/page.tsx', 'utf8');

content = content.replace(
    'const [isVideoMuted, setIsVideoMuted] = useState(true);',
    `const [isVideoMuted, setIsVideoMuted] = useState(true);\n    const [isVideoPlaying, setIsVideoPlaying] = useState(false);`
);

content = content.replace(
    /<iframe[\s\S]*?title="BillGST Dashboard Preview"[\s\S]*?><\/iframe>/g,
    `{isVideoPlaying ? (
                            <iframe 
                                width="100%" 
                                height="100%" 
                                src={\`https://www.youtube.com/embed/CMzc3B2kilk?autoplay=1&mute=\${isVideoMuted ? 1 : 0}&loop=1&playlist=CMzc3B2kilk&controls=1&modestbranding=1&rel=0&showinfo=0\`} 
                                title="BillGST Dashboard Preview" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen loading="lazy"
                                style={{ aspectRatio: '16/9', display: 'block', objectFit: 'cover' }}
                            ></iframe>
                        ) : (
                            <div 
                                style={{ 
                                    width: '100%', aspectRatio: '16/9', 
                                    backgroundImage: 'url(https://img.youtube.com/vi/CMzc3B2kilk/maxresdefault.jpg)', 
                                    backgroundSize: 'cover', backgroundPosition: 'center', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' 
                                }}
                                onClick={() => setIsVideoPlaying(true)}
                            >
                                <div style={{ 
                                    width: '60px', height: '60px', background: 'rgba(255, 0, 0, 0.9)', 
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    boxShadow: '0 4px 15px rgba(255,0,0,0.4)', transition: 'transform 0.2s' 
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <svg viewBox="0 0 24 24" fill="white" width="28" height="28" style={{ marginLeft: '4px' }}>
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        )}`
);

fs.writeFileSync('f:/bill/app/page.tsx', content);
