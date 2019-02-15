const firebase = require("../../firebase/admin").firebase;
const User = require("../models/user").User;

module.exports = (req, res, next) => {
  const header = req.get("Authorization");
  if (!header) {
    return next({ message: "Authorization header is required" });
  }
  // TODO check idToken
  const idToken = header.split(" ")[1];
  firebase
    .auth()
    .verifyIdToken(idToken)
    .then(function(decodedToken) {
      User.findOne({
        uid: decodedToken.uid
      })
        .then(result => {
          if (result) {
            req.user = result;
            next();
          } else {
            next(
              new Error("Use /api/auth to initialize user before accessing API resources")
            );
          }
        })
        .catch(error => next(error));
    })
    .catch(function(error) {
      next(error);
    });
};
