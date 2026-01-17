/**
 * Knowledge Base Module
 * Contains seed data for the RAG system
 * This data will be loaded into the vector store on startup
 */

import { initialize, addDocuments, getStats } from "./vectorStore.js";

/**
 * Knowledge base documents organized by category
 */
const KNOWLEDGE_BASE_DOCUMENTS = [
  // ==================== REFUND POLICIES ====================
  {
    id: "refund-policy-overview",
    text: `Refund Policy Overview:
- Full refunds (100%) are available within 30 days of purchase for any reason.
- Partial refunds (50%) are available between 30-60 days of purchase.
- No refunds are available after 60 days, but store credit may be offered as a goodwill gesture.
- Refunds are processed back to the original payment method.
- Processing time is typically 5-7 business days after approval.`,
    metadata: {
      category: "refund",
      title: "Refund Policy Overview",
      priority: "high",
    },
  },
  {
    id: "refund-digital-products",
    text: `Digital Product Refund Policy:
- Digital products (downloads, software licenses, e-books) are only refundable if the product is defective or doesn't work as advertised.
- You must report issues within 14 days of purchase.
- We may ask for screenshots or error logs to verify the issue.
- If the product works as intended, no refund will be issued.
- Alternative: We can offer a replacement or equivalent product instead of a refund.`,
    metadata: {
      category: "refund",
      title: "Digital Product Refunds",
      priority: "high",
    },
  },
  {
    id: "refund-process-steps",
    text: `How to Request a Refund:
1. Submit a support ticket with your order ID and reason for refund.
2. Our team will review your request within 24-48 hours.
3. If approved, the refund will be initiated immediately.
4. You'll receive an email confirmation with refund details.
5. Funds will appear in your account within 5-7 business days.
6. Bank processing times may vary - contact your bank if delayed beyond 10 days.`,
    metadata: {
      category: "refund",
      title: "Refund Process Steps",
      priority: "medium",
    },
  },
  {
    id: "refund-exceptions",
    text: `Refund Exceptions and Special Cases:
- Sale items: Refunds at sale price only, not original price.
- Bundles: Partial refunds not available for bundle products.
- Subscription services: Pro-rated refunds available for annual plans cancelled mid-term.
- Gift purchases: Refunds issued to the purchaser, not the gift recipient.
- Promotional credits: Cannot be refunded for cash.
- Chargebacks: If you initiate a chargeback, your account may be suspended.`,
    metadata: {
      category: "refund",
      title: "Refund Exceptions",
      priority: "medium",
    },
  },

  // ==================== TECHNICAL SUPPORT ====================
  {
    id: "tech-login-issues",
    text: `Troubleshooting Login Issues:
1. Clear your browser cache and cookies, then try again.
2. Make sure you're using the correct email address (check for typos).
3. Use the "Forgot Password" link to reset your password.
4. Disable browser extensions that might interfere (ad blockers, VPNs).
5. Try a different browser or incognito/private mode.
6. Check if your account email is verified (look for verification email in spam).
7. If locked out, wait 30 minutes before trying again (security lockout).`,
    metadata: {
      category: "technical",
      title: "Login Troubleshooting",
      priority: "high",
    },
  },
  {
    id: "tech-payment-failures",
    text: `Payment Processing Issues:
- Card declined: Verify card details, expiration date, and available balance.
- 3D Secure failed: Complete the bank verification step in the popup.
- PayPal issues: Ensure your PayPal account is verified and has funds.
- Duplicate charges: We only charge once - duplicates are pending authorizations that will clear.
- Invoice not received: Check spam folder, or request resend from account settings.
- Currency issues: All prices are in USD unless otherwise specified.`,
    metadata: {
      category: "technical",
      title: "Payment Issues",
      priority: "high",
    },
  },
  {
    id: "tech-file-upload",
    text: `File Upload Troubleshooting:
- Supported formats: JPG, PNG, GIF, WebP (images), PDF, DOC, DOCX, TXT (documents).
- Maximum file size: 10MB per file, 5 files maximum per upload.
- Upload failed: Try a smaller file or different format.
- Slow upload: Check your internet connection speed.
- File not showing: Refresh the page after upload completes.
- Corrupted file: Re-download or re-scan the original file.`,
    metadata: {
      category: "technical",
      title: "File Upload Help",
      priority: "medium",
    },
  },
  {
    id: "tech-browser-compatibility",
    text: `Browser and Device Compatibility:
- Supported browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+.
- Mobile: iOS Safari, Chrome for Android fully supported.
- Internet Explorer: NOT supported - please upgrade to Edge.
- JavaScript must be enabled for full functionality.
- Cookies must be enabled for login to work.
- Recommended: Keep your browser updated to the latest version.`,
    metadata: {
      category: "technical",
      title: "Browser Compatibility",
      priority: "low",
    },
  },

  // ==================== GENERAL FAQ ====================
  {
    id: "faq-account-creation",
    text: `Creating and Managing Your Account:
- Sign up with email and password - verification email will be sent.
- You can update profile info in Account Settings.
- To change email: Settings > Account > Change Email (re-verification required).
- To delete account: Settings > Account > Delete Account (this is permanent).
- Account data can be exported before deletion.
- One account per email address only.`,
    metadata: {
      category: "general",
      title: "Account Management",
      priority: "medium",
    },
  },
  {
    id: "faq-response-times",
    text: `Support Response Times and SLAs:
- First response: Within 24 hours (usually much faster).
- Business hours: Monday-Friday, 9 AM - 6 PM EST.
- Weekend support: Limited availability, expect delays.
- Urgent issues: Mark ticket as "Urgent" for priority handling.
- Escalation: Request escalation if not resolved within 48 hours.
- Holiday periods: Response times may be extended.`,
    metadata: {
      category: "general",
      title: "Response Times",
      priority: "medium",
    },
  },
  {
    id: "faq-contact-methods",
    text: `How to Contact Support:
- Support tickets: Best for detailed issues, tracked and documented.
- Email: support@supporthub.com (creates a ticket automatically).
- Live chat: Available during business hours for quick questions.
- Phone: Not available - all support is handled via tickets.
- Social media: We don't provide support via social media.
- Knowledge base: Check our help articles first for instant answers.`,
    metadata: {
      category: "general",
      title: "Contact Methods",
      priority: "high",
    },
  },
  {
    id: "faq-ticket-status",
    text: `Understanding Ticket Status:
- Open: Your ticket is waiting for agent response.
- In Progress: An agent is actively working on your issue.
- Waiting on Customer: We need more information from you.
- Resolved: Issue has been addressed (you can reopen if needed).
- Closed: Ticket has been closed after resolution.
- Merged: Your ticket was combined with an existing related ticket.`,
    metadata: {
      category: "general",
      title: "Ticket Status Guide",
      priority: "medium",
    },
  },

  // ==================== PRODUCT/SERVICE INFO ====================
  {
    id: "product-subscription-plans",
    text: `Subscription Plans and Pricing:
- Free tier: Basic access, limited features, community support only.
- Pro plan ($9.99/month): Full features, priority support, no ads.
- Business plan ($29.99/month): Team features, API access, dedicated support.
- Enterprise: Custom pricing, SLA guarantees, account manager.
- Annual billing: 20% discount on all paid plans.
- All plans include 14-day free trial (no credit card required).`,
    metadata: {
      category: "general",
      title: "Subscription Plans",
      priority: "high",
    },
  },
  {
    id: "product-features",
    text: `Key Product Features:
- Multi-channel support ticket management.
- AI-powered ticket classification and routing.
- Automated responses for common queries.
- Real-time collaboration for support teams.
- Analytics and reporting dashboard.
- Integration with popular tools (Slack, Jira, etc.).
- Custom workflow automation.
- Knowledge base and self-service portal.`,
    metadata: {
      category: "general",
      title: "Product Features",
      priority: "medium",
    },
  },
];

/**
 * Initialize the knowledge base
 * Called on server startup
 */
export async function initializeKnowledgeBase() {
  console.log("📚 Initializing knowledge base...");

  try {
    // Initialize vector store
    await initialize();

    // Add all documents
    await addDocuments(KNOWLEDGE_BASE_DOCUMENTS);

    // Get stats
    const stats = await getStats();
    console.log(`✅ Knowledge base ready with ${stats.count} documents`);

    return true;
  } catch (error) {
    console.error("❌ Knowledge base initialization failed:", error.message);
    throw error;
  }
}

/**
 * Get all knowledge base documents (for admin purposes)
 */
export function getKnowledgeBaseDocuments() {
  return KNOWLEDGE_BASE_DOCUMENTS;
}

export default {
  initializeKnowledgeBase,
  getKnowledgeBaseDocuments,
  KNOWLEDGE_BASE_DOCUMENTS,
};
