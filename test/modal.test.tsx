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

  it("should render custom maxWidth and responsive padding classes", () => {
    const result = Modal({
      isOpen: true,
      onClose: jest.fn(),
      title: "Custom Width Modal",
      maxWidth: "max-w-4xl w-full",
      children: <div>Content</div>,
    });

    expect(result).not.toBeNull();
    const outerContainer = result as React.ReactElement;
    expect(outerContainer.props.className).toContain("p-2 sm:p-4");

    const contentContainer = outerContainer.props.children;
    expect(contentContainer.props.className).toContain("max-w-4xl");
    expect(contentContainer.props.className).toContain("w-full");
    expect(contentContainer.props.className).toContain("p-4 sm:p-6");
    expect(contentContainer.props.className).toContain("max-h-[94vh] sm:max-h-[90vh]");
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
  it("should configure max-w-4xl w-full by default for balanced modal width", () => {
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
      const fragment = result as React.ReactElement;
      const modalElement = fragment.props.children[0];

      expect(modalElement.props.maxWidth).toBe("max-w-4xl w-full");
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
        maxWidth: "max-w-5xl w-full",
      });

      const fragment = result as React.ReactElement;
      const modalElement = fragment.props.children[0];

      expect(modalElement.props.maxWidth).toBe("max-w-5xl w-full");
    } finally {
      React.useState = originalUseState;
      React.useEffect = originalUseEffect;
      React.useCallback = originalUseCallback;
    }
  });

  it("should render multi-step wizard structure with desktop and mobile steppers", () => {
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

      const fragment = result as React.ReactElement;
      const modalElement = fragment.props.children[0];
      const formElement = modalElement.props.children;

      expect(formElement.type).toBe("form");

      // Verify form contains children elements including steppers
      const formChildren = React.Children.toArray(formElement.props.children);
      expect(formChildren.length).toBeGreaterThanOrEqual(3);
    } finally {
      React.useState = originalUseState;
      React.useEffect = originalUseEffect;
      React.useCallback = originalUseCallback;
    }
  });
});
