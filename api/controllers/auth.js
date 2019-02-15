const firebase = require("../../firebase/admin").firebase;
const User = require("../models/user").User;

exports.get = (req, res, next) => {
  const header = req.get("Authorization");
  if (!header) {
    return next({ message: "Authorization header is required" });
  }
  const idToken = header.split(" ")[1];
  firebase
    .auth()
    .verifyIdToken(idToken)
    .then(function(decodedToken) {
      User.findOneAndUpdate(
        {
          uid: decodedToken.uid
        },
        {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture
        },
        {
          upsert: true /* create the object if it doesn't exist */,
          new: true /* return the modified document rather than the original */
        }
      )
        .then(result => {
          res.status(200).json({
            ok: true,
            description: "Token was successfully verified"
          });
        })
        .catch(error => next(error));
    })
    .catch(function(error) {
      next(error);
    });
};
