// Customizable Improvement Simulator React Component
const CustomizableImprovementSimulator = () => {
    const [activeSimulation, setActiveSimulation] = React.useState(null);
    const [continuousPath, setContinuousPath] = React.useState([]);
    const [continualPath, setContinualPath] = React.useState([]);
    const [continuousAdjustments, setContinuousAdjustments] = React.useState([]);
    const [continualAdjustments, setContinualAdjustments] = React.useState([]);
    const [environmentChanges, setEnvironmentChanges] = React.useState([]);
    const [time, setTime] = React.useState(0);
    const [explanation, setExplanation] = React.useState('Customize parameters and select a simulation to begin');
    const [metrics, setMetrics] = React.useState({
        continuous: { adjustments: 0, avgDeviation: 0, maxDeviation: 0 },
        continual: { adjustments: 0, avgDeviation: 0, maxDeviation: 0 }
    });
    
    // Customizable parameters
    const [continuousFrequency, setContinuousFrequency] = React.useState(2);
    const [continuousAdjustmentStrength, setContinuousAdjustmentStrength] = React.useState(30);
    const [continualCheckFrequency, setContinualCheckFrequency] = React.useState(10);
    const [continualThreshold, setContinualThreshold] = React.useState(10);
    const [continualAdjustmentStrength, setContinualAdjustmentStrength] = React.useState(70);
    const [environmentVariability, setEnvironmentVariability] = React.useState(50);
    const [simulationSpeed, setSimulationSpeed] = React.useState(50);
    
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
            setExplanation(`Continuous improvement: Adjusting every ${continuousFrequency} seconds with ${continuousAdjustmentStrength}% correction strength.`);
        } else if (type === 'continual') {
            setExplanation(`Continual improvement: Checking every ${continualCheckFrequency} seconds, adjusting (${continualAdjustmentStrength}% strength) only when deviation exceeds ${continualThreshold} units.`);
        } else if (type === 'both') {
            setExplanation('Comparing both approaches with your custom parameters. Both face identical environmental challenges.');
        }
    };
    
    // Generate environment waveform based on variability setting
    const generateEnvironmentEffect = (timePoint) => {
        const variabilityFactor = environmentVariability / 50; // Scale to make 50 the default
        
        // Combine multiple sine waves of different frequencies and amplitudes
        return Math.sin(timePoint / 8) * 10 * variabilityFactor + 
               Math.sin(timePoint / 3) * 4 * variabilityFactor + 
               Math.sin(timePoint / 20) * 15 * variabilityFactor + 
               (timePoint % 17 === 0 ? (Math.random() > 0.5 ? 15 : -15) * variabilityFactor : 0); // Occasional bumps
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
            
            // Generate environment effect based on variability setting
            const environmentEffect = generateEnvironmentEffect(time);
            
            // Track significant environmental changes for visualization
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
                
                // Continuous improvement: adjust based on custom frequency
                const makeAdjustment = time % continuousFrequency === 0;
                let newY = rawPosition;
                
                if (makeAdjustment) {
                    // Adjust based on custom strength
                    const deviation = rawPosition - idealPosition;
                    const correction = deviation * (continuousAdjustmentStrength / 100);
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
                
                // Continual improvement: check based on custom frequency, adjust based on custom threshold
                const checkPoint = time % continualCheckFrequency === 0;
                let newY = rawPosition;
                
                if (checkPoint) {
                    const deviation = rawPosition - idealPosition;
                    
                    if (Math.abs(deviation) > continualThreshold) {
                        // Adjust based on custom strength if outside acceptable range
                        const correction = deviation * (continualAdjustmentStrength / 100);
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
        }, 100 - simulationSpeed); // Adjust speed based on slider
        
        return () => clearTimeout(timer);
    }, [
        activeSimulation, 
        time, 
        continuousPath, 
        continualPath, 
        continuousFrequency, 
        continuousAdjustmentStrength, 
        continualCheckFrequency, 
        continualThreshold, 
        continualAdjustmentStrength, 
        environmentVariability, 
        simulationSpeed
    ]);
    
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
        
    }, [
        time, 
        activeSimulation, 
        continuousPath, 
        continualPath, 
        continuousAdjustments, 
        continualAdjustments, 
        environmentChanges, 
        environmentVariability
    ]);
    
    // Parameter control component
    const ParameterSlider = ({ label, value, setValue, min, max, step, description }) => (
        <div className="parameter-row">
            <div className="parameter-label">
                <label>{label}</label>
                <span>{value}</span>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                step={step} 
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="parameter-slider"
                disabled={activeSimulation && time < simulationDuration}
            />
            {description && <div className="slider-description">{description}</div>}
        </div>
    );
    
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
                        <strong>Key insight:</strong> Both cars faced identical challenges and reached their destination, but with different adjustment patterns based on your parameter settings.
                    </p>
                )}
            </div>
            
            <div className="parameter-grid">
                <div className="parameter-group">
                    <h3 style={{color: '#c62828'}}>Continuous Improvement Parameters</h3>
                    <ParameterSlider 
                        label="Adjustment Frequency (time units)" 
                        value={continuousFrequency} 
                        setValue={setContinuousFrequency} 
                        min={1} 
                        max={10} 
                        step={1}
                        description="How often adjustments are made (lower = more frequent)"
                    />
                    <ParameterSlider 
                        label="Adjustment Strength (%)" 
                        value={continuousAdjustmentStrength} 
                        setValue={setContinuousAdjustmentStrength} 
                        min={10} 
                        max={90} 
                        step={5}
                        description="How strong each adjustment is (higher = more aggressive correction)"
                    />
                </div>
                
                <div className="parameter-group">
                    <h3 style={{color: '#1565c0'}}>Continual Improvement Parameters</h3>
                    <ParameterSlider 
                        label="Check Frequency (time units)" 
                        value={continualCheckFrequency} 
                        setValue={setContinualCheckFrequency} 
                        min={5} 
                        max={30} 
                        step={5}
                        description="How often the system is evaluated for potential adjustment"
                    />
                    <ParameterSlider 
                        label="Adjustment Threshold (units)" 
                        value={continualThreshold} 
                        setValue={setContinualThreshold} 
                        min={5} 
                        max={30} 
                        step={5}
                        description="How far from ideal before an adjustment is triggered"
                    />
                    <ParameterSlider 
                        label="Adjustment Strength (%)" 
                        value={continualAdjustmentStrength} 
                        setValue={setContinualAdjustmentStrength} 
                        min={30} 
                        max={90} 
                        step={5}
                        description="How strong each adjustment is when triggered"
                    />
                </div>
            </div>
            
            <div className="parameter-grid">
                <div className="parameter-group">
                    <h3 style={{color: '#333'}}>Environment Settings</h3>
                    <ParameterSlider 
                        label="Environment Variability (%)" 
                        value={environmentVariability} 
                        setValue={setEnvironmentVariability} 
                        min={10} 
                        max={100} 
                        step={10}
                        description="How chaotic the environment is (higher = more variability)"
                    />
                    <ParameterSlider 
                        label="Simulation Speed" 
                        value={simulationSpeed} 
                        setValue={setSimulationSpeed} 
                        min={10} 
                        max={90} 
                        step={10}
                        description="How fast the simulation runs"
                    />
                </div>
                
                <div className="parameter-group">
                    <h3>Run Simulation</h3>
                    <div className="control-buttons">
                        <button 
                            onClick={() => startSimulation('continuous')} 
                            className="button-continuous"
                            disabled={activeSimulation && time < simulationDuration}
                            style={{flex: 1}}
                        >
                            Simulate Continuous
                        </button>
                        <button 
                            onClick={() => startSimulation('continual')} 
                            className="button-continual"
                            disabled={activeSimulation && time < simulationDuration}
                            style={{flex: 1}}
                        >
                            Simulate Continual
                        </button>
                    </div>
                    <button 
                        onClick={() => startSimulation('both')} 
                        className="button-both"
                        disabled={activeSimulation && time < simulationDuration}
                        style={{width: '100%'}}
                    >
                        Compare Both Approaches
                    </button>
                </div>
            </div>
            
            <div className="canvas-container" style={{marginTop: '20px'}}>
                <canvas 
                    ref={canvasRef} 
                    width={canvasWidth} 
                    height={canvasHeight} 
                    style={{width: '100%'}}
                />
                <div className="legend">
                    <div>
                        <span className="legend-item" style={{backgroundColor: '#ccc'}}></span>
                        Light gray wave: Environmental challenges
                    </div>
                    <div>
                        <span className="legend-item" style={{backgroundColor: '#666'}}></span>
                        Circle markers: Major challenges
                    </div>
                </div>
            </div>
            
            {time >= simulationDuration && activeSimulation && renderMetrics()}
            
            <div className="experiment-suggestions">
                <h3>Experiment with Different Scenarios:</h3>
                <div className="grid-columns-2">
                    <div className="suggestion-box box-continuous">
                        <h4 style={{color: '#c62828'}}>Continuous Improvement Scenarios</h4>
                        <ul style={{paddingLeft: '20px'}}>
                            <li>Try very frequent adjustments (1-2) with low strength</li>
                            <li>Try less frequent adjustments (5-8) with high strength</li>
                            <li>See which produces better outcomes in different environments</li>
                        </ul>
                    </div>
                    <div className="suggestion-box box-continual">
                        <h4 style={{color: '#1565c0'}}>Continual Improvement Scenarios</h4>
                        <ul style={{paddingLeft: '20px'}}>
                            <li>Try different threshold levels to see impact on deviation</li>
                            <li>Experiment with check frequency vs. environment variability</li>
                            <li>Find the optimal balance for maximum efficiency</li>
                        </ul>
                    </div>
                </div>
                
                <div className="suggestion-box" style={{backgroundColor: '#f0e6f6', marginTop: '15px'}}>
                    <h4 style={{color: '#9b59b6'}}>Business Insights</h4>
                    <ul style={{paddingLeft: '20px'}}>
                        <li>Higher environment variability (more chaotic markets) may require different strategies</li>
                        <li>Find the minimum number of adjustments needed for acceptable outcomes</li>
                        <li>Notice how maximum deviation (risk exposure) relates to adjustment strategies</li>
                        <li>Consider the real-world resource costs of each adjustment in your context</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Render the React component to the DOM
ReactDOM.render(<CustomizableImprovementSimulator />, document.getElementById('simulator-root'));