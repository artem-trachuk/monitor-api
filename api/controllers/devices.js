const Device = require("../models/device").device;
const Hub = require("../models/hub").Hub;
const Permission = require("../models/permission").permission;

const path = require("../routes/file-path").path;

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
                  return { path: path.relativePhotos + file.filename, originalname: file.originalname };
                })
              : undefined,
            documents: req.files.documents
              ? req.files.documents.map(file => {
                  return { path: path.relativeDocuments + file.filename, originalname: file.originalname };
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
                ...result._doc,
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
                return { path: path.relativePhotos + file.filename, originalname: file.originalname };
              }); // files from multer
            }
            var documents = [];
            if (req.files.documents) {
              documents = req.files.documents.map(file => {
                return { path: path.relativeDocuments + file.filename, originalname: file.originalname };
              }); // files from multer
            }
            Device.findByIdAndUpdate(req.params.id, {
              $set: {...updateObj},
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
