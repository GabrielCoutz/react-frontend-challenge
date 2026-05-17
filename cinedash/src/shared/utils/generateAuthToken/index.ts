export const generateAuthToken = (): string =>
  new Date().getTime().toString(36);
