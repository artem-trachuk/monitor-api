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

exports.getById = (req, res, next) => {
  Contact.findById(req.params.id)
    .populate({ path: "company", select: "name" })
    .then(contact => {
      Permissions.findOne({
        user: req.user._id,
        read: true,
        company: contact.company
      }).then(permission => {
        if (permission) {
          res.status(200).json({
            ok: true,
            result: {
              ...permission._doc,
              ...contact._doc
            }
          });
        } else {
          next("No access");
        }
      });
    })
    .catch(error => next(error));
};

exports.post = (req, res, next) => {
  const contact = req.body;
  Permissions.findOne({
    user: req.user,
    company: contact.company,
    create: true
  }).then(permission => {
    if (permission) {
      Contact.create(contact)
        .then(result => {
          res.status(200).json({
            ok: true,
            result: result
          });
        })
        .catch(error => next(error));
    }
  });
};

exports.patchById = (req, res, next) => {
  const id = req.params.id;
  const changedContact = req.body;
  Contact.findById(id).then(contact => {
    if (contact) {
      Permissions.findOne({
        user: req.user,
        company: contact.company,
        update: true
      }).then(permission => {
        if (permission) {
          Contact.findByIdAndUpdate(id, {
            name: changedContact.name,
            phone: changedContact.phone
          }).then(updateResult => {
            res.status(200).json({
              ok: true
            });
          });
        }
      });
    }
  });
};

exports.deleteById = (req, res, next) => {
  const id = req.params.id;
  Contact.findById(id).then(contact => {
    if (contact) {
      Permissions.findOne({
        user: req.user,
        company: contact.company,
        delete: true
      }).then(permission => {
        if (permission) {
          contact.remove().then(deleteResult => {
            res.status(200).json({
              ok: true
            });
          });
        }
      });
    }
  });
};
