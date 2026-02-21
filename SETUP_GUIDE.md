# Aether Vitality — Full Setup Guide

This comprehensive guide covers setting up the project from scratch, configuring Firebase Authentication, getting Gemini API keys, pushing to GitHub, and deploying to Cloudflare Pages with a custom domain.

## Prerequisites

- **Node.js**: v18 or likely v20+ (since we specified v20 for Cloudflare).
- **Git**: Installed and configured.
- **Accounts**:
  - [Google Cloud / Firebase](https://console.firebase.google.com/)
  - [Google AI Studio](https://aistudio.google.com/) (for Gemini keys)
  - [GitHub](https://github.com/)
  - [Cloudflare](https://dash.cloudflare.com/)

---

## 1. Local Setup

### Clone & Install
If you haven't already, navigate to your desired folder:

```bash
# Clone the repository (replace with your repo URL once created)
git clone https://github.com/YOUR_USERNAME/aether-vitality.git
cd aether-vitality

# Install dependencies
npm install
```

### Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`).

```bash
cp .env.example .env
```

You will need to fill in the **Gemini API Keys** (see Section 3).

---

## 2. Firebase Setup (Authentication)

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add project** and name it `aether-vitality` (or similar).
3.  Disable Google Analytics (optional, keeps it simpler) and click **Create project**.
4.  once created, click the **Web icon (</>)** to add a web app.
    -   Name: `Aether Vitality Web`
    -   Click **Register app**.
5.  **Copy the config object** (apiKey, authDomain, etc.) and update your `.env` file with these values.
    *(Note: These variables must be prefixed with `VITE_` as shown in `.env.example`.)*

### Enable Authentication
1.  Go to **Build > Authentication** in the sidebar.
2.  Click **Get Started**.
3.  **Sign-in method** tab:
    -   **Email/Password**: Click, enable, and Save.
    -   **Google**: Click, enable.
        -   Set the **Project support email**.
        -   Click **Save**.
4.  **Authorized Domains**:
    -   Go to **Settings > Authorized domains**.
    -   Add your local domain: `localhost` (usually default).
    -   **CRITICAL**: Add your production domain: `vitality.hamitcf.info`.
    -   Add your Cloudflare Pages preview domain (e.g., `aether-vitality.pages.dev`) if you want to test there.

---

## 2.1 Firestore Indexes

The application requires certain composite indexes to function correctly, particularly for private messaging and user search.

1.  Go to **Build > Firestore Database** in the sidebar.
2.  Click the **Indexes** tab.
3.  Add the following composite indexes:

| Collection    | Fields                                      | Query Scope |
| :------------ | :------------------------------------------ | :---------- |
| `conversations` | `participants` (Array), `lastTimestamp` (Desc) | Collection  |
| `messages`      | `convId` (Asc), `timestamp` (Asc)           | Collection  |
| `users`         | `name` (Asc)                                | Collection  |

*Note: Firebase may provide a direct link to create missing indexes in the browser console logs if they are not yet created.*

---

## 3. Gemini API Keys

To avoid hitting rate limits, this app uses a pool of 8 API keys.

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **Create API Key**.
3.  Create **8 separate keys** (or fewer, but 8 is recommended for heavy use).
4.  Paste them into your `.env` file:

```env
VITE_GEMINI_API_KEY_1=AIzaSy...
VITE_GEMINI_API_KEY_2=AIzaSy...
...
VITE_GEMINI_API_KEY_8=AIzaSy...
```

*Note: These keys are for local development. You will also need to add them to Cloudflare (Section 5).*

---

## 4. Push to GitHub

Create a new repository on GitHub named `aether-vitality`.

```bash
# Initialize git if not already done
git init

# Add files
git add .

# Commit
git commit -m "Initial commit"

# Link to GitHub (replace USERNAME with your actual username)
git remote add origin https://github.com/USERNAME/aether-vitality.git

# Push
git push -u origin main
```

---

## 5. Cloudflare Pages Deployment

### Connect Repo
1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
3.  Select the `aether-vitality` repository.
4.  **Build Settings**:
    -   **Framework Preset**: `Vite` (or `None`, settings below work for both)
    -   **Build command**: `npm run build`
    -   **Build output directory**: `dist`
    -   **Root directory**: `/` (leave empty)

### Environment Variables
Before clicking "Save and Deploy", add your environment variables.

1.  Click **Environment variables (advanced)**.
2.  Add `NODE_VERSION` with value `20`.
3.  Add all 8 Gemini Keys:
    -   `VITE_GEMINI_API_KEY_1` = `your_key_1`
    -   `VITE_GEMINI_API_KEY_2` = `your_key_2`
    -   ...and so on...

*Note: `VITE_` variables are baked into the build at compile time.*

Click **Save and Deploy**. Cloudflare will clone, install, and build your site.

---

## 6. Custom Domain Setup

Once the deployment is successful:

1.  Go to your Pages project dashboard.
2.  Click the **Custom domains** tab.
3.  Click **Set up a custom domain**.
4.  Enter `vitality.hamitcf.info`.
5.  Click **Continue**.
6.  Since your DNS is managed by Cloudflare, it should automatically prompt to create the DNS record (CNAME).
7.  Click **Activate domain**.
8.  Wait for SSL certificate activation.

---

## Summary of URLs

-   **Local**: `http://localhost:5173`
-   **Production**: `https://vitality.hamitcf.info`
-   **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com/)
-   **Cloudflare Dashboard**: [dash.cloudflare.com](https://dash.cloudflare.com/)

**Enjoy your Aether Vitality app!**
