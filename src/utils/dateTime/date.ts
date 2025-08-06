export const getDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"})
}