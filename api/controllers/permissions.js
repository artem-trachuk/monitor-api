const Company = require("../models/company").company;
const Permissions = require("../models/permission").permission;

module.exports.post = (req, res, next) => {
  const user = req.body.user;
  if (!user) {
    return res.status(500).json({
      ok: false
    });
  }
  Company.findById(req.body.company).then(company => {
    if (company.owner.toString() !== req.user._id.toString()) {
      return next("You must be owner of company");
    }
    Permissions.findOneAndUpdate(
      { user: user, company: req.body.company },
      req.body,
      {
        upsert: true /* create the object if it doesn't exist */,
        new: true /* return the modified document rather than the original */
      }
    ).then(updateResult => {
      return res.status(200).json({
        ok: true
      });
    });
  });
};

exports.get = (req, res, next) => {
  const company = req.query.company;
  Company.findOne({ owner: req.user, _id: company })
    .then(companyResult => {
      if (companyResult) {
        Permissions.find({ company: company })
          .populate("user")
          .then(permissions => {
            if (permissions) {
              res.status(200).json({
                ok: true,
                result: permissions
              });
            }
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
};
