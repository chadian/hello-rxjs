var Rx = require("rx");

const THROTTLE_BY = 50;

const movements = Rx.Observable
  .fromEvent(document.querySelector("html"), "mousemove")
  .throttle(THROTTLE_BY)

const presses = Rx.Observable
  .fromEvent(window, "keyup")

// Logging
const logger = Rx.Observer.create(
  function(event) {
    const dataContainer = document.getElementById("logger");

    const data = document.createElement("div");
    data.className = "log-item";
    data.innerHTML = JSON.stringify(extractEventData(event));

    console.log(String.fromCharCode(extractEventData(event)));

    if (dataContainer.children.length) {
      dataContainer
        .insertBefore(data, dataContainer.children[0]);      
    } else {
      dataContainer.appendChild(data);
    }

    console.log(event);
  },
  function(error) {
    console.log("error", error);
  }
);

const coords = [];
const drawer = Rx.Observer.create(
  function(coord) {
    const el = document.createElement("div");
    el.className = "coord";
    el.style.left = `${coord.x}px`;
    el.style.top = `${coord.y}px`;

    document.body.appendChild(el);
    console.log(coord);
  },
  function(error) {},
  function() {
    coords.forEach(function(coord) {
      coord.remove();
    });
  }
);

// Drawing
var drawPoints = movements.map(function(movement) {
  const data = extractEventData(movement)
  return {
    x: data.pageX,
    y: data.pageY
  }
})


var keyViewer = Rx.Observer.create(
  function(character) {
    console.log(character);
    if (typeof character == 'string') {
      document.getElementById("key-view").innerHTML = character;
    }
  }
)

presses.map(function(press) {
  console.log(press.keyCode);
  return String.fromCharCode(press.keyCode);
}).subscribe(keyViewer);
  

// Logger subscribe
Rx.Observable.merge(presses, movements).subscribe(logger);

// Drawer subscribe
drawPoints.subscribe(drawer);

// Helper
function extractEventData(event) {
  if (event instanceof KeyboardEvent) {
    return {
      keyCode: event.keyIdentifier ? parseInt(event.keyIdentifier.substr(2), 16) : event.keyCode,
      charCode: event.charCode
    }
  }

  if (event instanceof MouseEvent) {
    return {
      pageX: event.pageX,
      pageY: event.pageY
    }
  }

  return {};
}