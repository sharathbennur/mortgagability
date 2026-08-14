# Deployment & CI/CD Guide: Firebase Hosting + GitHub Actions + Porkbun

This document provides a comprehensive, step-by-step guide to setting up automated build, test, and deployment pipelines for the **Mortgagability** web application (`mortgage-ability`) to **Firebase Hosting**, mapped to the custom domain **`www.mortgage-ability.com`** managed via **Porkbun.com**.

---

## Quick Reference & Project Parameters

- **Firebase Project ID:** `mortgage-ability`
- **Primary Domain:** `www.mortgage-ability.com`
- **Apex / Root Domain:** `mortgage-ability.com`
- **DNS Registrar:** Porkbun.com
- **Build Tool:** Vite (`npm run build` → output: `dist/`)
- **Test Runner:** Vitest (`npm run test` / `vitest run`)
- **CI/CD Platform:** GitHub Actions

---

## Table of Contents

1. [Prerequisites & Initial Local Setup](#1-prerequisites--initial-local-setup)
2. [Firebase Project Setup & Configuration](#2-firebase-project-setup--configuration)
3. [GitHub Actions CI/CD Configuration](#3-github-actions-cicd-configuration)
4. [Automating Testing in the CI/CD Pipeline](#4-automating-testing-in-the-cicd-pipeline)
5. [Domain Service Provider Configuration (Porkbun.com)](#5-domain-service-provider-configuration-porkbuncom)
6. [Security & Cybersecurity Hardening Checklist](#6-security--cybersecurity-hardening-checklist)
7. [Deployment Verification & Troubleshooting](#7-deployment-verification--troubleshooting)

---

## 1. Prerequisites & Initial Local Setup

Before configuring automated deployment, ensure you have:

- Access to the **Firebase Console** with permission to create projects.
- Access to your **Porkbun.com** account managing `mortgage-ability.com`.
- Administrative / Secret-management access to the **GitHub repository**.
- Node.js `v18+` and `npm` installed locally.
- Firebase CLI installed globally:
  ```bash
  npm install -g firebase-tools
  ```

---

## 2. Firebase Project Setup & Configuration

### Step 2.1: Create the Firebase Project

1. Log into the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project**.
3. Set the Project Name to **`mortgage-ability`** (Project ID: `mortgage-ability`).
4. (Optional) Disable Google Analytics unless required.
5. Click **Create Project**.

### Step 2.2: Enable Firebase Hosting

1. In the Firebase Console left navigation sidebar, go to **Build** → **Hosting**.
2. Click **Get Started** and complete the initial setup wizard.

### Step 2.3: Configure Local Repository Files

Create or verify the following configuration files in the root of your repository (`/home/sharath/code/mortgagability`).

#### 1. `.firebaserc`
Tells Firebase CLI which project to target by default:

```json
{
  "projects": {
    "default": "mortgage-ability"
  }
}
```

#### 2. `firebase.json`
Defines build output target (`dist`), SPA routing rules, and security headers:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains; preload"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "camera=(), microphone=(), geolocation=(), payment=()"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self';"
          }
        ]
      }
    ]
  }
}
```

### Step 2.4: Generate Service Account Key for GitHub Actions

To allow GitHub Actions to deploy to Firebase without manual login credentials, create a Service Account:

#### Method A: Automated setup via Firebase CLI (Recommended)
From your terminal in the repository root:
```bash
firebase login
firebase init hosting:github
```
- Authenticate with GitHub when prompted.
- Select your repository: `username/mortgagability`.
- Set up build script before deployment: `npm ci && npm run test && npm run build`.
- Set up automatic deploy on PR: `Yes`.
- Set up automatic deploy on merge to main: `Yes`.

#### Method B: Manual GCP Service Account Setup
1. Go to [Google Cloud Console - Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) for project `mortgage-ability`.
2. Click **Create Service Account**.
3. Name: `github-actions-deployer`.
4. Grant Role: **Firebase Hosting Admin** (`roles/firebasehosting.admin`).
5. Click **Create Key** → choose **JSON** format → Download key file.
6. Open the downloaded JSON file and copy its contents.

---

## 3. GitHub Actions CI/CD Configuration

### Step 3.1: Add GitHub Repository Secrets

1. Open your GitHub Repository in a web browser.
2. Go to **Settings** → **Secrets and variables** → **Actions**.
3. Click **New repository secret**.
4. Set **Name**: `FIREBASE_SERVICE_ACCOUNT_MORTGAGE_ABILITY`
5. Set **Value**: Paste the entire JSON object from the Service Account Key file generated in Step 2.4.
6. Click **Add secret**.

---

### Step 3.2: Production Deployment Workflow (`.github/workflows/deploy.yml`)

Create file `.github/workflows/deploy.yml`:

```yaml
name: Production CI/CD Pipeline

on:
  push:
    branches:
      - main

concurrency:
  group: production-deploy
  cancel-in-progress: true

jobs:
  test-and-deploy:
    name: Build, Test & Deploy to Firebase
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Security Vulnerability Audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Run Automated Vitest Test Suite
        run: npm run test

      - name: Build Production Assets
        run: npm run build

      - name: Deploy to Firebase Hosting (Live)
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_MORTGAGE_ABILITY }}'
          channelId: live
          projectId: mortgage-ability
