import { createFileRoute } from "@tanstack/react-router";
import { Calculator, Droplets, Sparkles } from "lucide-react";
import { ScreenshotStudio } from "@/components/ScreenshotStudio";
import {
  buildV3RouteHead,
  V3Editorial,
  type V3FaqItem,
  type V3FeatureItem,
  type V3StepItem,
} from "@/components/v3/V3Editorial";
import { V3PageShell } from "@/components/v3/V3PageShell";

const PAGE_TITLE = "Annotate Screenshot Online — Add Arrows, Steps & Text";
const DESCRIPTION =
  "Annotate screenshots online and add curved arrows, numbered step badges, freehand ink, highlighter bands, and crisp text callouts directly in your browser.";

const STEPS: readonly V3StepItem[] = [
  {
    title: "Paste or drop a capture",
    description:
      "Press Cmd+V / Ctrl+V right after taking a system screenshot, or choose any PNG, JPG, or WebP file from disk.",
  },
  {
    title: "Add arrows, steps & labels",
    description:
      "Point with 3-control-point curved arrows (A), stamp auto-numbered steps, circle details with freehand ink (P), and add pill or transparent text (T).",
  },
  {
    title: "Copy or save sharp output",
    description:
      "Copy a crisp PNG straight back to your clipboard for GitHub, Linear, Jira, Slack, or Feishu, or download PNG / JPG.",
  },
];

const FEATURES: readonly V3FeatureItem[] = [
  {
    title: "3-Point Curved & Snap Arrows",
    description:
      "Add arrows to screenshots and pull the midpoint handle to arc cleanly around buttons and menus without covering important UI labels.",
  },
  {
    title: "Auto-Incrementing Step Badges",
    description:
      "Stamp 1, 2, 3 across multi-step workflows to document SOPs, onboarding guides, and exact bug reproduction paths.",
  },
  {
    title: "Freehand Pen & Chisel Highlighter",
    description:
      "Sketch quick red-ink circles with smooth spline curves (P), or swipe translucent highlighter bands (H) across log lines and text.",
  },
  {
    title: "Pill or Colorless Margin Captions",
    description:
      "Choose high-contrast colored capsules or switch to a transparent pill with custom font color for clean callouts on outer margins.",
  },
  {
    title: "Built-In Blur & Mosaic Redaction",
    description:
      "Press B to blur private emails or switch to Mosaic redact before sharing annotated bug tickets externally.",
  },
  {
    title: "Non-Destructive Crop & Full Undo",
    description:
      "Trim unwanted browser tabs at any time — existing arrows, boxes, and labels stay anchored to the underlying screenshot coordinates.",
  },
];

const SHORTCUT_TABLE = [
  { tool: "Curved Arrow", key: "A", note: "Drag start to end, then pull midpoint handle to curve" },
  { tool: "Step Badge (1, 2, 3…)", key: "N", note: "Click to stamp auto-incrementing numbered callouts" },
  { tool: "Freehand Pen", key: "P", note: "Smooth freeform ink for circling or underlining UI" },
  { tool: "Text Callout", key: "T", note: "Supports colored pill fill or transparent background" },
  { tool: "Outline Box / Oval", key: "R / O", note: "Hold Shift while dragging for 1:1 square or circle" },
  { tool: "Blur / Mosaic Redact", key: "B / M", note: "Mask private emails or keys with Gaussian blur or pixels" },
  { tool: "Highlighter / Spotlight", key: "H / S", note: "Chisel marker band over text or dim surrounding UI" },
] as const;

const FAQS: readonly V3FaqItem[] = [
  {
    question: "How do I add a curved arrow to a screenshot?",
    answer:
      "With Curved arrow (A) selected, drag from your starting point to the target element. Once drawn, drag the subtle center circle handle perpendicular to the shaft to bend a smooth arc, or double-click the center handle to straighten it back.",
  },
  {
    question: "Can I place text callouts and arrows outside the screenshot itself?",
    answer:
      "Yes. Add padding in the framing sidebar so your screenshot sits on a clean margin, then drag arrows or text callouts directly onto the outer background frame so zero interface pixels are covered.",
  },
  {
    question: "How do I make a text label background transparent instead of a colored pill?",
    answer:
      "Select the Text tool (T) or click an existing text label, open the Pill color picker in the top toolbar, and click Transparent (No fill). You can then pick any font color independently via the A picker.",
  },
  {
    question: "Do I need an account or browser extension to annotate screenshots?",
    answer:
      "No. Everything runs directly in a standard web tab using local HTML5 canvas rendering — paste with Cmd+V / Ctrl+V, annotate, and download or copy immediately with zero server uploads.",
  },
];

