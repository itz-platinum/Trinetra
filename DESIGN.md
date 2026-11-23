# TRINETRA Design System

**Tagline:** One Identity. Every Payment Connection.

TRINETRA is a personal UPI identity and payment-profile platform. The visual architecture prioritizes restraint, clarity, crisp typography, and explicit trust boundaries over decorative noise.

---

## 1. Color Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `--bg-canvas` | `#080C14` | Main viewport background |
| `--bg-secondary` | `#0D1422` | Cards, sidebar rail, auth & identity containers |
| `--bg-elevated` | `#121E2E` | Interactive rows, nested panels, hover fills |
| `--accent-primary` | `#25C9F2` | Primary CTAs, active focus rings, `@username` handles |
| `--accent-secondary` | `#477BFF` | Technical highlights & Paytm/secondary tint |
| `--accent-violet` | `#8971F7` | PhonePe & secondary accent tint |
| `--text-primary` | `#F5F8FC` | Primary headings, labels, input text |
| `--text-secondary` | `#91A2B8` | Descriptions, body copy, secondary controls |
| `--text-muted` | `#64748B` | Section eyebrows, placeholders, helper captions |
| `--status-success` | `#28C987` | Public visibility, valid checks, positive feedback |
| `--status-error` | `#F06473` | Inline validation errors, destructive actions |
| `--status-warning` | `#E5A93B` | Handle-change warnings, pending states |

Borders rely on crisp hairlines (`rgba(145, 162, 184, 0.12)` to `0.24`) instead of heavy shadows or glowing outlines.

---

## 2. Typography

- **Display (`font-display`):** `Space Grotesk` — tight tracking (`-0.02em`), crisp geometric authority on headlines and page titles.
- **Body (`font-sans`):** `Inter` — 14px–16px UI copy, form labels, and descriptions.
- **Technical (`font-mono`):** `IBM Plex Mono` with `.tabular-nums` — VPA handles (`name@okaxis`), `upi://pay?...` URIs, INR amounts, and monospace section eyebrows (`11px`, uppercase, `tracking-wider`).

---

## 3. Surface Geometry & Rhythm

- **Radius:** `6px` (`rounded-md`) for compact buttons/badges, `8px` (`rounded-lg`) for inputs/rows, `12px` (`rounded-xl`) for structured cards and dialogs. Avoid oversized pill boxes or `rounded-3xl` wrappers.
- **Background Textures:** `.bg-precision-grid` (`32px` architectural grid) on landing hero and auth pages; `.bg-precision-dots` (`20px` dot matrix) on `/u/:username`.
- **Spacing Scale:** `8px` base unit (`gap-4`, `p-6`, `py-20`), max width `max-w-6xl` on marketing, `max-w-5xl` inside the dashboard shell, and `max-w-md` on public identity cards.

---

## 4. Composable Components

### Primitives (`src/components/ui/`)
- `Button`: `primary | secondary | outline | ghost | danger`; `sm (32px) | md (40px) | lg (44px)`; explicit `loading`, `disabled`, `leftIcon`, `rightIcon`.
- `Input`, `Textarea`, `Select`: Standardized `40px` height (`#080C14` fill), accessible `aria-invalid` + `aria-describedby`, inline errors with icon, helper hints.
- `Card` (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
- `StatusIndicator`: Always pairs a Lucide icon with concise text (`Public`, `Unpublished`, `UPI Intent`).
- `Dialog` & `ConfirmDialog`: Escape-key and backdrop dismissal; destructive confirmations support `requireTypedText` (e.g., `"DELETE"`) instead of browser `window.confirm` / `window.alert`.
- `ToastProvider` / `useToast`: Non-blocking `aria-live="polite"` notifications.
- `Skeleton`, `EmptyState`, `Tooltip`, `Dropdown`.

### Domain Components (`src/components/`)
- `TrinetraLogo`: Crisp geometric vector mark (`24px–32px`) with optional wordmark.
- `Avatar`: Image display with automatic `onError` fallback to crisp initials.
- `PaymentAppIcon` & `PaymentAppItem`: Consistent app badges (`gpay`, `phonepe`, `paytm`, `bhim`, `amazonpay`, `other`) supporting `visitor`, `manage`, and `preview` modes.
- `ProfileCard`: Reusable live identity preview used on the dashboard and overview.
- `QrCodePanel`: Deterministic client-side SVG QR generator (`qrcode.react`) supporting **UPI Scan & Pay QR** (`upi://pay?pa=...&pn=...&cu=INR&am=...`) and **Profile Link QR**, URI copy, and SVG download.
- `DashboardLayout`: Fixed `256px` desktop sidebar, compact breadcrumb header with `Dropdown`, mobile drawer, and fixed mobile bottom bar.

---

## 5. Product & Security Honesty

- TRINETRA constructs standard `upi://pay` intent links and QR codes from user-configured public VPA handles.
- TRINETRA never holds funds, requests banking passwords/UPI PINs, or verifies payment settlement.
- Dashboard pages display only real configuration state (active apps, visibility, readiness checklist)—never fabricated transaction volumes or analytics.
- Motion respects `prefers-reduced-motion` via `<MotionConfig reducedMotion="user">` and CSS `@media (prefers-reduced-motion: reduce)`.
