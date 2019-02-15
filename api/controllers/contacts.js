const Contact = require("../models/contact").contact;
const Permissions = require("../models/permission").permission;

exports.get = (req, res, next) => {
  Permissions.find({ user: req.user._id, read: true }).then(permissions => {
    if (permissions) {
      Contact.find({
        company: {
          $in: permissions.map(p => p.company)
        }
      })
        .populate({ path: "company", select: "name" })
        .then(contacts => {
          res.status(200).json({
            ok: true,
            description: "List of contacts",
            result: contacts
          });
        })
        .catch(error => next(error));
    }
  });
};

exports.post = (req, res, next) => {
  const contact = req.body;
  Contact.create(contact)
    .then(result => {
      res.status(200).json({
        ok: true,
        result: result
      });
    })
    .catch(error => next(error));
};
