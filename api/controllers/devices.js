const Device = require("../models/device").device;
const Hub = require("../models/hub").Hub;
const Permission = require("../models/permission").permission;

const path = require("../routes/file-path").path;
const removeFiles = require("../fshelper").removeFiles;

exports.post = (req, res, next) => {
  const data = JSON.parse(req.body.values);
  Hub.findById(data.hub)
    .populate("company")
    .then(hub => {
      Permission.findOne({
        user: req.user._id,
        company: hub.company,
        create: true
      }).then(permission => {
        if (permission) {
          Device.create({
            name: data.name,
            hub: data.hub,
            LatLng: data.LatLng
              ? {
                  lat: data.LatLng.lat,
                  lng: data.LatLng.lng
                }
              : undefined,
            ip: data.ip,
            deviceType: data.deviceType,
            note: data.note,
            serial: data.serial,
            ptz: data.ptz,
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
          })
            .then(result => {
              res.status(200).json({
                ok: true,
                result: {
                  _id: result._id
                }
              });
            })
            .catch(error => next(error));
        } else {
          next("You have no permissions");
        }
      });
    })
    .catch(error => next(error));
};

exports.getById = (req, res, next) => {
  Device.findById(req.params.id)
    .populate({
      path: "hub",
      populate: { path: "company", select: "name logo" }
    })
    .then(result => {
      Permission.findOne({
        user: req.user._id,
        company: result.hub.company.id,
        read: true
      })
        .then(permission => {
          if (permission) {
            res.status(200).json({
              ok: true,
              result: {
                ...permission._doc,
                ...result._doc
              }
            });
          } else {
            next("You have no permissions");
          }
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
};

exports.patchById = (req, res, next) => {
  const device = JSON.parse(req.body.values);
  if (!device || !device.name || device.name.length < 1) {
    return next(new Error());
  }
  Hub.findById(device.hub)
    .populate("company")
    .then(hub => {
      Permission.findOne({
        user: req.user._id,
        company: hub.company._id,
        update: true
      })
        .then(permission => {
          if (permission) {
            let updateObj = {
              name: device.name,
              hub: device.hub,
              LatLng: device.LatLng
                ? {
                    lat: device.LatLng.lat,
                    lng: device.LatLng.lng
                  }
                : undefined,
              ip: device.ip,
              note: device.note,
              serial: device.serial,
              ptz: device.ptz
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
            Device.findByIdAndUpdate(req.params.id, {
              $set: { ...updateObj },
              $push: { photos: photos, documents: documents }
            })
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: {
                    _id: result._id
                  }
                });
              })
              .catch(error => next(error));
          } else {
            next("You have no permissions");
          }
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
};

exports.deleteById = (req, res, next) => {
  const id = req.params.id;
  Device.findById(id)
    .populate({ path: "hub", populate: { path: "company" } })
    .then(device => {
      if (device) {
        return Permission.findOne({
          user: req.user,
          company: device.hub.company,
          delete: true
        }).then(permission => {
          if (permission) {
            if (req.query.photo) {
              return Device.findByIdAndUpdate(device.id, {
                $pull: {
                  photos: {
                    _id: req.query.photo
                  }
                }
              }).then(updateResult => {
                removeFiles([
                  path.photos +
                  device.photos.find(
                      p => p._id.toString() === req.query.photo.toString()
                  ).filename
                ]);
                res.status(200).json({
                  ok: true
                });
              });
            }
            if (req.query.document) {
              return Device.findByIdAndUpdate(device.id, {
                $pull: {
                  documents: {
                    _id: req.query.document
                  }
                }
              }).then(updateResult => {
                removeFiles([
                  path.documents +
                  device.documents.find(
                      p => p._id.toString() === req.query.document.toString()
                  ).filename
                ]);
                res.status(200).json({
                  ok: true
                });
              });
            }
            device.remove();
            return res.status(200).json({
              ok: true
            });
          }
        });
      }
    })
    .catch(err => next(err));
};
