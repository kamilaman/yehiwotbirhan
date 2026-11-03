/**
 * Central API Router Aggregator
 */

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const donationController = require('../controllers/donationController');
const campaignController = require('../controllers/campaignController');
const postController = require('../controllers/postController');
const contactController = require('../controllers/contactController');
const eventController = require('../controllers/eventController');
const { requireAdminAuth } = require('../middleware/authMiddleware');

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================
router.get('/campaign', campaignController.getCampaign);
router.post('/donations', donationController.createDonation);
router.get('/donations/status/:identifier', donationController.getDonationStatus);
router.post('/donations/chapa/initialize', donationController.initializeChapaDonation);
router.post('/donations/chapa/callback', donationController.chapaCallback);
router.post('/donations/chapa/webhook', donationController.chapaWebhook);
router.post('/webhooks/chapa', donationController.chapaWebhook);
router.get('/donations/chapa/verify/:tx_ref', donationController.verifyChapaDonation);
router.get('/payments/chapa/callback', (req, res) => {
  const txRef = req.query.tx_ref;
  if (!txRef) return res.status(400).send('Missing tx_ref in callback');
  req.params.tx_ref = txRef;
  return donationController.verifyChapaDonation(req, res);
});
router.post('/donations/stripe/initialize', donationController.initializeStripeDonation);
router.get('/donations/stripe/verify/:session_id', donationController.verifyStripeDonation);
router.post('/donations/stripe/webhook', donationController.stripeWebhook);
router.post('/contact', contactController.createContactMessage);
router.post('/newsletter', contactController.subscribeNewsletter);
router.post('/events/register', eventController.registerEventParticipant);
router.get('/posts', postController.getPosts);

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================
router.post('/admin/login', adminController.login);
router.get('/admin/me', requireAdminAuth, adminController.getMe);
router.post('/admin/change-password', requireAdminAuth, adminController.changePassword);

// ============================================================================
// ADMIN DASHBOARD & DIAGNOSTICS
// ============================================================================
router.get('/admin/stats', requireAdminAuth, adminController.getStats);
router.get('/admin/system/health', requireAdminAuth, adminController.getSystemHealth);
router.get('/admin/system/backup', requireAdminAuth, adminController.getDatabaseBackup);

// ============================================================================
// ADMIN FINANCIAL AUDIT & DONATIONS
// ============================================================================
router.get('/admin/donations', requireAdminAuth, donationController.getDonations);
router.post('/admin/donations/manual', requireAdminAuth, donationController.createManualDonation);
router.post('/admin/donations/:id/verify-provider', requireAdminAuth, donationController.adminVerifyDonation);
router.post('/admin/donations/:id/refund', requireAdminAuth, donationController.adminRefundDonation);
router.put('/admin/donations/:id', requireAdminAuth, donationController.updateDonation);
router.delete('/admin/donations/:id', requireAdminAuth, donationController.deleteDonation);

// ============================================================================
// ADMIN BUILDING CAMPAIGN
// ============================================================================
router.put('/admin/campaign', requireAdminAuth, campaignController.updateCampaign);

// ============================================================================
// ADMIN PASTOR POSTS & MEDIA
// ============================================================================
router.get('/admin/posts', requireAdminAuth, postController.getPosts);
router.post('/admin/posts', requireAdminAuth, postController.createPost);
router.put('/admin/posts/:id', requireAdminAuth, postController.updatePost);
router.delete('/admin/posts/:id', requireAdminAuth, postController.deletePost);
router.post('/admin/upload', requireAdminAuth, postController.uploadImage);

// ============================================================================
// ADMIN MESSAGES & PRAYER REQUESTS
// ============================================================================
router.get('/admin/messages', requireAdminAuth, contactController.getContactMessages);
router.put('/admin/messages/:id', requireAdminAuth, contactController.updateContactMessage);
router.delete('/admin/messages/:id', requireAdminAuth, contactController.deleteContactMessage);

// ============================================================================
// ADMIN EVENT REGISTRATIONS
// ============================================================================
router.get('/admin/events', requireAdminAuth, eventController.getEventRegistrations);
router.post('/admin/events', requireAdminAuth, eventController.registerEventParticipant);
router.delete('/admin/events/:id', requireAdminAuth, eventController.deleteEventRegistration);

module.exports = router;
