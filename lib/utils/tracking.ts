export const createTrackingId = (serviceType: string): string => {
  const prefix = serviceType.slice(0, 3).toUpperCase();
  const suffix = Date.now().toString().slice(-6);
  return `${prefix}-${suffix}`;
};