var canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

var fishFlocking = new FishFlocking();
fishFlocking.setup(canvas,
    document.getElementById("poisson"),
    document.getElementById("poisson_super")
);
fishFlocking.go();

HTMLCollection.prototype.forEach = Array.prototype.forEach;
document.getElementsByClassName("fish-option").forEach(function(element) {
    element.oninput = function() {
        fishFlocking.eval(element.id + " = " + this.value);
        if (element.id === 'POPULATION') {
            fishFlocking.eval('setupPopulation()');
        }
    };
});
