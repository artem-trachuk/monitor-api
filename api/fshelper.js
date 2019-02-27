const fs = require("fs");

exports.removeFiles = array => {
  array.forEach(file => {
    fs.unlink(file, error => {
      error ? console.log(error) : undefined;
    });
  });
};
