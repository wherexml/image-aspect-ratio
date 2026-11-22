import { createFileRoute } from "@tanstack/react-router";
import { Crop, PenLine, Sparkles } from "lucide-react";
import { ScreenshotStudio } from "@/components/ScreenshotStudio";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Blur Screenshot & Pixelate Part of Image Online — Free";
const DESCRIPTION =
  "Blur sensitive text, emails, API keys, or faces in screenshots locally in your browser. True irreversible Gaussian blur and pixelation—zero uploads.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Open or paste screenshot",
    description:
      "Drop a PNG, JPG, or WebP capture onto the stage or press Cmd+V / Ctrl+V. The workspace opens at original 1:1 unframed bounds with Blur redact (B) ready.",
  },
  {
    title: "Blur or pixelate private regions",
    description:
      "Drag smooth Gaussian blur boxes over emails, names, or balances — or switch to Mosaic redact or Filled block in the toolbar for coarse pixelation or opaque blackout.",
  },
  {
    title: "Download flattened PNG or JPG",
    description:
      "Copy directly to your clipboard or download a single-layer PNG or JPG with underlying pixels permanently overwritten.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "Smooth Regional Gaussian Blur",
    description:
      "Drag frosted blur regions (B) that blend naturally into light or dark interfaces while making sensitive text, emails, and numbers illegible.",
  },
  {
    title: "Mosaic Pixelate & Opaque Blackout",
    description:
      "Switch anytime between smooth Blur redact, classic coarse Mosaic pixelation, and 100% opaque Filled blocks in one unified toolbar.",
  },
  {
    title: "Adjustable Blur & Mosaic Strength",
    description:
      "Select any blur or mosaic box and change stroke weight (2 pt to 12 pt) to dial from subtle UI de-emphasis to heavy privacy redaction.",
  },
  {
    title: "Opens at Exact 1:1 Capture Bounds",
    description:
      "Starts with zero outer padding and zero corner rounding so redacted bug reports and receipts preserve your original pixel dimensions.",
  },
  {
    title: "100% Local Browser Processing",
    description:
      "Customer records, API dashboards, and billing screenshots never leave your device — all pixel rendering happens inside HTML5 Canvas memory.",
  },
  {
    title: "Flattened Single-Layer Output",
    description:
      "Exports encode a brand-new bitmap with zero hidden vector layers, edit history, or recoverable original buffers inside the file.",
  },
];

const REDACTION_COMPARISON = [
  {
    mode: "Blur Redact (Default · Key: B)",
    visual: "Smooth multi-pass Gaussian frosted blur",
    recommended: "Emails, user names, chat messages, avatars, and clean product docs",
  },
  {
    mode: "Mosaic Pixelate (Key: M)",
    visual: "Coarse square pixel blocks",
    recommended: "Faces, street numbers, license plates, and classic pixelated UI previews",
  },
  {
    mode: "Filled Solid Block (Key: F)",
    visual: "100% opaque solid color rectangle",
    recommended: "API keys, passwords, card digits, tokens, and strict security compliance",
  },
  {
    mode: "Spotlight Cutout (Key: S)",
    visual: "Darkens surroundings while keeping target sharp",
    recommended: "Highlighting one menu or setting while muting surrounding dashboard clutter",
  },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "Are private screenshots uploaded to a server when I blur them here?",
    answer:
      "No. Decoding, regional Gaussian blurring, mosaic pixelation, and PNG/JPG encoding run entirely inside your local browser tab. Nothing is uploaded over the network.",
  },
  {
    question: "When should I choose Gaussian Blur vs. Mosaic vs. a Solid Filled Block?",
    answer:
      "Use Gaussian Blur (B) for a clean, distraction-free look on emails, names, and UI text; use Mosaic when you want unmistakable visual redaction cues; and always choose a Solid Filled Block for short high-entropy secrets like API keys, passwords, or bank digits so zero luminance clues remain.",
  },
  {
    question: "How do I make the blur stronger on small or high-contrast text?",
    answer:
      "Click the blurred box (or choose a weight before dragging) and increase the stroke thickness control in the top toolbar up to 8 pt or 12 pt for deeper Gaussian diffusion.",
  },
  {
    question: "Can someone unblur or undo the redaction in the downloaded PNG?",
    answer:
      "No. The downloaded PNG or JPG is a flat, single-layer raster image — original unblurred pixels and annotation history are never embedded in the exported file.",
  },
  {
    question: "Can I also add arrows or a clean background after blurring sensitive parts?",
    answer:
      "Yes. Press A to draw curved arrows, T to add text callouts right on top of or beside blurred areas, or open the right-hand framing sidebar to wrap the screenshot in a clean gradient.",
  },
];

