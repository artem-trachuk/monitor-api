const admin = require("firebase-admin");

const serviceAccount = require("./monitor-ps-firebase-adminsdk-2aijk-425892592a");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://monitor-ps.firebaseio.com"
});

module.exports.firebase = firebase;