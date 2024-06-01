const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

http
  .createServer((request, response) => {
    const addr = request.url;
    const q = new URL(addr, "http://" + request.headers.host);
    let filePath = "";

    // Append request URL and timestamp to log.txt
    fs.appendFile(
      "log.txt",
      `URL: ${addr}\nTimestamp: ${new Date().toISOString()}\n\n`,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Added to log.");
        }
      }
    );

    console.log("Requested Path:", q.pathname);

    if (q.pathname === "/documentation") {
      filePath = path.join(__dirname, "documentation.html");
    } else {
      filePath = path.join(__dirname, "index.html");
    }

    // Log the file path
    console.log("Serving file:", filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.write("Internal Server Error");
        response.end();
        console.error("Error reading file:", filePath);
        return;
      }

      response.writeHead(200, { "Content-Type": "text/html" });
      response.write(data);
      response.end();
    });
  })
  .listen(8080, () => {
    console.log("My test server is running on Port 8080.");
  });
