  export const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case "USD":
        return "$";
      case "NGN":
        return "₦";
      case "GBP":
        return "£";
      case "EUR":
        return "€";
      default:
        return "";
    }
  };
