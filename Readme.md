# Holy Vision International / YHRI – Backend API

Node.js (ESM) + Express 5 + MongoDB (Mongoose) API used by the **Holy Vision International** and
**Youth for Human Rights India** websites and their admin panel.

## Setup
```bash
npm install
cp .env.example .env        # fill in MONGO_URI, JWT_SECRET, Cloudinary …
npm run create-admin -- admin YourPass123 9876543210 "Site Admin" SuperAdmin
npm start                    # or: npm run dev
```
Health check: `GET /api/health` → `{ status, database }`

> Nobody can make himself Admin through the API. Create the first admin with the command above
> (or `ADMIN_SETUP_KEY` in .env + `"setupKey"` in `/api/auth/registerUser`).

## Who can call what
| | Public (websites) | Logged-in user | Admin / SuperAdmin |
|---|---|---|---|
| Events, Gallery, News, Media, Banners, Category, Team, Testimonials, Schemes, Blogs | GET (active items only) | – | GET all + POST / PUT / DELETE |
| Contact Us, Join Us / Event Registration | POST | – | GET / PUT / PATCH / DELETE |
| Membership | POST `/register`, GET `/details`, POST `/login` | – | list, stats, update, status, delete |
| Upload | POST (rate limited, images / PDF / video, max 10 MB) | | |
| Dashboard | – | – | GET |
| Users | register / login / OTP | profile, own update, passwords | list, roles, block, delete, reset password |

Public forms and logins are rate limited (see `.env.example`).

## Website fields (what the admin panel should send)
**Event** `POST /api/event`
`title*, subtitle, eventType, description, date, endDate, time, location, banner, bannerDescription, highlights[],
isPaid, fee, paymentQr, registrationOpen, attachments | images[] | videos[], isActive, order`
– `fee > 0` makes it a paid event (website shows the QR); free events show the "Congratulations" popup.
– `attachments` may be `["url", …]` or `[{documentType:"image|video|file", urls:[…]}]`.
– Responses also contain `images`, `videos`, `image`, `description`, `status` (upcoming / completed).
– `GET /api/event?type=upcoming|completed`.

**Gallery** `galleryType`: `guests` (Guests & Dignitaries – default) · `video` (Videos page) · `event` (Previous Events).
Fields: `title*, description, date, location, coverImage, images[] | videos[] | attachments, category, order, isActive`.

**Home banner** (each active banner = one slide, sorted by `order`):
`imageUrl | imgUrl[]*, mobileImage, title, subtitle, description, buttonText, buttonLink, order, isActive`.

**News** `title*, newspaperName, language (English / Hindi / other = Multilingual), date, image | images[], description, link`.

**Media coverage** `title*, publisherName (channel), mediaType (tv/radio/online/print), description, coverageDate, link, images[], videos[]`.

**Contact** `name*, email or phone*, subject, message*` – admin can set `status: new | read | resolved`.

**Event registration** `POST /api/join-us` with `eventId` + `name, email, phone, whatsappNo, designation, city, country`
(+ `transactionId` for paid events). The fee is copied from the event. One registration per phone/email per event.

## Membership
1. Website `POST /api/member/register` → returns `memberId` (MEM000001 …).
   Fees per category come from `MEMBER_FEES` (Student free). Paid categories need `transactionId`.
2. Admin `PATCH /api/member/:id/status {"status":"active"}` → sets `validFrom` and `expiryDate`
   (`MEMBERSHIP_VALIDITY_MONTHS`, default 12) and marks the payment verified.
3. Website `GET /api/member/details?memberId=MEM000001&phoneNumber=98…` (or `&email=`) →
   `status`: pending / active / **expired** / suspended / rejected, `expiryDate` … (ID proof is never returned publicly).
4. An expired / inactive member can register again with the same phone → renewal, same Member ID.

Statuses: `pending, active, inactive, suspended, rejected, expired`.

## Uploads
`POST /api/upload` (form-data `file`) → `{ imageUrl, url }`. Uses Cloudinary when the keys are set,
otherwise saves to `./uploads` and serves it at `/uploads/...` (set `PUBLIC_URL` on a server).

## Security notes
- Passwords are stored as bcrypt hashes (old plain-text passwords are upgraded on the next login).
- OTPs are never returned by the API (`OTP_DEBUG=true` only for local testing).
- Never commit `.env` or `firebase/*.json` (both are in `.gitignore`).

See `postman/` for the request collection.