export const Route = createFileRoute("/v3/annotate-screenshot")({
  head: () =>
    buildV3RouteHead({
      title: PAGE_TITLE,
      description: DESCRIPTION,
      canonicalPath: "/annotate-screenshot",
      appName: "Annotate Screenshot Online",
      howToTitle: "How to Annotate & Add Arrows to a Screenshot Online",
      steps: STEPS,
      faqs: FAQS,
    }),
  component: AnnotateScreenshotV3Page,
});

function AnnotateScreenshotV3Page() {
  return (
    <V3PageShell
      title="Annotate Screenshot"
      compareV2To="/v2/screenshot-beautifier"
      hero={{
        title: (
          <>
            Annotate <span className="text-primary">Screenshot</span>
          </>
        ),
        description:
          "Add curved arrows, numbered step badges, freehand ink, highlighter bands, and crisp text labels to screenshots locally in your browser.",
      }}
    >
      <ScreenshotStudio initialTool="arrow" />

      <V3Editorial
        overview={{
          eyebrow: "Clear Visual Feedback",
          heading: "Annotate Screenshots & Add Curved Arrows in Seconds",
          lead: "A well-placed curved arrow and numbered step sequence saves paragraphs of back-and-forth explanation. Mark up UI details directly over your capture — or in the padded margin around it — and export crisp Retina-ready PNGs.",
        }}
        shortcuts={{
          heading: "Markup Shortcuts",
          items: [
            { keys: ["⌘/Ctrl", "V"], action: "Paste capture" },
            { keys: ["A"], action: "Curved arrow" },
            { keys: ["N"], action: "Step badge" },
            { keys: ["T"], action: "Text label" },
            { keys: ["P"], action: "Freehand pen" },
            { keys: ["R"], action: "Outline box" },
            { keys: ["H"], action: "Highlighter" },
            { keys: ["B"], action: "Blur redact" },
          ],
        }}
        howTo={{
          heading: "How to Add Arrows, Steps & Text to a Screenshot",
          steps: STEPS,
        }}
        features={{
          heading: "Purpose-Built Markup Tools for Product, QA & Docs",
          items: FEATURES,
        }}
        referenceSection={
          <section aria-labelledby="v3-shortcuts-heading" className="space-y-4">
            <div className="space-y-1">
              <p className="v3-eyebrow">Quick Reference</p>
              <h2
                id="v3-shortcuts-heading"
                className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Annotation Tools &amp; Keyboard Shortcuts
              </h2>
            </div>

            <div className="v3-table-wrap">
              <table className="v3-table">
                <thead>
                  <tr>
                    <th scope="col">Tool</th>
                    <th scope="col">Shortcut</th>
                    <th scope="col">Interaction Tip</th>
                  </tr>
                </thead>
                <tbody>
                  {SHORTCUT_TABLE.map(row => (
                    <tr key={row.tool}>
                      <td className="font-semibold text-foreground">{row.tool}</td>
                      <td className="num font-semibold text-primary">{row.key}</td>
                      <td className="text-muted-foreground">{row.note}</td>
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
              to: "/v3/blur-screenshot",
              title: "Blur & Pixelate Screenshot",
              description:
                "Mask confidential emails, tokens, and user IDs before sharing annotated bug reports.",
              icon: <Droplets className="h-4 w-4" />,
            },
            {
              to: "/v3/screenshot-beautifier",
              title: "Screenshot Beautifier",
              description:
                "Add clean gradient backgrounds, ambient blur frames, and presentation drop shadows.",
              icon: <Sparkles className="h-4 w-4" />,
            },
            {
              to: "/v3/calculator",
              title: "Aspect Ratio Calculator",
              description:
                "Solve exact pixel widths and heights for documentation embeds and video frames.",
              icon: <Calculator className="h-4 w-4" />,
            },
          ],
        }}
      />
    </V3PageShell>
  );
}
