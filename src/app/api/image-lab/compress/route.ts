import { encodeAllPresets } from "@/lib/image-compress/encode";
import { recommendVariants } from "@/lib/image-compress/presets";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / (1024 * 1024)} MB)` },
      { status: 413 },
    );
  }

  try {
    const { source, variants } = await encodeAllPresets(buffer);
    const meta = variants.map(
      ({ dataBase64: _d, ...rest }) => rest,
    );
    const recommendations = recommendVariants(meta);

    return NextResponse.json({
      source: {
        ...source,
        fileName: file.name,
        mime: file.type,
      },
      variants: variants.map(({ dataBase64, ...v }) => ({
        ...v,
        dataUrl: `data:${v.mime};base64,${dataBase64}`,
      })),
      recommendations,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Encode failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
