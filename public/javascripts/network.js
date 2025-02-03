const canvas = document.getElementById('network-canvas');
var options = {
    particleColor: '#000',
    background: '#fff',
    interactive: true,
    speed: 'medium',
    density: 'high'
};
const particleNetwork = new ParticleNetwork(canvas, options);