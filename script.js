mapboxgl.accessToken =
  "pk.eyJ1IjoiY3JzaGF0ZmllbGQiLCJhIjoiY2s5bGZjYnhhMjVlcDNnbzRwcWlzbmU1ZSJ9.YQsNhcTftoNjzASR-38XaQ";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/crshatfield/cka1nj5xq3blj1ipfyco0e7md",
  center: [-73.95, 40.71], // NYC: approximately 40 deg N, 74 deg W
  zoom: 10,
});

map.dragPan.disable();

// initialize the scrollama
let scroller = scrollama();

// set up stickyfill
d3.selectAll(".sticky").each(function () {
  Stickyfill.add(this);
});

// force a resize on load to ensure proper dimensions are sent to scrollama
scroller.resize();

let bldgClasses = ["allbuildings", "exempt-all", "exempt-res", "notexempt-res"];
let demographicLayers = ["pctwhite", "education", "householdmedianincome", "totalrentburdened"]

scroller
  .setup({
    step: ".step",
    offset: 0.5,
  })
  .onStepEnter(response => {
    // response = { element, direction, index }
    let currentClassList = response.element.classList;
    
    bldgClasses.forEach(className => {
      if (currentClassList.contains(className)) {
        console.log(`${currentClassList} contains ${className}`)
        map.setLayoutProperty(className, "visibility", "visible");
      }
    })

    if (currentClassList.contains("demographics")) {
      map.setLayoutProperty("householdmedianincome", "visibility", "visible");
    }
  })
  .onStepExit(response => {
    let currentClassList = response.element.classList;

    bldgClasses.forEach(className => {
      // if we're exiting the section right before the demographics,
      // or if we're scrolling up from the demographics section,
      // don't hide the exempt-res layer just to show it again immediately
      if (currentClassList.contains(className) && !currentClassList.contains("before-demographics") && !currentClassList.contains("demographics")) {
        map.setLayoutProperty(className, "visibility", "none");
      }
    })

    if (currentClassList.contains("demographics")) {
      demographicLayers.forEach(layer => {
        map.setLayoutProperty(layer, "visibility", "none");
      })
    }
  });

window.addEventListener("resize", scroller.resize);