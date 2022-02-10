import 'dotenv/config'

import express from 'express'
import bodyParser from 'body-parser';
import ejs from 'ejs';
// import jwt from ' jsonwebtoken'
import {initializeApp} from "firebase/app";
import {getAnalytics} from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  collectionGroup
} from "firebase/firestore";

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
    console.log(doc.id, " => ", doc.data());
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

app.get("/competitions", authenticateToken, async function(req, res){
  var types=[];
  const querySnapshot1 = await getDocs(collection(db, "Competitions"));
  querySnapshot1.forEach((doc)=>{
    types.push(doc.id);
  });
  console.log(types);
  var competitions = [];
  for(var i=0; i<types.length;i++){
    const path = "Competitions/"+types[i]+"/Contests";
    console.log(path);
    const docsSnap = await getDocs(collection(db, path));
    var temp = {
      "type": types[i],
      "competitions": []
    };
    docsSnap.forEach((doc2)=>{
      console.log(doc2.data());
      temp["competitions"].push(doc2.data());
    });
    // console.log(temp);
    competitions.push(temp);
  }
  // console.log(competitions);
  res.status(200).json({competitions: competitions});
});

app.post("/login", async function(req, res) {
  const username = req.body.username;
  const password = req.body.password;
  const auth = getAuth();
  signInWithEmailAndPassword(auth, username, password).then((userCredential) => {
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
    console.log(errorMessage);
    res.status(errorCode);
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
      res.status(errorCode);
    }
  });
  // const user = {username: username, password: password};
  // console.log(user);
  // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
  // res.status(200).json({accessToken: accessToken, user: user});
});

function authenticateToken(req, res, next) {
  console.log(req.headers);
  const authHeader = req.headers['authorization'];
  console.log("Auth Header is: " + authHeader + "\n");
  const token = authHeader && authHeader.split(' ')[1];
  console.log("Token is: " + token + "\n");
  console.log("BearerToken is: " + bearerToken + "\n");
  console.log(bearerToken === token);
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
  // if (token === bearerToken) {
  if (token == process.env.TEST_BEARER_TOKEN) {
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
