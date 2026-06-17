const fs = require('fs');
let content = fs.readFileSync('f:/bill/app/dashboard/page.tsx', 'utf8');

content = content.replace(
    'const [invVideoIndex, setInvVideoIndex] = useState(0);',
    'const [invVideoIndex, setInvVideoIndex] = useState(0);\n    const [playingVideo, setPlayingVideo] = useState<string | null>(null);'
);

const getThumbnail = (id) => `(
                                            <div 
                                                style={{ 
                                                    width: '100%', height: '100%', 
                                                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'absolute', top: 0, left: 0, zIndex: 5
                                                }}
                                                onClick={() => setPlayingVideo('${id}')}
                                            >
                                                <div style={{ 
                                                    width: '50px', height: '50px', background: 'rgba(255, 255, 255, 0.95)', 
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" fill="#dc2743" width="24" height="24" style={{ marginLeft: '4px' }}>
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '10px', color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Play Video</div>
                                            </div>
                                        )`;

content = content.replace(
    /<iframe[\s\S]*?key=\{invVideoIndex\}[\s\S]*?><\/iframe>/,
    `{playingVideo === inventoryVideos[invVideoIndex] ? (
                                        $&
                                        ) : (
                                            <div 
                                                style={{ 
                                                    width: '100%', height: '100%', 
                                                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'absolute', top: 0, left: 0, zIndex: 5
                                                }}
                                                onClick={() => setPlayingVideo(inventoryVideos[invVideoIndex])}
                                            >
                                                <div style={{ 
                                                    width: '50px', height: '50px', background: 'rgba(255, 255, 255, 0.95)', 
                                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" fill="#dc2743" width="24" height="24" style={{ marginLeft: '4px' }}>
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                                <div style={{ position: 'absolute', bottom: '10px', color: 'white', fontWeight: 'bold', fontSize: '12px', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>Play Video</div>
                                            </div>
                                        )}`
);

content = content.replace(
    /<iframe[\s\S]*?src="https:\/\/www\.instagram\.com\/reel\/DZHTY54IR_l\/embed"[\s\S]*?><\/iframe>/,
    `{playingVideo === 'DZHTY54IR_l' ? (
                                        $&
                                        ) : ${getThumbnail('DZHTY54IR_l')}}`
);

content = content.replace(
    /<iframe[\s\S]*?src="https:\/\/www\.instagram\.com\/reel\/DZARRuCI0rT\/embed"[\s\S]*?><\/iframe>/,
    `{playingVideo === 'DZARRuCI0rT' ? (
                                        $&
                                        ) : ${getThumbnail('DZARRuCI0rT')}}`
);

fs.writeFileSync('f:/bill/app/dashboard/page.tsx', content);