export const Route = createFileRoute("/v3/blur-screenshot")({
  head: () =>
    buildV3RouteHead({
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/blur-screenshot",
      appName: "Blur & Pixelate Screenshot Tool",
      howToTitle: "How to Blur or Pixelate Part of a Screenshot Online",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: BlurScreenshotV3Page,
});

function BlurScreenshotV3Page() {
  return (
    <V3PageShell
      title="Blur & Pixelate Screenshot"
      compareV2To="/v2/screenshot-beautifier"
      hero={{
        title: (
          <>
            Blur &amp; Pixelate <span className="text-primary">Screenshot</span>
          </>
        ),
        description:
          "Blur sensitive text, emails, and private fields or pixelate part of any image in seconds — pre-set to clean 1:1 bounds with 100% local browser privacy.",
      }}
    >
      <ScreenshotStudio initialTool="blur" initialUnframed />

      <V3Editorial
        overview={{
          eyebrow: "Local Privacy Redaction",
          heading: "Blur Sensitive Screenshot Text or Pixelate Part of Any Image",
          lead: "Sharing bug reports, customer tickets, or financial dashboards shouldn’t mean uploading confidential captures to cloud servers. Drag smooth Gaussian blur, coarse mosaic pixelation blocks, or opaque blackouts directly in your browser and export a flat, clean PNG or JPG.",
        }}
        visualGuide={{
          eyebrow: "3 Redaction Modes",
          heading: "Side-by-Side: Gaussian Blur vs. Mosaic Pixelate vs. Solid Block",
          src: "/previews/blur-vs-mosaic-redaction.webp",
          width: 1120,
          height: 500,
          alt: "Side-by-side comparison of three local screenshot redaction modes hiding customer email and API key fields: smooth Gaussian blur (key B), coarse mosaic pixelation blocks (key M), and 100 percent opaque solid blackout block (key F)",
          caption:
            "Every export flattens your redaction into a single-layer PNG or JPG bitmap locally in browser memory — zero recoverable layers or server uploads.",
        }}
        shortcuts={{
          heading: "Redaction Shortcuts",
          items: [
            { keys: ["⌘/Ctrl", "V"], action: "Paste screenshot" },
            { keys: ["B"], action: "Gaussian blur" },
            { keys: ["M"], action: "Mosaic pixelate" },
            { keys: ["F"], action: "Solid blackout" },
            { keys: ["S"], action: "Spotlight dim" },
            { keys: ["A"], action: "Curved arrow" },
            { keys: ["⌘/Ctrl", "Z"], action: "Undo" },
          ],
        }}
        howTo={{
          heading: "How to Blur or Pixelate Part of a Screenshot",
          steps: STEPS,
        }}
        features={{
          heading: "Fast, Private Redaction Without Desktop Bloat",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-blur-modes-heading" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Redaction Guide</p>
              <h2
                id="v3-blur-modes-heading"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Gaussian Blur vs. Mosaic Pixelate vs. Solid Block
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Redaction Tool</th>
                    <th scope="col">Visual Result</th>
                    <th scope="col">Best Used For</th>
                  </tr>
                </thead>
                <tbody>
                  {REDACTION_COMPARISON.map(row => (
                    <tr key={row.mode}>
                      <td className="font-semibold text-foreground">{row.mode}</td>
                      <td className="text-muted-foreground">{row.visual}</td>
                      <td className="text-muted-foreground">{row.recommended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        }
        faq={{
          items: FAQS,
        }}
        relatedTools={{
          items: [
            {
              to: "/v3/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Add clean gradient backgrounds, balanced padding, rounded corners, and soft window shadows.",
              icon: <Sparkles className="h-4 w-4" />,
            },
            {
              to: "/v3/annotate-screenshot",
              title: "Annotate Screenshot",
              description:
                "Point out exact bugs or onboarding steps with curved arrows, step badges, and callouts.",
              icon: <PenLine className="h-4 w-4" />,
            },
            {
              to: "/v3/change-image-aspect-ratio",
              title: "Change Image Aspect Ratio",
              description:
                "Fit or crop redacted captures to exact 16:9, 4:5, or 1:1 documentation and social frames.",
              icon: <Crop className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
