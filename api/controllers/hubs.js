const Hub = require("../models/hub").Hub;
const Permissions = require("../models/permission").permission;

const path = require("../routes/file-path").path;
const removeFiles = require("../fshelper").removeFiles;

exports.post = (req, res, next) => {
  const data = JSON.parse(req.body.values);
  Permissions.findOne({
    user: req.user,
    company: data.company,
    create: true
  }).then(permission => {
    if (permission) {
      Hub.create({
        name: data.name,
        company: data.company,
        note: data.note,
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
          : undefined,
        LatLng: data.LatLng
          ? {
              lat: data.LatLng.lat,
              lng: data.LatLng.lng
            }
          : undefined
      })
        .then(result => {
          res.status(201).json({
            ok: true,
            description: "Hub was successfully added to database.",
            result: result
          });
        })
        .catch(error => {
          next(error);
        });
    } else {
      next("You have no permission.");
    }
  });
};

exports.getById = (req, res, next) => {
  Hub.findById(req.params.id)
    .populate("company")
    .populate("devices")
    .then(result => {
      Permissions.findOne({
        user: req.user,
        company: result.company,
        read: true
      }).then(permission => {
        if (permission) {
          res.status(200).json({
            ok: true,
            description: "Hub by id",
            result: {
              ...permission._doc,
              ...result._doc,
              devices: result.devices
            }
          });
        } else {
          next("You have no permission.");
        }
      });
    })
    .catch(error => next(error));
};

exports.patchById = (req, res, next) => {
  const values = JSON.parse(req.body.values);
  if (!values || !values.name || values.name.length < 1) {
    return next(new Error());
  }
  Permissions.findOne({
    user: req.user,
    company: values.company,
    update: true
  }).then(permission => {
    if (permission) {
      const updateObj = {
        name: values.name,
        address: values.address,
        note: values.note,
        LatLng: values.LatLng
          ? {
              lat: values.LatLng.lat,
              lng: values.LatLng.lng
            }
          : undefined,
        phone: values.phone,
        email: values.email
      };
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
      Hub.findByIdAndUpdate(req.params.id, {
        $set: { ...updateObj },
        $push: { photos: photos, documents: documents }
      })
        .then(updateResult => {
          res.status(200).json({
            ok: true,
            result: updateResult
          });
        })
        .catch(error => next(error));
    } else {
      next("You have no permission.");
    }
  });
};

exports.deleteById = (req, res, next) => {
  Hub.findById(req.params.id).then(hub => {
    if (hub) {
      Permissions.findOne({
        user: req.user,
        company: hub.company,
        delete: true
      }).then(permission => {
        if (permission) {
          if (req.query.photo) {
            return Hub.findByIdAndUpdate(hub.id, {
              $pull: {
                photos: {
                  _id: req.query.photo
                }
              }
            }).then(updateResult => {
              removeFiles([
                path.photos +
                  hub.photos.find(
                    p => p._id.toString() === req.query.photo.toString()
                  ).filename
              ]);
              res.status(200).json({
                ok: true
              });
            });
          }
          if (req.query.document) {
            return Hub.findByIdAndUpdate(hub.id, {
              $pull: {
                documents: {
                  _id: req.query.document
                }
              }
            }).then(updateResult => {
              removeFiles([
                path.documents +
                  hub.documents.find(
                    p => p._id.toString() === req.query.document.toString()
                  ).filename
              ]);
              res.status(200).json({
                ok: true
              });
            });
          }
          return Hub.findById(hub.id)
            .then(hub => {
              if (hub) {
                hub.remove().then(removeResult => {
                  res.status(200).json({
                    ok: true,
                    result: removeResult
                  });
                })
              }
            })
            .catch(error => next(error));
        } else {
          next("No permission");
        }
      });
    } else {
      next("No hub");
    }
  });
};
