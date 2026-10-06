const parseId = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) {
    const e = new Error('Invalid id');
    e.status = 400;
    throw e;
  }
  return n;
};

const enumQuery = (value, enumObj, name) => {
  if (value === undefined || value === '') return undefined;
  if (!Object.values(enumObj).includes(value)) {
    const e = new Error(`Invalid ${name}`);
    e.status = 400;
    throw e;
  }
  return value;
};

const notFound = (what = 'Resource') => {
  const e = new Error(`${what} not found`);
  e.status = 404;
  throw e;
};

module.exports = { parseId, enumQuery, notFound };
