process.env.ZOHO_CLIENT_ID = "mock_client_id";
process.env.ZOHO_CLIENT_SECRET = "mock_client_secret";
process.env.ZOHO_REFRESH_TOKEN = "mock_refresh_token";
process.env.ZOHO_ORGANIZATION_ID = "mock_org_id";
process.env.ZOHO_API_URL = "https://www.zohoapis.com";

import {
  getOrCreateZohoInvoiceContact,
  createZohoInvoice,
  recordZohoInvoicePayment,
} from "@/lib/zoho";

describe("Zoho Dedicated Invoice Helper API", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe("getOrCreateZohoInvoiceContact", () => {
    it("should return contact_id if contact already exists", async () => {
      // Mock getZohoAccessToken
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "mock_access_token" }),
        }) // token refresh
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            contacts: [{ contact_id: "existing_contact_id_123" }],
          }),
        }); // search contact

      const contactId = await getOrCreateZohoInvoiceContact(
        "test@example.com",
        "Test User"
      );
      expect(contactId).toBe("existing_contact_id_123");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it("should create new contact and return contact_id if search returns empty", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "mock_access_token" }),
        }) // token refresh
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ contacts: [] }),
        }) // search contact empty
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            contact: { contact_id: "new_contact_id_789" },
          }),
        }); // create contact

      const contactId = await getOrCreateZohoInvoiceContact(
        "new@example.com",
        "New User"
      );
      expect(contactId).toBe("new_contact_id_789");
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe("createZohoInvoice", () => {
    it("should create invoice as draft and mark it as sent", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "mock_access_token" }),
        }) // token refresh
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            invoice: {
              invoice_id: "zoho_inv_id_456",
              invoice_number: "INV-2026-0001",
              client_view_url: "https://invoice.zoho.com/public/pdf",
            },
          }),
        }) // create invoice
        .mockResolvedValueOnce({
          ok: true,
          text: async () => "status_updated",
        }); // mark sent

      const result = await createZohoInvoice(
        "contact_id_123",
        "Test Product Course",
        450.0,
        99
      );

      expect(result.invoice_id).toBe("zoho_inv_id_456");
      expect(result.invoice_number).toBe("INV-2026-0001");
      expect(result.client_view_url).toBe("https://invoice.zoho.com/public/pdf");
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe("recordZohoInvoicePayment", () => {
    it("should record payment with correct reference", async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: "mock_access_token" }),
        }) // token refresh
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            payment: {
              payment_id: "payment_id_999",
            },
          }),
        }); // record payment

      const result = await recordZohoInvoicePayment(
        "contact_id_123",
        "zoho_inv_id_456",
        450.0,
        "paystack_ref_123"
      );

      expect(result.payment.payment_id).toBe("payment_id_999");
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