```

---

### Step 3.3: Pull Request Preview Workflow (`.github/workflows/pr-preview.yml`)

Create file `.github/workflows/pr-preview.yml`:

```yaml
name: Pull Request Preview Pipeline

on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches:
      - main

permissions:
  checks: write
  contents: read
  pull-requests: write

jobs:
  pr-preview:
    name: Run Tests & Deploy PR Preview
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Run Unit Tests
        run: npm run test

      - name: Build Application
        run: npm run build

      - name: Deploy Temporary Preview Channel
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_MORTGAGE_ABILITY }}'
          channelId: 'pr-${{ github.event.number }}'
          projectId: mortgage-ability
          expires: 7d
```

---

## 4. Automating Testing in the CI/CD Pipeline

Testing is a strict quality gate in the GitHub Actions deployment pipeline. If tests fail, the workflow aborts immediately, preventing broken code from reaching production.

### Step 4.1: Test Execution Flow
1. **`npm ci`**: Installs exact locked dependencies from `package-lock.json`.
2. **`npm run test`**: Runs Vitest in single-run CI mode (`vitest run` as specified in `package.json`).
3. **Environment**: JSDOM simulates DOM environment for DOM assertions (`app.test.js`).

### Step 4.2: Enhancing Automated Testing

To get full testing visibility, update `package.json` and workflow steps to generate test reports and coverage:

#### 1. Coverage Thresholds in `vitest.config.js`:
```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
  },
});
```

#### 2. Adding Test Steps to GitHub Actions:
```yaml
      - name: Execute Vitest Suite with Coverage
        run: npx vitest run --coverage

      - name: Upload Test Coverage Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-coverage-report
          path: coverage/
```

---

## 5. Domain Service Provider Configuration (Porkbun.com)

Connecting `www.mortgage-ability.com` registered at Porkbun to your Firebase Hosting project requires setting domain verification and DNS routing records.

### Step 5.1: Initiate Custom Domain Setup in Firebase

1. In **Firebase Console** → **Hosting**, click **Add Custom Domain**.
2. Enter domain: `www.mortgage-ability.com`.
3. Check **Redirect mortgage-ability.com to www.mortgage-ability.com** (optional, recommended for apex domain routing).
4. Firebase will display required **TXT** verification records and **A / CNAME** records.

---

### Step 5.2: Configure DNS Records in Porkbun.com

1. Log into your [Porkbun Account](https://porkbun.com/account/domains).
2. Go to **Domain Management** → locate `mortgage-ability.com`.
3. Click **Details** → **DNS Records** (Edit).

#### Record 1: Firebase Domain Ownership Verification (TXT Record)
- **Type:** `TXT`
- **Host / Name:** `@` (or `_acme-challenge` / specified host if instructed by Firebase)
- **Answer / Value:** `firebase=mortgage-ability` (Paste exact verification code provided by Firebase)
- **TTL:** `300`

#### Record 2: Subdomain Routing (`www.mortgage-ability.com`)
- **Type:** `CNAME`
- **Host / Name:** `www`
- **Answer / Value:** `mortgage-ability.web.app` (or target hostname supplied by Firebase)
- **TTL:** `300`

#### Record 3: Root Domain Routing (`mortgage-ability.com` Apex Domain)
Add two **A Records** pointing to Firebase Hosting IP addresses:
- **Record 3A:**
  - **Type:** `A`
  - **Host / Name:** `@` (leave blank or use `@`)
  - **Answer / Value:** `199.36.158.100` *(Verify exact IP in Firebase Console)*
  - **TTL:** `300`
- **Record 3B:**
  - **Type:** `A`
  - **Host / Name:** `@`
  - **Answer / Value:** `199.36.158.100` *(Second Firebase IP provided in console)*
  - **TTL:** `300`

*Alternatively, use Porkbun's **ALIAS** record or **URL Forwarding** rule to redirect `mortgage-ability.com` to `https://www.mortgage-ability.com`.*

---

### Step 5.3: SSL / TLS Certificate Provisioning

