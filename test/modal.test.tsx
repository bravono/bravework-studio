import React from "react";
import Modal from "@/app/components/Modal";
import CourseModal from "@/app/components/CourseModal";

jest.mock("next/dynamic", () => () => {
  const MockComponent = () => null;
  MockComponent.displayName = "DynamicMock";
  return MockComponent;
});

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
  },
}));

describe("Modal Component", () => {
  it("should return null when isOpen is false", () => {
    const result = Modal({
      isOpen: false,
      onClose: jest.fn(),
      title: "Test Modal",
      children: <div>Content</div>,
    });

    expect(result).toBeNull();
  });

  it("should render default max-w-lg width when maxWidth is not provided", () => {
    const result = Modal({
      isOpen: true,
      onClose: jest.fn(),
      title: "Test Modal",
      children: <div>Content</div>,
    });

    expect(result).not.toBeNull();
    const contentContainer = (result as React.ReactElement).props.children;
    expect(contentContainer.props.className).toContain("max-w-lg");
  });

  it("should render custom maxWidth when specified (e.g., 90vw width)", () => {
    const result = Modal({
      isOpen: true,
      onClose: jest.fn(),
      title: "Custom Width Modal",
      maxWidth: "max-w-[90vw] w-[90vw]",
      children: <div>Content</div>,
    });

    expect(result).not.toBeNull();
    const contentContainer = (result as React.ReactElement).props.children;
    expect(contentContainer.props.className).toContain("max-w-[90vw]");
    expect(contentContainer.props.className).toContain("w-[90vw]");
    expect(contentContainer.props.className).not.toContain("max-w-lg");
  });

  it("should append custom className when provided", () => {
    const result = Modal({
      isOpen: true,
      onClose: jest.fn(),
      title: "Styled Modal",
      className: "custom-modal-class",
      children: <div>Content</div>,
    });

    expect(result).not.toBeNull();
    const contentContainer = (result as React.ReactElement).props.children;
    expect(contentContainer.props.className).toContain("custom-modal-class");
  });

  it("should call onClose when close button is clicked", () => {
    const onCloseMock = jest.fn();
    const result = Modal({
      isOpen: true,
      onClose: onCloseMock,
      title: "Closeable Modal",
      children: <div>Content</div>,
    });

    const contentContainer = (result as React.ReactElement).props.children;
    const header = contentContainer.props.children[0];
    const closeButton = header.props.children[1];

    closeButton.props.onClick();
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

describe("CourseModal Component", () => {
  it("should configure 90% screen width (max-w-[90vw] w-[90vw]) by default", () => {
    const originalUseState = React.useState;
    const originalUseEffect = React.useEffect;
    const originalUseCallback = React.useCallback;

    try {
      React.useState = jest.fn().mockImplementation((init) => [init, jest.fn()]);
      React.useEffect = jest.fn();
      React.useCallback = jest.fn().mockImplementation((fn) => fn);

      const result = CourseModal({
        onClose: jest.fn(),
        onSave: jest.fn(),
        userRole: "admin",
      });

      expect(result).not.toBeNull();
      // CourseModal returns a fragment containing Modal and ConfirmationModal
      const fragment = result as React.ReactElement;
      const modalElement = fragment.props.children[0];

      expect(modalElement.props.maxWidth).toBe("max-w-[90vw] w-[90vw]");
    } finally {
      React.useState = originalUseState;
      React.useEffect = originalUseEffect;
      React.useCallback = originalUseCallback;
    }
  });

  it("should allow overriding maxWidth if explicitly passed", () => {
    const originalUseState = React.useState;
    const originalUseEffect = React.useEffect;
    const originalUseCallback = React.useCallback;

    try {
      React.useState = jest.fn().mockImplementation((init) => [init, jest.fn()]);
      React.useEffect = jest.fn();
      React.useCallback = jest.fn().mockImplementation((fn) => fn);

      const result = CourseModal({
        onClose: jest.fn(),
        onSave: jest.fn(),
        userRole: "instructor",
        maxWidth: "max-w-4xl w-full",
      });

      const fragment = result as React.ReactElement;
      const modalElement = fragment.props.children[0];

      expect(modalElement.props.maxWidth).toBe("max-w-4xl w-full");
    } finally {
      React.useState = originalUseState;
      React.useEffect = originalUseEffect;
      React.useCallback = originalUseCallback;
    }
  });
});
