module.exports = (d) => {
  const year = d.getFullYear();
  const month = d.getMonth() + 1 > 9 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1);
  const date = d.getDate() > 9 ? d.getDate() : '0' + d.getDate();
  return `${date}.${month}.${year}`;
}