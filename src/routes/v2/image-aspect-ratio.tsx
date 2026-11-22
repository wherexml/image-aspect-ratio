import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageRatioGuide } from "@/components/ImageRatioGuide";
import { ImageInspectorV2, V2ImageReferenceSections } from "@/components/v2/ImageInspectorV2";
import { V2PageShell } from "@/components/v2/V2PageShell";

export const Route = createFileRoute("/v2/image-aspect-ratio")({
  head: () => ({
    meta: [
      { title: "Image Aspect Ratio (V2 Preview)" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ImageAspectRatioV2Page,
});

function ImageAspectRatioV2Page() {
  const navigate = useNavigate();
  return (
    <V2PageShell
      title="Image Aspect Ratio"
      v1To="/"
      hero={{
        title: (
          <>
            Image Aspect Ratio <span className="text-primary">Calculator</span>
          </>
        ),
        description:
          "Choose a photo to see its pixel dimensions and exact aspect ratio, then preview Fit or Fill in common frames.",
      }}
    >
      <ImageInspectorV2 onNavigate={to => void navigate({ to })} />
      <V2ImageReferenceSections>
        <ImageRatioGuide />
      </V2ImageReferenceSections>
    </V2PageShell>
  );
}
