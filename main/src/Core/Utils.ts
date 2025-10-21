export const uniqId = (len: number = 12) => {
  return btoa(`${Math.round((len * 100 + Math.random()) * len * 100)}`).slice(0, len);
};
