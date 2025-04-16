// Improvement Simulator React Component
const ImprovementSimulator = () => {
    const [activeSimulation, setActiveSimulation] = React.useState(null);
    const [continuousPath, setContinuousPath] = React.useState([]);
    const [continualPath, setContinualPath] = React.useState([]);
    const [continuousAdjustments, setContinuousAdjustments] = React.useState([]);
    const [continualAdjustments, setContinualAdjustments] = React.useState([]);
    const [environmentChanges, setEnvironmentChanges] = React.useState([]);
    const [time, setTime] = React.useState(0);
    const [explanation, setExplanation] = React.useState('Select a simulation to begin');
    const [metrics, setMetrics] = React.useState({
        continuous: { adjustments: 0, avgDeviation: 0, maxDeviation: 0 },
        continual: { adjustments: 0, avgDeviation: 0, maxDeviation: 0 }
    });
    
    const canvasRef = React.useRef(null);
    
    const canvasWidth = 800;
    const canvasHeight = 400;
    const carWidth = 30;
    const carHeight = 20;
    const roadLength = canvasWidth - 100;
    const simulationDuration = 150; // time units
    const idealPosition = canvasHeight / 2;
    
    // Reset and start a simulation
    const startSimulation = (type) => {
        // Reset all path and tracking data
        setContinuousPath([]);
        setContinualPath([]);
        setContinuousAdjustments([]);
        setContinualAdjustments([]);
        setEnvironmentChanges([]);
        setTime(0);
        setActiveSimulation(type);
        setMetrics({
            continuous: { adjustments: 0, avgDeviation: 0, maxDeviation: 0 },
            continual: { adjustments: 0, avgDeviation: 0, maxDeviation: 0 }
        });
        
        // Set appropriate explanation
        if (type === 'continuous') {
            setExplanation('Continuous improvement: Adjusting every 2 seconds — even on a straight road. The red car makes constant small corrections regardless of need.');
        } else if (type === 'continual') {
            setExplanation('Continual improvement: Checking direction at regular intervals and adjusting only when necessary — based on clear feedback. The blue car only makes significant adjustments when truly needed.');
        } else if (type === 'both') {
            setExplanation('Comparing both approaches: Both cars face identical road conditions. Continuous (red) makes frequent small adjustments, while Continual (blue) makes periodic targeted adjustments only when needed.');
        }
    };
    
    // Generate environment waveform - the road challenges that both approaches must navigate
    const generateEnvironmentEffect = (timePoint) => {
        // Combine multiple sine waves of different frequencies and amplitudes
        // plus some occasional larger disturbances
        return Math.sin(timePoint / 8) * 10 + 
              Math.sin(timePoint / 3) * 4 + 
              Math.sin(timePoint / 20) * 15 + 
              (timePoint % 17 === 0 ? (Math.random() > 0.5 ? 15 : -15) : 0); // Occasional bumps
    };
    
    // Calculate metrics after simulation
    React.useEffect(() => {
        if (time >= simulationDuration && activeSimulation) {
            // Calculate metrics for continuous path
            const continuousDeviations = continuousPath.map(p => Math.abs(p.y - idealPosition));
            const continuousAvgDeviation = continuousDeviations.length > 0 ? 
                continuousDeviations.reduce((sum, val) => sum + val, 0) / continuousDeviations.length : 0;
            const continuousMaxDeviation = continuousDeviations.length > 0 ? 
                Math.max(...continuousDeviations) : 0;
            
            // Calculate metrics for continual path
            const continualDeviations = continualPath.map(p => Math.abs(p.y - idealPosition));
            const continualAvgDeviation = continualDeviations.length > 0 ?
                continualDeviations.reduce((sum, val) => sum + val, 0) / continualDeviations.length : 0;
            const continualMaxDeviation = continualDeviations.length > 0 ?
                Math.max(...continualDeviations) : 0;
            
            // Update metrics
            setMetrics({
                continuous: {
                    adjustments: continuousAdjustments.length,
                    avgDeviation: continuousAvgDeviation.toFixed(1),
                    maxDeviation: continuousMaxDeviation.toFixed(1)
                },
                continual: {
                    adjustments: continualAdjustments.length,
                    avgDeviation: continualAvgDeviation.toFixed(1),
                    maxDeviation: continualMaxDeviation.toFixed(1)
                }
            });
        }
    }, [time, activeSimulation, continuousPath, continualPath, continuousAdjustments, continualAdjustments]);
    
    // Update simulation with each tick
    React.useEffect(() => {
        if (!activeSimulation || time >= simulationDuration) return;
        
        const timer = setTimeout(() => {
            setTime(prevTime => prevTime + 1);
            
            // Base position is moving forward along x-axis
            const baseX = (time / simulationDuration) * roadLength + 50;
            
            // Generate environment effect - identical for both improvement approaches
            const environmentEffect = generateEnvironmentEffect(time);
            
            // Track significant environmental changes for visualization (the bumps)
            if (time % 17 === 0) {
                setEnvironmentChanges(prev => [...prev, { 
                    x: baseX, 
                    y: idealPosition,
                    magnitude: environmentEffect
                }]);
            }
            
            // Process continuous improvement approach
            if (activeSimulation === 'continuous' || activeSimulation === 'both') {
                // Get previous position or start at ideal
                const prevPos = continuousPath.length > 0 
                    ? continuousPath[continuousPath.length - 1].y 
                    : idealPosition;
                
                // Apply environmental factors to get raw position
                const rawPosition = prevPos + (environmentEffect - prevPos + idealPosition) * 0.1; // Gradual effect of environment
                
                // Continuous improvement: adjust every 2 time units regardless of need
                const makeAdjustment = time % 2 === 0;
                let newY = rawPosition;
                
                if (makeAdjustment) {
                    // Adjust 30% toward ideal
                    const deviation = rawPosition - idealPosition;
                    const correction = deviation * 0.3;
                    newY = rawPosition - correction;
                    
                    // Track adjustments
                    setContinuousAdjustments(prev => [...prev, { 
                        x: baseX, 
                        y: newY, 
                        amount: correction 
                    }]);
                }
                
                // Add to path
                setContinuousPath(prev => [...prev, { x: baseX, y: newY }]);
            }
            
            // Process continual improvement approach
            if (activeSimulation === 'continual' || activeSimulation === 'both') {
                // Get previous position or start at ideal
                const prevPos = continualPath.length > 0 
                    ? continualPath[continualPath.length - 1].y 
                    : idealPosition;
                
                // Apply environmental factors to get raw position - IDENTICAL to continuous
                const rawPosition = prevPos + (environmentEffect - prevPos + idealPosition) * 0.1; // Gradual effect of environment
                
                // Continual improvement: check every 10 time units, adjust only if deviation exceeds threshold
                const checkPoint = time % 10 === 0;
                let newY = rawPosition;
                
                if (checkPoint) {
                    const deviation = rawPosition - idealPosition;
                    const threshold = 10; // Threshold for meaningful deviation
                    
                    if (Math.abs(deviation) > threshold) {
                        // Adjust 70% toward ideal if outside acceptable range
                        const correction = deviation * 0.7;
                        newY = rawPosition - correction;
                        
                        // Track adjustments
                        setContinualAdjustments(prev => [...prev, { 
                            x: baseX, 
                            y: newY, 
                            amount: correction 
                        }]);
                    }
                }
                
                // Add to path
                setContinualPath(prev => [...prev, { x: baseX, y: newY }]);
            }
        }, 50); // Faster simulation
        
        return () => clearTimeout(timer);
    }, [activeSimulation, time, continuousPath, continualPath]);
    
    // Render the canvas
    React.useEffect(() => {
        if (!canvasRef.current) return;
        
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw road
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, idealPosition - 40, canvasWidth, 80);
        
        // Draw center line
        ctx.strokeStyle = '#999';
        ctx.setLineDash([15, 15]);
        ctx.beginPath();
        ctx.moveTo(0, idealPosition);
        ctx.lineTo(canvasWidth, idealPosition);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw ideal path
        ctx.strokeStyle = '#555';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(50, idealPosition);
        ctx.lineTo(50 + roadLength, idealPosition);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw environment change markers
        environmentChanges.forEach(change => {
            ctx.fillStyle = change.magnitude > 0 ? 'rgba(255, 100, 100, 0.2)' : 'rgba(100, 100, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(change.x, idealPosition, 15, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.fillText('Challenge', change.x - 25, idealPosition + 30);
        });
        
        // Draw waveform path to show the environmental challenges
        if (activeSimulation) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let t = 0; t <= time; t++) {
                const x = (t / simulationDuration) * roadLength + 50;
                const envEffect = generateEnvironmentEffect(t);
                const y = idealPosition + envEffect * 0.3; // Scale down for visualization
                
                if (t === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        // Draw continuous path
        if (continuousPath.length > 1) {
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(continuousPath[0].x, continuousPath[0].y);
            continuousPath.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            
            // Draw car
            if (continuousPath.length > 0) {
                const lastPoint = continuousPath[continuousPath.length - 1];
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(lastPoint.x - carWidth/2, lastPoint.y - carHeight/2, carWidth, carHeight);
            }
            
            // Draw adjustment points
            continuousAdjustments.forEach(adj => {
                ctx.strokeStyle = '#e74c3c';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(adj.x, adj.y + adj.amount);
                ctx.lineTo(adj.x, adj.y);
                ctx.stroke();
                
                // Small indicator dot for adjustment
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(adj.x, adj.y, 2, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        // Draw continual path
        if (continualPath.length > 1) {
            ctx.strokeStyle = '#3498db';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(continualPath[0].x, continualPath[0].y);
            continualPath.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            
            // Draw car
            if (continualPath.length > 0) {
                const lastPoint = continualPath[continualPath.length - 1];
                ctx.fillStyle = '#3498db';
                ctx.fillRect(lastPoint.x - carWidth/2, lastPoint.y - carHeight/2, carWidth, carHeight);
            }
            
            // Draw adjustment points
            continualAdjustments.forEach(adj => {
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(adj.x, adj.y + adj.amount);
                ctx.lineTo(adj.x, adj.y);
                ctx.stroke();
                
                // Larger indicator for significant adjustment
                ctx.fillStyle = '#3498db';
                ctx.beginPath();
                ctx.arc(adj.x, adj.y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
    }, [time, activeSimulation, continuousPath, continualPath, continuousAdjustments, continualAdjustments, environmentChanges]);
    
    // Render metrics and stats
    const renderMetrics = () => {
        return (
            <div className="metrics">
                <div style={{fontSize: '18px', fontWeight: 'bold', marginBottom: '8px'}}>Simulation Results:</div>
                <div className="grid-columns-2">
                    <div>
                        <div style={{fontWeight: 'bold', color: '#e74c3c'}}>Continuous Improvement:</div>
                        <div>Total adjustments made: {metrics.continuous.adjustments}</div>
                        <div>Average deviation from ideal: {metrics.continuous.avgDeviation} units</div>
                        <div>Maximum deviation: {metrics.continuous.maxDeviation} units</div>
                    </div>
                    <div>
                        <div style={{fontWeight: 'bold', color: '#3498db'}}>Continual Improvement:</div>
                        <div>Total adjustments made: {metrics.continual.adjustments}</div>
                        <div>Average deviation from ideal: {metrics.continual.avgDeviation} units</div>
                        <div>Maximum deviation: {metrics.continual.maxDeviation} units</div>
                    </div>
                </div>
                
                <div className="efficiency-box">
                    <div style={{fontWeight: 'bold'}}>Efficiency Comparison:</div>
                    <p>Continuous approach made {metrics.continuous.adjustments} adjustments to maintain an average deviation of {metrics.continuous.avgDeviation} units.</p>
                    <p>Continual approach made {metrics.continual.adjustments} adjustments to maintain an average deviation of {metrics.continual.avgDeviation} units.</p>
                    <p style={{marginTop: '8px', fontWeight: 'bold'}}>
                        Conclusion: Continual improvement achieved {(metrics.continuous.adjustments / Math.max(1, metrics.continual.adjustments)).toFixed(1)}x 
                        fewer adjustments while maintaining similar path accuracy.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="explanation">
                <p style={{fontWeight: 'bold'}}>{explanation}</p>
                {time >= simulationDuration && (
                    <p style={{marginTop: '8px', color: '#555'}}>
                        <strong>Key insight:</strong> Both cars faced identical challenges and reached their destination, but continuous improvement required many more adjustments 
                        while achieving similar results to continual improvement's targeted approach.
                    </p>
                )}
            </div>
            
            <div style={{display: 'flex', gap: '16px', marginBottom: '16px'}}>
                <button 
                    onClick={() => startSimulation('continuous')} 
                    className="button-continuous"
                    disabled={activeSimulation && time < simulationDuration}
                >
                    Simulate Continuous
                </button>
                <button 
                    onClick={() => startSimulation('continual')} 
                    className="button-continual"
                    disabled={activeSimulation && time < simulationDuration}
                >
                    Simulate Continual
                </button>
                <button 
                    onClick={() => startSimulation('both')} 
                    className="button-both"
                    disabled={activeSimulation && time < simulationDuration}
                >
                    Compare Both
                </button>
            </div>
            
            <div className="canvas-container">
                <canvas 
                    ref={canvasRef} 
                    width={canvasWidth} 
                    height={canvasHeight} 
                    style={{width: '100%'}}
                />
                <div className="legend">
                    <div>
                        <span className="legend-item" style={{backgroundColor: '#ccc'}}></span>
                        Light gray wave: Environmental challenges (identical for both approaches)
                    </div>
                    <div>
                        <span className="legend-item" style={{backgroundColor: '#666'}}></span>
                        Circle markers: Major challenges
                    </div>
                </div>
            </div>
            
            {time >= simulationDuration && activeSimulation && renderMetrics()}
            
            <div className="key-differences">
                <h2 style={{fontSize: '20px', fontWeight: 'bold', marginBottom: '8px'}}>Key Differences:</h2>
                <div className="grid-columns-2">
                    <div className="box-continuous">
                        <h3 style={{fontWeight: 'bold', color: '#c62828'}}>Continuous Improvement</h3>
                        <p style={{marginBottom: '8px'}}>Like adjusting your steering wheel every 2 seconds, even on a straight road.</p>
                        <ul style={{paddingLeft: '20px'}}>
                            <li>Constant, frequent adjustments regardless of need</li>
                            <li>Resources spent on minor, often unnecessary corrections</li>
                            <li>Can create adjustment fatigue and wasted effort</li>
                            <li>May overcompensate for normal variance</li>
                        </ul>
                    </div>
                    <div className="box-continual">
                        <h3 style={{fontWeight: 'bold', color: '#1565c0'}}>Continual Improvement</h3>
                        <p style={{marginBottom: '8px'}}>Checking your direction at regular points and adjusting only when necessary, based on clear feedback.</p>
                        <ul style={{paddingLeft: '20px'}}>
                            <li>Periodic assessment at meaningful intervals</li>
                            <li>Data-driven adjustments only when truly needed</li>
                            <li>Resources focused on significant deviations</li>
                            <li>Tolerates normal variance, responds to real issues</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Render the React component to the DOM
ReactDOM.render(<ImprovementSimulator />, document.getElementById('simulator-root'));