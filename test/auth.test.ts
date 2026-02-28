import { authorizeUser } from "@/lib/auth/auth-options";
import { queryDatabase } from "@/lib/db";
import bcrypt from "bcryptjs";
import { verify } from "otplib";

// Mock the dependencies
jest.mock("../lib/db", () => ({
  queryDatabase: jest.fn(),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
}));

jest.mock("otplib", () => ({
  verify: jest.fn(),
}));

describe("authorizeUser", () => {
  const mockCredentials = {
    email: "test@example.com",
    password: "password123",
  };

  const mockUser = {
    user_id: 1,
    email: "test@example.com",
    password: "hashedPassword",
    first_name: "Test",
    last_name: "User",
    email_verified: true,
    two_factor_enabled: true,
    two_factor_secret: "secret",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw 'MFA_REQUIRED' if two_factor_enabled is true but no mfaCode is provided", async () => {
    (queryDatabase as jest.Mock).mockResolvedValue([mockUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    await expect(authorizeUser(mockCredentials)).rejects.toThrow(
      "MFA_REQUIRED",
    );
  });

  it("should throw 'Invalid MFA code' if mfaCode is incorrect", async () => {
    (queryDatabase as jest.Mock).mockResolvedValue([mockUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (verify as jest.Mock).mockResolvedValue(false);

    const credentialsWithMfa = { ...mockCredentials, mfaCode: "123456" };
    await expect(authorizeUser(credentialsWithMfa)).rejects.toThrow(
      "Invalid MFA code",
    );
  });

  it("should return user if MFA is enabled and code is correct", async () => {
    (queryDatabase as jest.Mock).mockResolvedValue([mockUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (verify as jest.Mock).mockResolvedValue(true);

    const credentialsWithMfa = { ...mockCredentials, mfaCode: "123456" };
    const result = await authorizeUser(credentialsWithMfa);

    expect(result).toEqual({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      companyName: undefined,
      phone: undefined,
    });
  });

  it("should return user if MFA is NOT enabled and password is correct", async () => {
    const nonMfaUser = { ...mockUser, two_factor_enabled: false };
    (queryDatabase as jest.Mock).mockResolvedValue([nonMfaUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await authorizeUser(mockCredentials);

    expect(result).toEqual({
      id: 1,
      email: "test@example.com",
      name: "Test User",
      companyName: undefined,
      phone: undefined,
    });
  });

  it("should throw the specific technical error if otplib verification fails technicality", async () => {
    (queryDatabase as jest.Mock).mockResolvedValue([mockUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (verify as jest.Mock).mockImplementation(() => {
      throw new Error("Token must be 6 digits, got 9");
    });

    const credentialsWithMfa = { ...mockCredentials, mfaCode: "123456789" };
    await expect(authorizeUser(credentialsWithMfa)).rejects.toThrow(
      "Token must be 6 digits, got 9",
    );
  });

  it("should throw 'MFA_REQUIRED' if mfaCode is the literal string 'undefined'", async () => {
    (queryDatabase as jest.Mock).mockResolvedValue([mockUser]);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const credentialsWithUndefined = {
      ...mockCredentials,
      mfaCode: "undefined",
    };
    await expect(authorizeUser(credentialsWithUndefined)).rejects.toThrow(
      "MFA_REQUIRED",
    );
  });
});
