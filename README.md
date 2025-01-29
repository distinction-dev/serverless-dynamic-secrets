# Serverless Dynamic Secrets Plugin

🚀 **Automate Parameter & Secret Management in Serverless Framework**


## 📌 Overview

**Serverless Dynamic Secrets Plugin** is a **custom Serverless Framework plugin** that:
- **Automatically creates CloudFormation parameters** from a JSON file.
- **Generates AWS Secrets Manager resources dynamically** using parameter values.
- **Supports parameter overrides** via CLI and files.
- **Prevents secret exposure** by setting `NoEcho: true`.

This eliminates the **manual effort of defining parameters and secrets** in your `serverless.yml`!

---

## 🛠 Installation

### Using npm
```bash
npm install --save-dev serverless-dynamic-secrets
```

### Using yarn
```bash
yarn add -D serverless-dynamic-secrets
```