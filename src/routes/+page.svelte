<script>
  import { Map, View } from "ol";
  import { useGeographic } from "ol/proj.js";
  import OSM from "ol/source/OSM.js";
  import Control from "ol/control/Control.js";
  import Feature from "ol/Feature.js";
  import Point from "ol/geom/Point.js";
  import LineString from "ol/geom/LineString.js";
  import { Icon, Stroke, Style } from "ol/style.js";
  import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
  import { Vector as VectorSource } from "ol/source.js";
  import { onMount } from "svelte";
  let routeFile;
  let portSerial;

  $: if (routeFile) {
    addRouteLayer();
  }

  useGeographic();
  let target;
  let view;
  let map;
  let avatarFeature;
  let avatarLayer;
  let routeFeature;
  let routeLayer;

  let countdown;

  const rasterLayer = new TileLayer({
    source: new OSM(),
  });

  onMount(() => {
    view = new View({
      center: [-80.226464, 43.532691],
      zoom: 15,
    });
    map = new Map({
      layers: [rasterLayer],
      target: target,
      view: view,
    });
  });

  async function addRouteLayer() {
    map.removeLayer(routeLayer);
    let routeText = await routeFile.text();
    let routeData = JSON.parse(routeText).geometry;
    console.log(routeData);

    routeFeature = new Feature(new LineString(routeData.coordinates));
    routeLayer = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature],
      }),
      style: new Style({
        stroke: new Stroke({
          color: "#3268ab",
          width: 4,
        }),
      }),
    });
    map.addLayer(routeLayer);
  }

  async function addAvatar(lon, lat) {
    map.removeLayer(avatarLayer);
    avatarFeature = new Feature(new Point([parseFloat(lon), parseFloat(lat)]));
    avatarLayer = new VectorLayer({
      className: "avatarLayer",
      source: new VectorSource({
        features: [avatarFeature],
      }),
      style: new Style({
        image: new Icon({
          src: "avatar.svg",
          scale: 0.2,
        }),
      }),
    });
    map.addLayer(avatarLayer);
  }

  const simulateRoute = async (route, port) => {
    let routeText = await route.text();
    const response = await fetch("/api/simulate", {
      method: "POST",
      body: JSON.stringify({
        route: JSON.stringify(JSON.parse(routeText)),
        port: port,
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const data = await response.json();

    let features = data.features;
    const startTime = new Date(data.startTime);
    let curTime = new Date();

    while (startTime.getSeconds() > curTime.getSeconds()) {
      curTime = new Date();
      countdown = startTime.getSeconds() - curTime.getSeconds();
      await wait(500);
    }
    countdown = null;

    for (const feature of features) {
      let coords = feature.geometry.coordinates;
      for (const coord of coords) {
        let lon = coord[0];
        let lat = coord[1];
        addAvatar(lon, lat);
      }
      await wait(1000);
    }
  };

  function wait(milli) {
    return new Promise((resolve) => setTimeout(resolve, milli));
  }
</script>

<main>
  <label for="file">Upload route to simulate</label>
  <input
    type="file"
    id="file"
    name="routeFile"
    on:input={(e) => (routeFile = e.target.files[0])}
    required
  />
  <br />
  <br />
  <label for="portInput">Serial Port:</label>
  <input
    type="text"
    id="portInput"
    name="portInput"
    bind:value={portSerial}
    required
  />
  <button on:click={() => simulateRoute(routeFile, portSerial)}
    >Simulate Route</button
  >

  <section>
    {#if countdown}
      <div id="countdown">
        {countdown}
      </div>
    {/if}
    <div id="map" class="map" bind:this={target} />
  </section>
</main>

<style>
  main {
    width: calc(100vw - 20px);
    height: calc(100vw - 20px);
  }

  #countdown {
    position: absolute;
    left: 50%;
    top: 20px;
    color: red;
    font-weight: bold;
    font-size: 2em;
    z-index: 10;
  }

  section {
    position: relative;
    margin-top: 10px;
    height: calc(100% - 160px);
    width: 100%;
  }

  #map {
    height: 100%;
    width: 100%;
  }
</style>
