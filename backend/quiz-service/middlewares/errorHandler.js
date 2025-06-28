module.exports = (err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
};
