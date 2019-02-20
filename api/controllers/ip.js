const Permissions = require("../models/permission").permission;
const Company = require("../models/company").company;
const Device = require("../models/device").device;

exports.get = (req, res, next) => {
  return Permissions.find({ user: req.user._id, read: true })
    .then(result =>
      Company.find({
        _id: {
          $in: result.map(r => r.company)
        }
      }).select("name")
    )
    .then(companies => {
      return Device.find({
        ip: { $exists: true, $ne: null, $type: "string" }
      })
        .populate({
          path: "hub",
          select: "name",
          populate: { path: "company", select: "name" }
        })
        .then(devices => {
          res.status(200).json({
            ok: true,
            result: devices.filter(d => {
              return (
                companies
                  .map(c => c._id.toString())
                  .indexOf(d.hub.company._id.toString()) !== -1
              );
            })
          });
        });
    })
    .catch(error => next(error));
};
