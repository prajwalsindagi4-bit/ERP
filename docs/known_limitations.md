# Known Limitations

This document outlines the known limitations, incomplete features, and intentional omissions within the current ERP System codebase.

## 1. AWS S3 Image Upload
This feature is intentionally skipped as it requires setting up an external AWS account with IAM roles and bucket configurations. Product images currently rely on external URLs instead of direct file uploads.

## 2. Email Notifications
The system uses **Ethereal Email** (a mock developer SMTP server) to simulate sending emails (such as customer follow-up notifications). It does not use a real production provider like SendGrid or AWS SES yet. For production use, you will need to swap the Ethereal SMTP credentials in `server/src/utils/email.ts` with your provider's credentials.

## 3. Password Reset Flow
The password reset flow via email link has been intentionally omitted from the codebase. Access recovery and password management are restricted entirely to database administrators to maintain a tighter security perimeter.
