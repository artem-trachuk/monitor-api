const User = require("../models/user").User;

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
  res.status(200).json(req.user);
};
