const { useEffect, useRef, useState } = React;
const { HuePicker } = reactColor;

function LoFiVisualiser() {
  const canvasRef = useRef(null);
  const [speed, setSpeed] = useState(1);
  const [density, setDensity] = useState(30);
  const [glow, setGlow] = useState(10);
  const [style, setStyle] = useState('bars');
  const [hue, setHue] = useState(280);
  const [isPlaying, setIsPlaying] = useState(false);
  const analyser = useRef(null);
  const player = useRef(null);

  useEffect(() => {
    const fftSize = 256;
    analyser.current = new Tone.Analyser("fft", fftSize);
    player.current = new Tone.Player("vaporwave.mp3").toDestination();
    player.current.connect(analyser.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationId;

    const renderFrame = () => {
      const values = analyser.current.getValue();
      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = `hsl(${hue}, 20%, 10%)`;
      ctx.fillRect(0, 0, width, height);

      ctx.shadowBlur = glow;
      ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;

      const barWidth = width / density;
      for (let i = 0; i < values.length; i++) {
        const val = values[i] / 255;
        const x = i * barWidth;
        const y = height * (1 - val);
        ctx.fillStyle = `hsl(${hue}, 100%, ${30 + val * 50}%)`;

        if (style === 'bars') {
          ctx.fillRect(x, y, barWidth - 2, height - y);
        } else if (style === 'dots') {
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        } else if (style === 'grid') {
          ctx.fillRect(x % width, y % height, 2, 2);
        }
      }

      animationId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => cancelAnimationFrame(animationId);
  }, [style, density, glow, hue]);

  const handlePlay = async () => {
    if (!isPlaying) {
      await Tone.start();
      player.current.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="window">
      <div className="title-bar">
        <span>Lo-Fi Visualiser</span>
        <div className="title-buttons">
          <button>_</button>
          <button>☐</button>
          <button>✕</button>
        </div>
      </div>

      <canvas ref={canvasRef} width={800} height={400}></canvas>

      <div className="controls">
        <div>
          <label>Speed</label>
          <input type="range" min="0.1" max="5" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} />
          <label>Density</label>
          <input type="range" min="5" max="64" step="1" value={density} onChange={e => setDensity(parseInt(e.target.value))} />
          <label>Glow</label>
          <input type="range" min="0" max="50" step="1" value={glow} onChange={e => setGlow(parseInt(e.target.value))} />
        </div>

        <div>
          <label>Style</label>
          <select value={style} onChange={e => setStyle(e.target.value)}>
            <option value="bars">Bars</option>
            <option value="dots">Dots</option>
            <option value="grid">Grid</option>
          </select>

          <label>Hue</label>
          <HuePicker
            color={{ h: hue, s: 100, l: 50 }}
            onChangeComplete={(color) => setHue(color.hsv.h)}
          />

          <button onClick={handlePlay} style={{ marginTop: '10px' }}>
            Play
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<LoFiVisualiser />);
