const Company = require("../models/company").company;
const Permissions = require("../models/permission").permission;

module.exports.post = (req, res, next) => {
  Company.findById(req.body.company).then(company => {
    if (company.owner.toString() !== req.user._id.toString()) {
      return next("You must be owner of company");
    }
    Permissions.findOneAndUpdate(
      { user: req.body.user, company: req.body.company },
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
