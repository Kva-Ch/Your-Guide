import 'dotenv/config'

import express from 'express'
import bodyParser from 'body-parser';
import ejs from 'ejs';
// import jwt from ' jsonwebtoken'
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  collectionGroup
} from "firebase/firestore";
import cors from 'cors';

const firebaseConfig = {
  apiKey: "AIzaSyD60EVX8UVtIqwPZJAsqWAUZEFHT--6pOc",
  authDomain: "your-guide-7739a.firebaseapp.com",
  projectId: "your-guide-7739a",
  storageBucket: "your-guide-7739a.appspot.com",
  messagingSenderId: "313187121575",
  appId: "1:313187121575:web:3c1af5c8a5cdac30415e82",
  measurementId: "G-TMM5TJXN12"
};

const app2 = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app2);
const db = getFirestore();
const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
var bearerToken = "",
  refreshBearerToken = "";
var ifOAuth = false;
var posts = [
  {
    username: 'kyle',
    title: 'post 1'
  }, {
    username: 'jim',
    title: 'post 2'
  }
];

app.get("/posts", authenticateToken, async function(req, res) {
  res.status(200).json(posts);
});

app.get("/placements", authenticateToken, async function(req, res) {

  var companies = [];
  const querySnapshot1 = await getDocs(collection(db, "Placements"));
  querySnapshot1.forEach((doc) => {
    // console.log(doc.id, " => ", doc.data());
    companies.push(doc.id);
  });
  var placements = [];
  for (var i = 0; i < companies.length; i++) {
    const path = "Placements/" + companies[i] + "/Jobs";
    const docsSnap = await getDocs(collection(db, path));
    var temp = {
      "companyname": companies[i],
      "jobs": []
    };
    docsSnap.forEach((doc2) => {
      temp["jobs"].push(doc2.data());
    });
    // console.log(temp);
    placements.push(temp);
  }

  res.status(200).json({placements: placements});
});

app.get("/competitions", authenticateToken, async function(req, res) {
  var types = [];
  const querySnapshot1 = await getDocs(collection(db, "Competitions"));
  querySnapshot1.forEach((doc) => {
    types.push(doc.id);
  });
  // console.log(types);
  var competitions = [];
  for (var i = 0; i < types.length; i++) {
    const path = "Competitions/" + types[i] + "/Contests";
    // console.log(path);
    const docsSnap = await getDocs(collection(db, path));
    var temp = {
      "type": types[i],
      "competitions": []
    };
    docsSnap.forEach((doc2) => {
      // console.log(doc2.data());
      temp["competitions"].push(doc2.data());
    });
    // console.log(temp);
    competitions.push(temp);
  }
  // console.log(competitions);
  res.status(200).json({competitions: competitions});
});

app.get("/ebooks", authenticateToken, async function(req, res) {
  var types = [];
  const querySnapshot1 = await getDocs(collection(db, "Ebooks"));
  querySnapshot1.forEach((doc) => {
    types.push(doc.id);
  });
  // console.log(types);
  var ebooks = [];
  for (var i = 0; i < types.length; i++) {
    // console.log("Here");
    const path = "Ebooks/" + types[i] + "/Books";
    // console.log(path);
    const docsSnap = await getDocs(collection(db, path));
    var temp = {
      type: types[i],
      ebooks: []
    };
    docsSnap.forEach((doc2) => {
      // console.log(doc2.data());
      temp["ebooks"].push(doc2.data());
    });
    ebooks.push(temp);
  }
  res.status(200).json({ebooks: ebooks});
});

app.get("/tutorials", authenticateToken, async function(req, res) {
  var types = [];
  const querySnapshot1 = await getDocs(collection(db, "Tutorials"));
  querySnapshot1.forEach((doc) => {
    types.push(doc.id);
  });
  // console.log(types);
  var tutorials = [];
  for (var i = 0; i < types.length; i++) {
    const path = "Tutorials/" + types[i] + "/Videos";
    const docsSnap = await getDocs(collection(db, path));
    var temp = {
      type: types[i],
      tutorials: []
    };
    docsSnap.forEach((doc2) => {
      // console.log(doc2.data());
      temp["tutorials"].push(doc2.data());
    });
    tutorials.push(temp);
  }
  res.status(200).json({tutorials: tutorials});
});

