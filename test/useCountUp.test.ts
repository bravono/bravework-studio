import { useCountUp } from "@/hooks/useCountUp";
import * as React from "react";

jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useState: jest.fn(),
    useEffect: jest.fn(),
    useRef: jest.fn(),
  };
});

describe("useCountUp", () => {
  let mockSetCount: jest.Mock;
  let mockRef: { current: any };

  beforeEach(() => {
    mockSetCount = jest.fn();
    mockRef = { current: null };
    (React.useState as jest.Mock).mockReturnValue([0, mockSetCount]);
    (React.useRef as jest.Mock).mockReturnValue(mockRef);
    (React.useEffect as jest.Mock).mockImplementation((effect) => effect());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with count 0 and return a ref object", () => {
    const { count, ref } = useCountUp(100, 2000);
    expect(count).toBe(0);
    expect(ref).toEqual({ current: null });
    expect(React.useState).toHaveBeenCalledWith(0);
    expect(React.useEffect).toHaveBeenCalled();
  });
});
