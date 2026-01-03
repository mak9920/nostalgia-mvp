import * as fs from "node:fs";

const API_KEY = process.env.RUNWAYML_API_SECRET;
if (!API_KEY) throw new Error("RUNWAYML_API_SECRET missing");

const filePath = "./public/demos/t2_before.jpg";
const fileBuf = fs.readFileSync(filePath);

async function main() {
  // 1) Create ephemeral upload
  const createRes = await fetch("https://api.dev.runwayml.com/v1/uploads", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "X-Runway-Version": "2024-11-06",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "ephemeral",
      filename: "t2_before.jpg",
      contentType: "image/jpeg",
    }),
  });

  const createJson = await createRes.json();
  console.log("create status:", createRes.status);
  // console.log(createJson); // optional (sehr lang)

  if (!createRes.ok) throw new Error("Create upload failed");

  const uploadUrl = createJson.uploadUrl;
  const fields = createJson.fields;
  const runwayUri = createJson.runwayUri;

  if (!uploadUrl || !fields || !runwayUri) throw new Error("Missing uploadUrl/fields/runwayUri");

  // 2) Presigned POST to S3
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  form.append("file", new Blob([fileBuf], { type: "image/jpeg" }), "t2_before.jpg");

  const postRes = await fetch(uploadUrl, {
    method: "POST",
    body: form,
  });

  console.log("post status:", postRes.status);

  if (!(postRes.status === 204 || postRes.status === 201 || postRes.ok)) {
    const t = await postRes.text().catch(() => "");
    throw new Error("S3 POST failed: " + t);
  }

  console.log("FINAL URI:", runwayUri);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
