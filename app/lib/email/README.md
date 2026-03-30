# Email Service Configuration

This email service supports multiple email providers: Resend, Nodemailer (SMTP),
and AWS SES, providing flexibility and vendor independence.

## Environment Variables Setup

### Required Configuration

```bash
# Email provider selection (options: resend, nodemailer, smtp, ses, none)
EMAIL_PROVIDER=smtp

# Sender email address (must be verified with your chosen provider)
EMAIL_FROM=sys@example.com
```

### Resend Configuration

```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_blablabla
```

### Nodemailer/SMTP Configuration

```bash
EMAIL_PROVIDER=nodemailer  # or 'smtp' (both work the same)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465              # Use 465 for SSL, 587 for TLS
SMTP_SECURE=true           # true for port 465 (SSL), false for port 587 (TLS), default to false
SMTP_USER=resend
SMTP_PASS=re_blablabla
```

#### Common SMTP Providers

**Gmail:**

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false          # true for port 465 (SSL), false for port 587 (TLS), default to false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**Outlook/Hotmail:**

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.live.com
SMTP_PORT=587
SMTP_SECURE=false          # true for port 465 (SSL), false for port 587 (TLS), default to false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

**Resend via SMTP:**

```bash
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
```

### AWS SES Configuration

```bash
EMAIL_PROVIDER=ses
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=your-access-key      # Optional: uses default credential chain if not provided
AWS_SES_SECRET_ACCESS_KEY=your-secret-key  # Optional: uses default credential chain if not provided
```

## Usage Examples

### Basic Usage

```tsx
import { emailService } from "~/lib/utils/email";

/** Send React Email component (commonly generated with react-email)
 * @see https://react.email/docs/introduction
 */
await emailService?.sendReactEmail({
  to: "user@example.com",
  subject: "Welcome!",
  react: <WelcomeEmail userName="John" />,
});

// Send HTML email
await emailService?.sendHtmlEmail({
  to: "user@example.com",
  subject: "HTML Email",
  html: "<h1>Hello World</h1>",
  text: "Hello World", // Optional fallback text
});

// Send plain text email
await emailService?.sendTextEmail({
  to: "user@example.com",
  subject: "Text Email",
  text: "Hello World",
});
```

### Advanced Usage

```typescript
import { EmailProviderType, EmailService } from "~/lib/utils/email";

// Create custom email service instance
const customEmailService = new EmailService({
  provider: EmailProviderType.NODEMAILER,
  config: {
    host: "smtp.custom.com",
    port: 587,
    secure: false,
    user: "custom@example.com",
    pass: "password",
  },
  defaultFrom: "noreply@example.com", // Customized from email should be validated by your provider
});

// Use custom service
await customEmailService.send({
  to: "user@example.com",
  subject: "Custom Email",
  html: "<p>Custom email content</p>",
});
```

### Multiple Recipients

```typescript
// Send to multiple recipients (they will see each other in the To field)
await emailService?.sendHtmlEmail({
  to: ["user1@example.com", "user2@example.com", "user3@example.com"],
  subject: "Bulk Notification",
  html: "<h1>Important Update</h1><p>This affects all users.</p>",
});

// Send individual emails using `for loop` (recommended for privacy)
const recipients = ["user1@example.com", "user2@example.com"];
for (const recipient of recipients) {
  await emailService?.sendHtmlEmail({
    to: recipient,
    subject: `Personal Update for ${recipient}`,
    html: `<h1>Hello ${recipient}</h1><p>This is your personal update.</p>`,
  });
}
```

## Error Handling

All email sending methods will throw errors on failure. Make sure to handle them
appropriately:

```typescript
try {
  await emailService.sendReactEmail({
    to: 'user@example.com',
    subject: 'Test',
    react: <TestEmail />,
  })
  console.log('Email sent successfully')
} catch (error) {
  console.error('Failed to send email:', error)
  // Handle error appropriately (log, retry, notify user, etc.)
}
```

## Provider-Specific Notes

### Resend

- **Pros**: Developer-friendly, built for React emails, great DX
- **Cons**: Requires domain verification, has rate limits on free tier
- **Best for**: Modern applications with React email templates
- **Setup**: Simple API key configuration

### Nodemailer (SMTP)

- **Pros**: Works with any SMTP provider, highly configurable, no vendor lock-in
- **Cons**: Requires SMTP server setup/credentials
- **Best for**: Existing SMTP infrastructure, maximum flexibility
- **Setup**: Requires SMTP credentials from your email provider

### AWS SES

- **Pros**: Highly scalable, cost-effective for high volume, reliable
- **Cons**: Requires AWS setup, more complex configuration
- **Best for**: High-volume applications, enterprise use cases
- **Setup**: Requires AWS account and SES configuration

## Security Best Practices

1. **Environment Variables**: Never commit email credentials to your repository
2. **App Passwords**: Use app-specific passwords for Gmail and other providers
3. **Domain Verification**: Verify your sending domain with your email provider
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **Input Validation**: Always validate email addresses and content

## Troubleshooting

### Common Issues

**Authentication Failed (SMTP):**

- Check username/password are correct
- For Gmail, use App Password instead of regular password
- Ensure 2FA is enabled for Gmail App Passwords

**Domain Not Verified (Resend/SES):**

- Verify your sending domain in the provider's dashboard
- Check DNS records are properly configured

**Rate Limits Exceeded:**

- Check your provider's rate limits
- Implement proper error handling and retry logic
- Consider upgrading your plan

**Connection Timeout:**

- Check SMTP host and port settings
- Verify firewall settings allow SMTP connections
- Try different SMTP ports (587, 465, 25)

## Testing

Run `npx tsx app/lib/utils/email/scripts/test.ts` to execute the following
script.

```typescript
import { emailService } from "~/lib/utils/email";

export async function testEmailConfiguration() {
  try {
    await emailService.sendTextEmail({
      to: "test@example.com",
      subject: "Email Configuration Test",
      text: "If you receive this email, your configuration is working correctly.",
    });
    console.log("✅ Email configuration test passed");
  } catch (error) {
    console.error("❌ Email configuration test failed:", error);
  }
}
```
