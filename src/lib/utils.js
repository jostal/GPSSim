import { SerialPort } from "serialport";
import lineChunk from "@turf/line-chunk"

export function beginSimulation(portPath, routeData) {
  // split route into smaller chunks so travel at 6m/s with 500ms delay
  let chunks = lineChunk(routeData, 6, { units: 'meters' })
  const port = new SerialPort({
    path: portPath,
    baudRate: 9600,
    parity: 'none',
    autoOpen: false,
  }, function(err) {
    if (err)
      console.log("Error creating port: ", err.message)
  })

  // send coords to port
  let features = chunks.features

  // set start time in 10s so frontend and serial port are in sync
  let startTime = new Date();
  startTime.setSeconds(startTime.getSeconds() + 10);
  sendSerial(port, features, startTime)

  return JSON.stringify({
    features: features,
    startTime: startTime
  });
}

async function sendSerial(port, features, startTime) {
  let curTime = new Date();
  while (startTime.getSeconds() > curTime.getSeconds()) {
    curTime = new Date();
    console.log(startTime.getSeconds() - curTime.getSeconds())
    await wait(500)
  }

  for (const feature of features) {
    let coords = feature.geometry.coordinates
    for (const coord of coords) {
      let lon = coord[0]
      let lat = coord[1]
      let coordString = lon.toFixed(6) + ',' + lat.toFixed(6) + '\n'
      port.open()
      port.write(coordString, 'ascii', function(err) {
        if (err) {
          return console.log('Write error: ', err)
        }

        // console.log('Sent: ', coordString)
        port.close()
      })
      await wait(1000)
    }
  }

  port.on('error', function(err) {
    console.log('Error: ', err.message)
  })

  return { succ: true }
}

function wait(milli) {
  return new Promise(resolve => setTimeout(resolve, milli))
}
