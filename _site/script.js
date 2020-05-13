mapboxgl.accessToken =
  "pk.eyJ1IjoiY3JzaGF0ZmllbGQiLCJhIjoiY2s5bGZjYnhhMjVlcDNnbzRwcWlzbmU1ZSJ9.YQsNhcTftoNjzASR-38XaQ";

var clientWidth = document.documentElement.clientWidth;

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/crshatfield/cka1t4ujj14ir1joio9tr8xp3",
  center: [-73.95, 40.71], // NYC: approximately 40 deg N, 74 deg W
  zoom: clientWidth > 700 ? 10 : 9,
});

// listen for screen resize events
window.addEventListener('resize', function () {
  if (document.documentElement.clientWidth < 700) {
    // set the zoom level to 9 for smaller screens
    map.setZoom(9);
  } else {
    // set the zoom level to 10
    map.setZoom(10);
  }
});

var bldgClasses = ["allbuildings", "exempt-all", "exempt-res", "notexempt-res"],
  demographicLayers = ["pctwhite", "education", "householdmedianincome", "totalrentburdened"];

var labels = {
  "pctwhite": ['<22%', '22%-41%', '41%-59%', '59%-75%', '75%<'],
  "education": ['<42%', '42%-54%', '54%-67%', '67%-80%', '91%<'],
  "householdmedianincome": ['<45.8k', '45.8k-70k', '70k-91k', '91k-111k', '111k<'],
  "totalrentburdened": ['<41%', '41%-47%', '47%-53%', '53%-59%', '59%<']
};

var legend = document.querySelector("#legend");
var menu = document.querySelector("#map-menu");
var legendLabels = legend.querySelectorAll(".label");

map.dragPan.disable();

map.on("load", function() {
  // initialize scrollama
  var scroller = scrollama();

  // set up stickyfill
  d3.selectAll(".sticky").each(function () {
    Stickyfill.add(this);
  });

  // force a resize on load to ensure proper dimensions are sent to scrollama
  scroller.resize();

  scroller
    .setup({
      step: ".step",
      offset: 0.5,
    })
    .onStepEnter(response => {
      // response = { element, direction, index }
      currentClassList = response.element.classList;

      bldgClasses.forEach(className => {
        if (currentClassList.contains(className)) {
          console.log(`${currentClassList} contains ${className}`)
          map.setLayoutProperty(className, "visibility", "visible");
        }
      })

      if (currentClassList.contains("demographics")) {
        map.setLayoutProperty("householdmedianincome", "visibility", "visible");

        // make legend and menu visible
        legend.style.opacity = "1";
        menu.style.opacity = "1";
      }
    })
    .onStepExit(response => {
      currentClassList = response.element.classList;

      bldgClasses.forEach(className => {
        if (currentClassList.contains(className) && !currentClassList.contains("demographics")) {
          // if we're exiting the section right before the demographics,
          // only hide exempt-res layer if we're going up
          if (currentClassList.contains("before-demographics") && response.direction == "down") {
            return;
          }
          map.setLayoutProperty(className, "visibility", "none");
        }
      })

      // separate exit rule for demographics section
      if (currentClassList.contains("demographics")) {
        demographicLayers.forEach(layer => {
          map.setLayoutProperty(layer, "visibility", "none");

          // hide legend and menu
          legend.style.opacity = "0";
          menu.style.opacity = "0";
        })
      }
    });

  window.addEventListener("resize", scroller.resize);
})

// demographics menu
let menuButtons = document.querySelector("#map-menu").getElementsByTagName("input");
for (btn of menuButtons) {
  btn.addEventListener("click", function(e) {
    // "clear" button
    if (e.target.id == "clear") {
      // hide all demographic layers
      for (layer of demographicLayers) {
        map.setLayoutProperty(layer, "visibility", "none");
      }
      // remove checked style so it functions more like a button
      e.target.checked = false;
      // hide legend
      legend.style.opacity = "0";
      return;
    }

    // all other buttons
    if (e.target.checked) {
      // make selected layer visible
      map.setLayoutProperty(e.target.id, "visibility", "visible");

      // show legend if it's not visible
      if (legend.style.opacity = "0") {
        legend.style.opacity = "1";
      }

      // change legend labels
      for (let i = 0; i < legendLabels.length; i++) {
        legendLabels[i].innerText = labels[e.target.id][i];
      }

      // hide all other layers
      for (layer of demographicLayers) {
        if (layer != e.target.id) {
          map.setLayoutProperty(layer, "visibility", "none");
        }
      }
    }
  })
}