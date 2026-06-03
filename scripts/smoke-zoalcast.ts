const baseUrl = process.env.BASE_URL ?? "https://api.zoalcast.com/api";
const portalId = process.env.PORTAL_ID ?? "6";

async function assert200(path: string) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}`);
  }
  console.log(`OK: ${url}`);
  return res;
}

async function run() {
  console.log(`Smoke test: ${baseUrl} (portal ${portalId})`);

  await assert200(`/portal/${portalId}/categories`);
  const topRes = await assert200(
    `/podcast/${portalId}/top?criteria=latest&page=1&per_page=20`,
  );
  await assert200(`/podcast/${portalId}/search?q=music&page=1`);

  const topJson = (await topRes.json()) as { data?: Array<{ id?: number }> };
  const podcastId = topJson.data?.[0]?.id;
  if (!podcastId) {
    throw new Error("Could not resolve a podcast id from top list.");
  }
  await assert200(`/podcast/${podcastId}`);

  console.log("Smoke test completed successfully.");
}

run().catch((error) => {
  console.error(`Smoke test failed: ${String(error)}`);
  process.exit(1);
});
