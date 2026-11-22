# Tool outcome measurement

## Events

`tool_complete` is the GA4 key event, counted once per event with no default monetary value. It records either a valid calculation after an explicit edit settles for one second, or a local image that passes validation and decodes successfully. Initial/default results, resets, mode-only navigation, invalid/subpixel results and failed image reads do not count.

`result_copy` records successful clipboard writes only. It is a diagnostic event, not another key event for the same task. Clipboard fallback/manual selection is not counted as a successful programmatic copy.

Event-scoped custom dimensions registered on property `560549779`:

| Parameter | Allowed values |
| --- | --- |
| `tool` | `calculator`, `image`, `video`, `ultrawide`, `16_9`, `make_square`, `change_ratio`, `screenshot_studio` |
| `task_type` | `calculation`, `image_read`, `image_export` |
| `calculation_mode` | `solve`, `ratio`, `resize`, `frame`, `annotate` |

Only these categorical parameters are sent. Input dimensions, ratios, image bytes, filenames, blob URLs and clipboard contents are not sent. Local signatures deduplicate the most recent 100 outcomes per mounted tool; they are held in memory and reset when the component is remounted. This is not a cross-session unique-user metric.

## Developer checks

Add `?analytics_test=1` to a tool URL. QA mode uses `qa_tool_complete` and `qa_result_copy`, with `debug_mode: true` and `test_traffic: internal`. QA events are not key events. A session-storage flag preserves this mode across navigation within the same tab. Use `?analytics_test=0` to explicitly turn it off. No permanent GA4 data filter was enabled.

The explicit QA mode maintains a hidden DOM output, `#analytics-test-events`, containing only the sanitized event payloads. Read its text in browser developer tools for local acceptance. Development/preview origins never load or transmit to the production analytics tag. On the production origin, QA mode suppresses the initial automatic page view and emits `qa_page_view`; automatic enhanced-measurement events and session activity may still exist, so do not equate this with complete exclusion of all test traffic. Use a dedicated test campaign URL when checking production, for example `?analytics_test=1&utm_source=internal_test&utm_medium=qa&utm_campaign=tool_measurement_20261026`.

## Reading the result

Use `tool_complete` key-event users/sessions and its event count as separate metrics. Break down by Tool and Task type, and compare against acquisition source/campaign. A settled valid result is an observed tool outcome, not proof that the user was satisfied or that a business goal was achieved. `result_copy` supplies stronger evidence of result use. Do not add copies to tool completions as if they were additional users.

New definitions are not retroactive. New events require the updated site code to be deployed; registering definitions alone does not prove collection. Confirm production QA events in Realtime/DebugView after release, then let standard reports process data before evaluating acquisition.

References: [GA4 event setup](https://developers.google.com/analytics/devguides/collection/ga4/events), [local acceptance evidence](../verification/tool-analytics-20261026/README.md).
