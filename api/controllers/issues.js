const Issue = require("../models/issue").Issue;
const Hub = require("../models/hub").Hub;
const Permission = require("../models/permission").permission;

exports.post = (req, res, next) => {
  const data = req.body;
  Hub.findById(data.hub)
    .populate("company")
    .then(hub => {
      Permission.findOne({
        user: req.user._id,
        company: hub.company.id,
        update: true
      })
        .then(permission => {
          if (permission) {
            Issue.create({
              company: hub.company._id,
              hub: hub._id,
              message: data.issue,
              open: true,
              user: req.user._id
            })
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: result
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

exports.get = (req, res, next) => {
  if (req.query.all) {
    Permission.find({
      user: req.user._id,
      read: true
    }).then(permissions => {
      if (permissions) {
        Issue.find({
          company: { $in: permissions.map(p => p.company) },
          open: true
        })
          .populate("hub company user")
          .sort({ _id: -1 })
          .then(issues => {
            res.status(200).json({
              ok: true,
              result: issues
            });
          })
          .catch(error => next(error));
      } else {
        res.status(200).json({ ok: true, result: [] });
      }
    });
  }
  if (req.query.hub) {
    const hub = req.query.hub;
    Issue.find({
      hub: hub
    })
      .populate("user")
      .populate("replies.user")
      .then(result => {
        res.status(200).json({
          ok: true,
          result: result.map(comment => {
            return {
              _id: comment._id,
              message: comment.message,
              open: comment.open,
              user: comment.user,
              edited: comment.edited,
              replies: comment.replies.map(reply => {
                return {
                  _id: reply._id,
                  reply: reply.reply,
                  user: reply.user,
                  date: reply._id.getTimestamp(),
                  edited: reply.edited
                };
              }),
              date: comment._id.getTimestamp()
            };
          })
        });
      })
      .catch(error => next(error));
  }
};

exports.postById = (req, res, next) => {
  Issue.findById(req.params.id)
    .populate("company")
    .then(issue => {
      Permission.findOne({
        user: req.user._id,
        company: issue.company.id,
        update: true
      })
        .then(permission => {
          if (permission) {
            Issue.findByIdAndUpdate(req.params.id, {
              open: req.body.open,
              $push: {
                replies: {
                  user: req.user._id,
                  reply: req.body.reply
                }
              }
            })
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: result
                });
              })
              .catch(error => next(error));
          } else {
            next("You have no permission");
          }
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
};

exports.patchById = (req, res, next) => {
  Issue.findById(req.params.id)
    .populate("company")
    .then(issue => {
      Permission.findOne({
        user: req.user._id,
        company: issue.company.id,
        update: true
      })
        .then(permission => {
          if (permission && req.query.open) {
            Issue.findByIdAndUpdate(req.params.id, {
              open: true
            })
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: result
                });
              })
              .catch(error => next(error));
          } else if (permission && req.query.replyId) {
            Issue.findOneAndUpdate(
              { _id: req.params.id, "replies._id": req.query.replyId },
              {
                $set: {
                  "replies.$.reply": req.body.message,
                  "replies.$.edited": Date.now()
                },
              }
            )
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: {
                    hub: issue.hub._id
                  }
                });
              })
              .catch(error => next(error));
          } else if (permission) {
            Issue.findByIdAndUpdate(req.params.id, {
              message: req.body.message,
              edited: Date.now()
            })
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: result
                });
              })
              .catch(error => next(error));
          } else {
            next("Error in issues/patchById");
          }
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
};

exports.deleteById = (req, res, next) => {
  Issue.findById(req.params.id)
    .populate("company")
    .then(issue => {
      Permission.findOne({
        user: req.user._id,
        company: issue.company.id,
        update: true
      })
        .then(permission => {
          if (permission && !req.query.replyId) {
            Issue.findByIdAndDelete(req.params.id)
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: {
                    hub: issue.hub._id
                  }
                });
              })
              .catch(error => next(error));
          } else if (permission && req.query.replyId) {
            Issue.findByIdAndUpdate(req.params.id, {
              $pull: {
                replies: {
                  _id: req.query.replyId
                }
              }
            })
              .then(result => {
                res.status(200).json({
                  ok: true,
                  result: {
                    hub: issue.hub._id
                  }
                });
              })
              .catch(error => next(error));
          } else {
            next("You have no permission");
          }
        })
        .catch(error => next(error));
    })
    .catch(error => next(error));
};
