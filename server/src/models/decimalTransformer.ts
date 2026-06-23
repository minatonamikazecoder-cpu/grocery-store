export const decimalTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | null | undefined) => {
    if (value === null || value === undefined) return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : parsed;
  }
};
