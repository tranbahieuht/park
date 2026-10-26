/* Local TLS SMTP sink for synthetic tests only; never forwards mail.
   node scripts/smtp-sandbox.mjs <certificate.pem> <private-key.pem> */
import tls from "node:tls";
import http from "node:http";
import fs from "node:fs";

const [certFile, keyFile] = process.argv.slice(2);
if (!certFile || !keyFile) throw Error("Provide local certificate and private key paths");
let count = 0, reject = false, delay = 0;
const messages = [];
const smtp = tls.createServer({ cert: fs.readFileSync(certFile), key: fs.readFileSync(keyFile) }, socket => {
  socket.setEncoding("utf8"); socket.write("220 localhost SMTP sandbox\r\n");
  let buffer = "", data = false, auth = 0, lines = [], recipient = "", sender = "";
  socket.on("error", () => {});
  socket.on("data", chunk => {
    buffer += chunk;
    while (buffer.includes("\r\n")) {
      const i = buffer.indexOf("\r\n"), line = buffer.slice(0, i); buffer = buffer.slice(i + 2);
      if (data) {
        if (line === ".") {
          data = false;
          setTimeout(() => {
            if (reject) socket.write("451 temporary sandbox failure\r\n");
            else { count++; messages.push({ sender, recipient, message: lines.join("\r\n") }); socket.write("250 accepted locally\r\n"); }
            lines = [];
          }, delay);
        } else lines.push(line);
      } else if (auth) { auth--; socket.write(auth ? "334 UGFzc3dvcmQ6\r\n" : "235 authenticated\r\n"); }
      else if (/^EHLO|^HELO/i.test(line)) socket.write("250-localhost\r\n250 AUTH PLAIN LOGIN\r\n");
      else if (/^AUTH PLAIN/i.test(line)) socket.write("235 authenticated\r\n");
      else if (/^AUTH LOGIN/i.test(line)) { auth = 2; socket.write("334 VXNlcm5hbWU6\r\n"); }
      else if (/^MAIL FROM:/i.test(line)) { sender = line.slice(10); socket.write("250 sender ok\r\n"); }
      else if (/^RCPT TO:/i.test(line)) { recipient = line.slice(8); socket.write("250 recipient ok\r\n"); }
      else if (/^DATA$/i.test(line)) { data = true; lines = []; socket.write("354 end with dot\r\n"); }
      else if (/^QUIT$/i.test(line)) { socket.end("221 bye\r\n"); }
      else socket.write("250 ok\r\n");
    }
  });
});
smtp.listen(2465, "127.0.0.1");
// Loopback-only control endpoint. Synthetic test messages exist in memory only.
http.createServer(async (request, response) => {
  if (request.method === "POST") {
    let text = ""; for await (const chunk of request) text += chunk;
    try { const body = JSON.parse(text); reject = body.reject === true; delay = Math.min(5000, Math.max(0, Number(body.delay) || 0)); } catch {}
  }
  response.setHeader("Content-Type", "application/json"); response.end(JSON.stringify({ count, reject, delay, messages }));
}).listen(3102, "127.0.0.1", () => process.stdout.write("Local-only SMTP sandbox: TLS 2465, control 3102. No external delivery.\n"));