app.get("/roadmaps", authenticateToken, async function(req, res) {
  var roadmaps = [];
  const querySnapshot1 = await getDocs(collection(db, "Roadmaps"));
  querySnapshot1.forEach((doc) => {
    var temp = {
      type: doc.id,
      roadmaps: []
    };
    temp["roadmaps"].push(doc.data());
    roadmaps.push(temp);
    // console.log(temp);
  });
  res.status(200).json({roadmaps: roadmaps});
});

app.get("/journals", authenticateToken, async function(req, res) {
  var types = [];
  const querySnapshot1 = await getDocs(collection(db, "Journals"));
  querySnapshot1.forEach((doc) => {
    types.push(doc.id);
  });
  var journals = [];
  for (var i = 0; i < types.length; i++) {
    const path = "Journals/" + types[i] + "/Papers";
    const docsSnap = await getDocs(collection(db, path));
    var temp = {
      types: types[i],
      journals: []
    };
    docsSnap.forEach((doc2) => {
      temp["journals"].push(doc2.data());
    });
    journals.push(temp);
  }
  res.status(200).json({journals: journals});
});

app.post("/login", async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const auth = getAuth();
  console.log(username, password);
  signInWithEmailAndPassword(auth, username, password).then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    const accessToken = user["stsTokenManager"]["accessToken"];
    bearerToken = accessToken;
    const refreshToken = user["stsTokenManager"]["refreshToken"];
    refreshBearerToken = refreshToken;
    res.status(200).json({status: 200, accessToken: accessToken});
  }).catch((error) => {
    console.log("Login error");
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage);
    res.status(errorCode).json({status: 400});
  });
  // const user = {username: username, password: password};
  // console.log(user);
  // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  // res.status(200).json({accessToken: accessToken, user: user});
});

app.post("/register", async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, username, password).then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    const accessToken = user["stsTokenManager"]["accessToken"];
    bearerToken = accessToken;
    const refreshToken = user["stsTokenManager"]["refreshToken"];
    refreshBearerToken = refreshToken;
    res.status(200).json({status: 200, accessToken: accessToken});
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage + "\n" + errorCode);
    if (errorCode === "auth/email-already-in-use") {
      res.status(409).json({status: 409, message: "user already there"});
    } else {
      res.status(errorCode).json({status: 400, message: "error occured"});
    }
  });
  // const user = {username: username, password: password};
  // console.log(user);
  // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  // res.status(200).json({accessToken: accessToken, user: user});
});

app.get("/logout", authenticateToken, async function(req, res) {
  const auth = getAuth();
  signOut(auth).then(() => {
    // Sign-out successful.
    bearerToken="";
    res.status(200).json({message: "Successfully logged out"});
  }).catch((error) => {
    // An error happened.
    console.log(error);
    res.status(400).json({message: "Error with logging out"});
  });
});

function authenticateToken(req, res, next) {
  // console.log(req.headers);
  const authHeader = req.headers['authorization'];
  console.log("Auth Header is: " + authHeader + "\n");
  const token = authHeader && authHeader.split(' ')[1];
  // console.log("Token is: " + token + "\n");
  // console.log("BearerToken is: " + bearerToken + "\n");
  // console.log(bearerToken === token);
  if (token == null) {
    console.log("No token is sent");
    res.status(401);
  }
  // jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
  //   if (err) {
  //     console.log("The error is: "+err);
  //     res.status(403);
  //   }
  //   req.user = user;
  //   next();
  // });

  //USE THE FOLLOWING LINE FOR REAL TIME BUT FOR TEST USE TEST_BEARER_TOKEN
  if (token === bearerToken) {
    // if (token == process.env.TEST_BEARER_TOKEN) {
    next();
  } else {
    console.log("Not Authenticated");
    res.status(401).json({message: "Unauthorized Access"});
  }
}

const port = 5000 || process.env.PORT;
app.listen(port, function(req, res) {
  console.log("started on port: " + port);
});
