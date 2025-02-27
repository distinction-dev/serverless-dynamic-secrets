# Serverless Dynamic Secrets Plugin

🚀 **Automate Parameter & Secret Management in Serverless Framework**

## 📌 Why We Introduced This Plugin
Managing secrets and parameters in AWS while working with the Serverless Framework can be tedious and error-prone. Developers often need to:
- Manually define parameters and secrets in `serverless.yml`.
- Ensure sensitive information isn't exposed.
- Handle dynamic secrets without hardcoding values.
- Simplify overrides and updates without modifying multiple files.

To solve these problems, we built **Serverless Dynamic Secrets Plugin**, which automates secret and parameter creation, ensuring secure, efficient, and scalable deployments.

---

## 📌 Overview

**Serverless Dynamic Secrets Plugin** is a **custom Serverless Framework plugin** that:
- **Automatically creates CloudFormation parameters** from a JSON file.
- **Generates AWS Secrets Manager resources dynamically** using parameter values.
- **Supports parameter overrides** via CLI and files.
- **Prevents secret exposure** by setting `NoEcho: true`.
- **Supports encryption using AWS KMS** (future roadmap feature).
- **Allows secret fetching from AWS S3** (future roadmap feature).

This eliminates the **manual effort of defining parameters and secrets** in your `serverless.yml` and ensures better security practices.

---

## 🛠 Installation

### Using npm
```bash
npm install --save-dev @distinction-dev/serverless-dynamic-secrets
```

### Using yarn
```bash
yarn add -D @distinction-dev/serverless-dynamic-secrets
```

---

## 🚀 How to Use

### 1️⃣ Define Your Secrets and Parameters
Create a `params.json` file with the structure:
```json
{
  "DB_PASSWORD": "supersecurepassword",
  "API_KEY": "your-api-key"
}
```

### 2️⃣ Add the Plugin to `serverless.yml`
```yaml
plugins:
  - '@distinction-dev/serverless-dynamic-secrets'
```

### 3️⃣ Deploy with Secrets Management
```bash
npx serverless deploy --parameter-file params.json
```

---

## 🌟 Features (Roadmap)
✅ **Automatic CloudFormation Parameter & Secrets Manager Resource Creation** (Completed)
🛠 **Custom Config for File Name** (Planned)
🛠 **Secret Metadata Support** (Planned)
🛠 **Override Existing Secrets** (Planned)
🛠 **Conflict Handling with Prefixes** (Planned)
🛠 **KMS Encryption Support** (Planned)
🛠 **S3-Based Secret Management** (Planned)
🛠 **Cross-Account Secret Access** (Planned)
🛠 **SSM Parameter Store Support** (Planned)
🛠 **Generalization for Masked/Unmasked Values** (Planned)

---

## 🎯 Why Use This Plugin?
✔ **Saves Time** – No more manually defining parameters and secrets.
✔ **Secure by Default** – Prevents secret exposure using `NoEcho: true`.
✔ **Flexible & Scalable** – Works with any Serverless project.
✔ **Easy to Use** – Just add a JSON file and deploy!

---

## 💬 Need Help?
Have questions or suggestions? Join our dev community or open an issue on GitHub! Let's make serverless development smarter together. 💪🔥