- Firebase Hosting automatically provisions a free SSL/TLS certificate (Let's Encrypt / Google Trust Services) for `www.mortgage-ability.com`.
- Certificate issuance usually completes within **15 to 45 minutes** after DNS propagation, but can take up to 24 hours.
- You can monitor SSL status under Firebase Console → Hosting → Custom Domains.

---

## 6. Security & Cybersecurity Hardening Checklist

Before launching `www.mortgage-ability.com` publicly, review and apply the following hardening measures:

### 6.1 HTTP Security Headers (Configured in `firebase.json`)
- **Content Security Policy (CSP):** Restricts script, style, frame, and font execution origins to protect against XSS (Cross-Site Scripting).
- **HSTS (HTTP Strict Transport Security):** Forces browsers to load the app exclusively over HTTPS (`max-age=31536000`).
- **X-Frame-Options (`DENY`):** Prevents clickjacking by disabling embedding inside `<iframe>` tags on external sites.
- **X-Content-Type-Options (`nosniff`):** Prevents MIME-type sniffing attacks.
- **Referrer-Policy (`strict-origin-when-cross-origin`):** Limits sensitive URL referrer leakage.
- **Permissions-Policy:** Disables unused browser API access (camera, microphone, geolocation, payment).

---

### 6.2 Supply Chain & Dependency Hardening
- **Local Asset Bundling (Recommended over CDNs):**
  Currently `index.html` loads external dependencies from public CDNs (`cdnjs`, `jsdelivr`, `google fonts`). To protect against CDN compromise:
  - Install dependencies locally via npm:
    ```bash
    npm install chart.js @fortawesome/fontawesome-free
    ```
  - Import them into `app.js` / `style.css` so Vite bundles and hashes them into static production assets.
- **Subresource Integrity (SRI):** If external CDNs must be used, attach `integrity="sha384-..."` and `crossorigin="anonymous"` attributes to all `<script>` and `<link>` tags in `index.html`.
- **Dependency Auditing:** Maintain `npm audit --audit-level=high` in CI pipeline or use Dependabot / Snyk to block vulnerabilities.

---

### 6.3 Domain & DNS Security (Porkbun Settings)
- **Enable DNSSEC (Domain Name System Security Extensions):**
  In Porkbun → Domain Details → **DNSSEC** → Click **Enable**. Protects against DNS spoofing/cache poisoning.
- **Enable Domain Registrar Lock:**
  In Porkbun → Domain Details → **Domain Lock** → Toggle **ON**. Prevents unauthorized domain transfers.
- **Enable WHOIS Privacy Protection:**
  Porkbun includes WHOIS privacy for free. Verify registrant details are masked.
- **Configure CAA Records (Certificate Authority Authorization):**
  Add CAA records to restrict certificate issuance for `mortgage-ability.com` strictly to authorized CAs:
  - Type: `CAA`, Host: `@`, Value: `0 issue "letsencrypt.org"`
  - Type: `CAA`, Host: `@`, Value: `0 issue "pki.goog"`

---

### 6.4 GCP / Firebase IAM & Secret Hardening
- **Principle of Least Privilege:**
  Ensure the GitHub Actions Service Account only has the **Firebase Hosting Admin** role (`roles/firebasehosting.admin`), NOT Project Editor or Owner.
- **Never Commit Secrets to Git:**
  Ensure Service Account keys, API keys, or private environment variables are stored strictly in **GitHub Repository Secrets**. Ensure `.gitignore` includes:
  ```
  .env*
  *-key.json
  service-account*.json
  .firebase/
  dist/
  ```

---

## 7. Deployment Verification & Troubleshooting

### Step 7.1: Manual Test Deployment
Test deployment locally using Firebase CLI before pushing to GitHub:
```bash
npm run build
firebase deploy --only hosting
```

### Step 7.2: Post-Deployment Verification Checklist

1. **Production URL Check:** Visit `https://www.mortgage-ability.com` in an incognito browser.
2. **SSL Certificate Check:** Verify padlock icon and certificate issuer.
3. **Security Headers Verification:** Run security header evaluation on [securityheaders.com](https://securityheaders.com/?q=www.mortgage-ability.com). Target Grade: **A / A+**.
4. **Console Errors:** Open Browser Developer Console (F12) to verify no CSP errors or failed asset network requests.
5. **CI/CD Pipeline Status:** Verify GitHub Actions tab shows green checkmark for `main` branch push.

---

### Step 7.3: Common Deployment Issues & Fixes

| Problem | Cause | Resolution |
| :--- | :--- | :--- |
| **404 Not Found on Page Refresh** | SPA rewrite rule missing | Ensure `firebase.json` has `"rewrites": [{"source": "**", "destination": "/index.html"}]`. |
| **Firebase Deploy Failed in GitHub Actions** | Expired or incorrect Service Account secret | Re-generate JSON key in GCP Console and update `FIREBASE_SERVICE_ACCOUNT_MORTGAGE_ABILITY` in GitHub Secrets. |
| **DNS Not Resolving on Porkbun** | Incorrect CNAME/A record configuration or propagation delay | Check DNS status on `dnschecker.org` for `www.mortgage-ability.com`. DNS propagation can take up to 24h. |
| **SSL Certificate Pending** | Verification TXT record missing or incorrect DNS | Verify TXT record in Porkbun match Firebase Console instructions. |
| **CSP Blocking Chart.js or FontAwesome** | Restricted Content-Security-Policy header | Adjust `Content-Security-Policy` in `firebase.json` to allow `https://cdn.jsdelivr.net` and `https://cdnjs.cloudflare.com`. |
