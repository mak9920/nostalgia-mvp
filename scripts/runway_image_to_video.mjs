const API_KEY = process.env.RUNWAYML_API_SECRET;
if (!API_KEY) throw new Error("RUNWAYML_API_SECRET missing");

// 👉 HIER deine URI einkopieren
const RUNWAY_IMAGE_URI = "runway://eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUyMTUxMjM4LCJ1cGxvYWRCdWNrZXQiOiJydW53YXktdXBsb2Fkcy1wcm9kIiwidXBsb2FkS2V5IjoiZXBoZW1lcmFsLXVwbG9hZHMvNTIxNTEyMzgvMDI1NDQzZTctNGM2Yi00MjYzLWI0NGMtMjM4ZGZhYjgwZWUzL2ZpbGUuanBnIiwidHlwZSI6ImVwaGVtZXJhbCIsImNvbnRlbnRUeXBlIjoiaW1hZ2UvanBlZyIsImlhdCI6MTc2NzQ0NjI1NSwiZXhwIjoxNzY3NTMyNjU1LCJpc3MiOiJodHRwczovL2FwaS5kZXYucnVud2F5bWwuY29tIn0.33yvwEEDZnkZZ3RqS4mMZ4naqu5dHjW_kfk64q0Y4j8";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  // 1) Job starten
  const createRes = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "X-Runway-Version": "2024-11-06",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gen4_turbo",
      promptImage: RUNWAY_IMAGE_URI,
      promptText: "subtle natural motion, slight head movement, blinking, realistic lighting",
      duration: 4,
      ratio: "960:960",
    }),
  });

  const job = await createRes.json();
  console.log("create status:", createRes.status);
  console.log("job:", job);

  if (!createRes.ok) throw new Error("Failed to create image_to_video job");

  const taskId = job.id;

  // 2) Polling
  console.log("Waiting for video generation...");
  while (true) {
    await sleep(5000);

    const statusRes = await fetch(
      `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      }
    );

    const status = await statusRes.json();
    console.log("status:", status.status);

    if (status.status === "SUCCEEDED") {
      console.log("DONE!");
      console.log("OUTPUT:", status.output);
      break;
    }

    if (status.status === "FAILED") {
      throw new Error("Generation failed: " + JSON.stringify(status));
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
