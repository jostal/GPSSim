import { beginSimulation } from "$lib/utils";

export async function POST({ request }) {
  const reqData = await request.json();
  const routeData = JSON.parse(reqData.route);
  const port = reqData.port;
  let ret = beginSimulation(port, routeData.geometry);
  return new Response(ret)
}
