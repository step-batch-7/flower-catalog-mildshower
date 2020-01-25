const getWaterSprinkler = () => document.getElementById('waterSprinkler');

const main = function() {
  const waterSprinkler = getWaterSprinkler();
  waterSprinkler.onclick = function() {
    waterSprinkler.style.visibility = 'hidden';
    setTimeout(function() {
      waterSprinkler.style.visibility = 'visible';
    }, 1000);
  };
};

window.onload = main;
