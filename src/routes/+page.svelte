<script>
  let routeFile;
  let portSerial;

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
  };
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
</main>
