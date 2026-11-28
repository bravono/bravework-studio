import { POST as changePasswordPOST } from "@/app/api/user/change-password/route";
import { getServerSession } from "next-auth/next";
import { queryDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";

jest.mock("next-auth/next");
jest.mock("@/lib/db");
jest.mock("bcryptjs");

describe("Change Password API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if user is not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);

    const req = new Request("http://localhost/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      }),
    });

    const res = await changePasswordPOST(req);
    expect(res.status).toBe(401);
  });

  it("should return 400 if required fields are missing", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 1 },
    });

    const req = new Request("http://localhost/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: "oldpassword123",
        newPassword: "",
        confirmPassword: "",
      }),
    });

    const res = await changePasswordPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("All password fields are required");
  });

  it("should return 400 if new password is less than 8 characters", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 1 },
    });

    const req = new Request("http://localhost/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: "oldpassword123",
        newPassword: "short",
        confirmPassword: "short",
      }),
    });

    const res = await changePasswordPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("New password must be at least 8 characters long");
  });

  it("should return 400 if new passwords do not match", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 1 },
    });

    const req = new Request("http://localhost/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: "oldpassword123",
        newPassword: "newpassword123",
        confirmPassword: "differentpassword",
      }),
    });

    const res = await changePasswordPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("New passwords do not match");
  });

  it("should return 400 if current password verification fails", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 1 },
    });
    (queryDatabase as jest.Mock).mockResolvedValue([
      { user_id: 1, password: "hashedOldPassword" },
    ]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const req = new Request("http://localhost/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: "wrongpassword",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      }),
    });

    const res = await changePasswordPOST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Current password is incorrect");
  });

  it("should return 200 and update password when valid", async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 1 },
    });
    (queryDatabase as jest.Mock).mockResolvedValue([
      { user_id: 1, password: "hashedOldPassword" },
    ]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword");

    const req = new Request("http://localhost/api/user/change-password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: "correctpassword",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      }),
    });

    const res = await changePasswordPOST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Password updated successfully");
    expect(queryDatabase).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE users SET password = $1"),
      expect.arrayContaining(["newHashedPassword", 1]),
    );
  });
});
