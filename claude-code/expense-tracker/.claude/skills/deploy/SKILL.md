# Deploy Skill

## Steps

### 1. Run tests (lint)

Run ESLint to catch any errors before deploying.

!npm run lint

If lint fails, stop and report the errors. Do not proceed to the next step.

### 2. Build production bundle

Compile and bundle the app for production.

!npm run build

If the build fails, stop and report the errors. Do not proceed to the next step.

### 3. Push to staging

Copy the production build to the staging area.

!cp -r dist/ /tmp/staging/expense-tracker/

After each step completes successfully, confirm it to the user. When all three steps pass, report that the deployment to staging is complete.
