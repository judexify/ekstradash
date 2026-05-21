import { EventEmitter } from "node:events";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { SERIAL_PORT, BAUD_RATE, MOCK_SERIAL, DEBUG_SERIAL } from "./config.js";

export function createSerialStream() {
  const stream = new EventEmitter();

  // HARDWARE_INTEGRATION_POINT
  if (MOCK_SERIAL) {
    setInterval(() => {
      stream.emit("sample", {
        ax: 0,
        ay: 0,
        az: 9.8,
        gx: 0,
        gy: 0,
        gz: 0,
        shake: false,
      });
    }, 100);

    console.log("[serial] mock active");
    return stream;
  }

  // HARDWARE_INTEGRATION_POINT
  const port = new SerialPort({
    path: SERIAL_PORT,
    baudRate: BAUD_RATE,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

  port.on("open", () => {
    console.log(`[serial] connected ${SERIAL_PORT} @ ${BAUD_RATE}`);
  });

  port.on("error", (error) => {
    console.log(`[serial] error: ${error.message}`);
    SerialPort.list()
      .then((ports) => {
        const names = ports.map((item) => item.path).join(", ");
        console.log(`[serial] available ports: ${names || "none detected"}`);
      })
      .catch(() => {});
  });

  parser.on("data", (line) => {
    try {
      const trimmed = line.trim();
      const jsonStart = trimmed.indexOf("{");
      if (jsonStart === -1) return;

      const sample = JSON.parse(trimmed.slice(jsonStart));
      if (DEBUG_SERIAL) console.log("[serial] sample", sample);

      if (
        typeof sample.ax !== "number" ||
        typeof sample.ay !== "number" ||
        typeof sample.az !== "number" ||
        typeof sample.gx !== "number" ||
        typeof sample.gy !== "number" ||
        typeof sample.gz !== "number"
      ) {
        return;
      }

      stream.emit("sample", {
        ax: sample.ax,
        ay: sample.ay,
        az: sample.az,
        gx: sample.gx,
        gy: sample.gy,
        gz: sample.gz,
        shake: Boolean(sample.shake),
        shakeDurationMs:
          typeof sample.shakeDurationMs === "number"
            ? sample.shakeDurationMs
            : 0,
      });
    } catch {
      if (DEBUG_SERIAL) console.log(`[serial] invalid JSON: ${line}`);
    }
  });

  return stream;
}
