# Plugin privacy review — October 2, 2026

Status: local policy revision; confirm the operational facts below before publishing and resubmitting. No deployment or submission has been made.

## Basis for the changes

OpenAI's rejection asks for data categories, purposes, recipients, retention and controls that match tool inputs and outputs. It separately flags the submitted name or description.

Requirements: https://developers.openai.com/plugins/plugin-guidelines

The policy now describes all seven tools in the sibling backend's `src/mcp/server.ts`, using `output-schemas.ts`, `media.ts`, `validators/post.validator.ts`, and `docs/mcp.md`. The deletion wording follows `src/services/settings.service.ts`. Website disclosures follow `app/layout.tsx`, `app/components/datafast-analytics.tsx`, and `app/api/generate/route.ts`.

## Facts to confirm before publication

- **Production parity:** confirm the reviewed local backend matches the deployed plugin's tools and behavior.
- **Logs:** identify backend, hosting, proxy and error-log providers; what they record (including whether request bodies, attachment URLs or tool results are captured); who can access them; and when they are deleted. The MCP tool handler logs error names, but that does not establish the infrastructure's logging behavior or retention.
- **Backups:** identify database/storage backups, their expiry periods, and how deleted data is handled during restoration. Account deletion from the live database does not establish deletion from backups.
- **Media removal:** the upload code has no automatic file expiry and account deletion does not remove R2 objects. Confirm the support process and completion period for media removal requests. MCP uploads use hashed object keys without a database ownership inventory, so removal needs a reliable way to locate a user's files. Cache headers allow a year of caching; assess whether this meets the intended deletion promise.
- **Other retention:** confirm analytics-provider retention settings, support-message retention, billing-provider retention and any legal hold periods. Add verified periods and exceptions to the policy; do not invent a blanket 30-day promise.
- **Tracking controls:** the website loads DataFast, Google Analytics when configured, and TikTok Pixel globally. Browser controls are disclosed; there is no in-app consent or opt-out control in the reviewed layout. Confirm the intended tracking choices and implement them if required before claiming users have those controls.
- **AI data use:** verify the configured Gemini service's data-use terms and any internal training or secondary use before adding a promise about model training or no secondary use.
- **Existing commitments:** the previous policy already promised deletion of Google data from active systems within 30 days of a valid request and made Google/Canva security claims. Those statements were preserved; verify the operational process supports them.

Retention means how long data remains stored. Token validity and cache lifetime are separate from deletion of stored records. A fixed period is appropriate only when an actual process or provider setting enforces it.

## Proposed listing copy

The exact rejected listing was not supplied, so this is a replacement suggestion rather than a diagnosis of its wording.

**Name:** Amplypost

**Subtitle:** Schedule and publish social media posts

**Description:** Connect your Amplypost account to view connected social accounts, find posts and saved hashtags, upload images or videos, and publish or schedule posts. Check publishing status from ChatGPT.

Keep claims limited to implemented tools. The current tools do not edit or delete posts, connect social accounts, save drafts, or send email/SMS campaigns. OpenAI's listing guidance calls for clear factual descriptions without promotions, pricing claims or unverifiable comparisons.

## Final checks for resubmission

1. Resolve the operational facts above and update the retention disclosure.
2. Publish the revised page at `https://www.amplypost.com/privacy` and verify it is accessible without signing in. The page now has its own canonical URL; terms links point to `/privacy`.
3. Confirm the dashboard's privacy-policy URL and revise the listing metadata.
4. Compare live tool discovery and sample results with the policy. Review whether returned account settings, record timestamps and organization identifiers are necessary; disclosure alone does not satisfy OpenAI's data-minimization requirement.
5. Resubmit through the OpenAI dashboard after these checks. Policy edits alone do not establish approval.
