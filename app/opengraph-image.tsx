import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Zenith College and Career Prep — Elevating Every Future";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const mark = await readFile(join(process.cwd(), "public/brand/zenith-mark.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06243f",
          backgroundImage: "linear-gradient(135deg, #06243f 0%, #0a3557 60%, #42778c 100%)",
          padding: "60px",
        }}
      >
        <img src={markSrc} width={160} height={160} alt="" />
        <div
          style={{
            marginTop: 36,
            fontSize: 62,
            fontWeight: 700,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          Zenith College and Career Prep
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 30,
            color: "#bee5ee",
            textAlign: "center",
          }}
        >
          Elevating Every Future — an early college STEAM high school in Maryvale, Phoenix
        </div>
      </div>
    ),
    { ...size },
  );
}
