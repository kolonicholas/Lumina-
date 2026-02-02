import http from "node:http";

const urls = ["http://localhost:4000/health", "http://localhost:3000"];

function check(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      if (res.statusCode && res.statusCode < 500) {
        resolve({ url, status: res.statusCode });
      } else {
        reject(new Error(`Bad status for ${url}: ${res.statusCode}`));
      }
    });
    req.on("error", reject);
  });
}

const results = await Promise.all(urls.map((url) => check(url)));
console.log("Smoke test results:", results);
