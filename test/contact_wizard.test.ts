import { POST as contactPOST } from "@/app/api/contact/route";
import prisma from "@/lib/prisma";
import { createZohoLead } from "@/lib/zoho";
import { sendEmail } from "@/lib/mailer";

// Mock prisma, zoho lead creation, and emailer
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    users: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    roles: {
      findUnique: jest.fn(),
    },
    user_roles: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    product_categories: {
      findFirst: jest.fn(),
    },
    orders: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    order_files: {
      create: jest.fn(),
    },
    order_order_files: {
      create: jest.fn(),
    },
    notifications: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    user_roles_relation: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/zoho", () => ({
  createZohoLead: jest.fn(),
}));

jest.mock("@/lib/mailer", () => ({
  sendEmail: jest.fn(),
}));

describe("Contact / Wizard Order API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should record a lead in Zoho and register guest user + order when placing order via wizard", async () => {
    // 1. Setup mocks
    // User does not exist (guest user scenario)
    (prisma.users.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.users.create as jest.Mock).mockResolvedValue({
      user_id: "user-guest-123",
      email: "guest@example.com",
    });
    
    // Role for guest
    (prisma.roles.findUnique as jest.Mock).mockResolvedValue({
      role_id: "role-guest-id",
      role_name: "guest",
    });
    (prisma.user_roles.create as jest.Mock).mockResolvedValue({});

    // Product Category
    (prisma.product_categories.findFirst as jest.Mock).mockResolvedValue({
      category_id: "cat-3d-id",
      category_name: "3D Animation",
    });

    // Check existing order (no duplicates)
    (prisma.orders.findFirst as jest.Mock).mockResolvedValue(null);

    // Create order
    (prisma.orders.create as jest.Mock).mockResolvedValue({
      order_id: "order-123",
    });

    // Mock order_files.create and order_order_files.create
    (prisma.order_files.create as jest.Mock).mockResolvedValue({
      order_file_id: "file-123",
    });
    (prisma.order_order_files.create as jest.Mock).mockResolvedValue({});
    (prisma.user_roles.findMany as jest.Mock).mockResolvedValue([]);

    // Mock Zoho Lead Create
    (createZohoLead as jest.Mock).mockResolvedValue({ success: true });

    // Mock Email
    (sendEmail as jest.Mock).mockResolvedValue({ success: true });

    // 2. Build Request
    const wizardData = {
      category: "3D Animation",
      scope: "Full video production",
      description: "A cool animation video for our product launcher",
      budgetCurrency: "USD",
      budgetAmount: "1000-2000",
      timeline: "Urgent",
      requirements: "Must have cool visual effects",
      fileUrl: "https://blob.url/myfile.zip",
      fileName: "myfile.zip",
    };

    const requestBody = {
      name: "Guest User",
      email: "guest@example.com",
      phone: "+2348000000000",
      subject: "Order For 3D Animation",
      message: "Please find my project requirements details attached.",
      wizardData,
      department: "Studio",
    };

    const req = new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // 3. Execute
    const res = await contactPOST(req);
    expect(res.status).toBe(200);

    // 4. Verify Zoho Lead is recorded with "Website Wizard" source
    expect(createZohoLead).toHaveBeenCalledTimes(1);
    expect(createZohoLead).toHaveBeenCalledWith(
      expect.objectContaining({
        Last_Name: "Guest User",
        Email: "guest@example.com",
        Phone: "+2348000000000",
        Lead_Source: "Website Wizard",
        Description: expect.stringContaining("Service: 3D Animation"),
      })
    );

    // 5. Verify guest user is registered
    expect(prisma.users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "guest@example.com",
          first_name: "Guest",
          last_name: "User",
          phone: "+2348000000000",
          is_verified: false,
        }),
      })
    );

    // 6. Verify role assignment
    expect(prisma.user_roles.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          user_id: "user-guest-123",
          role_id: "role-guest-id",
        },
      })
    );

    // 7. Verify order creation
    expect(prisma.orders.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user_id: "user-guest-123",
          title: "3D Animation",
          budget_range: "1000-2000",
        }),
      })
    );
  });
});
