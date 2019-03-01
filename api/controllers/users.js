const User = require("../models/user").User;
const Company = require("../models/company").company;

exports.getById = (req, res, next) => {
  User.findById(req.params.id)
    .then(result => {
      res.status(200).json({
        ok: true,
        result: result
      });
    })
    .catch(error => next(error));
};

exports.get = (req, res, next) => {
  const user = req.user;
  Company.find({ owner: user })
    .then(companies => {
      return res.status(200).json({
        ok: true,
        result: {
          user: req.user,
          companies: companies
        }
      });
    })
    .catch(err => next(err));
};
