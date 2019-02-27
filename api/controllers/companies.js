const Company = require("../models/company").company;
const User = require("../models/user").User;
const Permissions = require("../models/permission").permission;

const path = require("../routes/file-path").path;
const removeFiles = require("../fshelper").removeFiles;

//TODO filename for logo
exports.createCompany = (req, res, next) => {
  const owner = req.user._id;
  const company = JSON.parse(req.body.values);
  if (!company.name || company.name.length < 1) {
    return res.status(400).json({
      ok: false,
      description:
        "Field name is required, length must be equal or greater than 1"
    });
  }
  const createCompany = {
    name: company.name,
    owner: owner,
    LatLng: company.LatLng
      ? {
          lat: company.LatLng.lat,
          lng: company.LatLng.lng
        }
      : undefined,
    email: company.email,
    phone: company.phone,
    address: company.address,
    note: company.note,
    logo: req.files.logo
      ? {
          path: path.relativeLogo + req.files.logo[0].filename,
          filename: req.files.logo[0].filename
        }
      : undefined,
    photos: req.files.photos
      ? req.files.photos.map(file => {
          return {
            path: path.relativePhotos + file.filename,
            originalname: file.originalname,
            filename: file.filename
          };
        })
      : undefined,
    documents: req.files.documents
      ? req.files.documents.map(file => {
          return {
            path: path.relativeDocuments + file.filename,
            originalname: file.originalname,
            filename: file.filename
          };
        })
      : undefined
  };
  Company.create(createCompany)
    .then(result => {
      res.company = result._id;
      next();
    })
    .catch(error => next(error));
};

exports.setPermissions = (req, res, next) => {
  Permissions.create({
    company: res.company,
    user: req.user,
    create: true,
    read: true,
    update: true,
    delete: true
  })
    .then(result => {
      res.status(200).json({
        ok: true,
        result: {
          _id: res.company
        }
      });
    })
    .catch(error => next(error));
};

exports.get = (req, res, next) => {
  return Permissions.find({ user: req.user, read: true })
    .then(result =>
      Company.find({
        _id: {
          $in: result.map(r => r.company)
        }
      })
        .select("name logo")
        .populate({ path: "hubs", populate: { path: "devices issues" } })
    )
    .then(companies =>
      res.status(200).json({
        ok: true,
        description: "List of companies",
        result: companies.map(c => {
          return {
            _id: c._id,
            name: c.name,
            logo: c.logo,
            hubs: c.hubs.map(h => {
              return {
                _id: h._id,
                name: h.name,
                issues: h.issues.filter(i => i.open),
                devices: h.devices
              };
            })
          };
        })
      })
    )
    .catch(error => next(error));
};

exports.getById = (req, res, next) => {
  const id = req.params.id;
  return Permissions.findOne({
    user: req.user._id,
    company: id,
    read: true
  }).then(permissions => {
    if (permissions) {
      Company.findById(id)
        .populate([
          {
            path: "hubs",
            select: "name",
            populate: [
              { path: "devices", select: "name deviceType" },
              { path: "issues" }
            ]
          },
          { path: "contacts", select: "phone name photo note" }
        ])
        .then(company => {
          res.status(200).json({
            ok: true,
            result: {
              ...permissions._doc,
              hubs: company.hubs.map(h => {
                return {
                  _id: h._id,
                  issues: h.issues.filter(i => i.open),
                  name: h.name,
                  devices: h.devices
                };
              }),
              ...company._doc,
              contacts: company.contacts,
              isOwner: company.owner.toString() === req.user._id.toString()
            }
          });
        })
        .catch(error => next(error));
    } else {
      next("You have no access to the company or the company is not exist.");
    }
  });
};

exports.patchById = (req, res, next) => {
  // company id
  const id = req.params.id;
  Permissions.findOne({
    user: req.user.id,
    company: id
  }).then(permission => {
    if (permission) {
      const company = JSON.parse(req.body.values);
      const updateObj = {
        name: company.name,
        address: company.address,
        note: company.note,
        LatLng: company.LatLng
          ? {
              lat: company.LatLng.lat,
              lng: company.LatLng.lng
            }
          : undefined,
        phone: company.phone,
        email: company.email
      };
      if (req.files.logo) {
        updateObj.logo = {
          path: path.relativeLogo + req.files.logo[0].filename, // files from multer,
          filename: req.files.logo[0].filename
        };
      }
      var photos = [];
      if (req.files.photos) {
        photos = req.files.photos.map(file => {
          return {
            path: path.relativePhotos + file.filename,
            originalname: file.originalname,
            filename: file.filename
          };
        }); // files from multer
      }
      var documents = [];
      if (req.files.documents) {
        documents = req.files.documents.map(file => {
          return {
            path: path.relativeDocuments + file.filename,
            originalname: file.originalname,
            filename: file.filename
          };
        }); // files from multer
      }
      Company.findByIdAndUpdate(id, {
        $set: { ...updateObj },
        $push: { photos: photos, documents: documents }
      })
        .then(result => {
          res.status(200).json({
            ok: true,
            description: "The company was updated successfully.",
            result: result
          });
        })
        .catch(error => next(error));
    } else {
      next("You have no access to the company or the company is not exist.");
    }
  });
};

exports.deleteById = (req, res, next) => {
  const id = req.params.id;
  Company.findById(id)
    .then(company => {
      Permissions.findOne({ company: id, user: req.user, delete: true })
        .then(permission => {
          if (permission) {
            if (req.query.photo) {
              return Company.findByIdAndUpdate(company.id, {
                $pull: {
                  photos: {
                    _id: req.query.photo
                  }
                }
              }).then(updateResult => {
                removeFiles([
                  path.photos +
                    company.photos.find(
                      p => p._id.toString() === req.query.photo.toString()
                    ).filename
                ]);
                res.status(200).json({
                  ok: true
                });
              });
            }
            if (req.query.document) {
              return Company.findByIdAndUpdate(company.id, {
                $pull: {
                  documents: {
                    _id: req.query.document
                  }
                }
              }).then(updateResult => {
                removeFiles([
                  path.documents +
                    company.documents.find(
                      p => p._id.toString() === req.query.document.toString()
                    ).filename
                ]);
                res.status(200).json({
                  ok: true
                });
              });
            }
            Company.findById(id)
              .then(company => {
                if (company) {
                  company.remove().then(removeResult => {
                    return res.status(200).json({
                      ok: true
                    });
                  });
                }
              })
              .catch(err => next(err));
          }
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};
