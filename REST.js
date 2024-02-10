//require faker to generate fake data
const { faker } = require('@faker-js/faker');
//requires mysql 
const mysql = require('mysql2');
//require express
const express = require('express');
const app = express();
//require path
const path = require('path');
//methodoverride
const methodoverride = require('method-override');
app.use(methodoverride("_method"));
app.use(express.urlencoded({extended:true}));

const { v4: uuidv4 } = require('uuid');

//view engine
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));


//create connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password :''
  });



//object to creeate random user 
let getRandomUser = ()=> {
    return [
      faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
      
    ]
  };


//home page  
app.get("/",(req,res)=>{
    let q = `SELECT COUNT(*) FROM USER`;
    try{  
          connection.query(q,(err,result)=>{
              if(err) throw err;
              let count = result[0]["COUNT(*)"];
              res.render("home.ejs",{count});
             
          })  
      }
      catch(err){
          console.log(err);
          res.send("Some error occured");
      }
   
})



//show user route
app.get("/user",(req,res)=>{
  let q = `SELECT * FROM USER`;
    try{  
      connection.query(q,(err,users)=>{
          if(err) throw err;
          
          res.render("showuser.ejs",{users});
        
        
      })  
  }
  catch(err){
      console.log(err);
      res.send("Some error occured");
  }
})

//edit user name
app.get("/user/:id/edit",(req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM USER WHERE id = '${id}'`;
  try{  
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];
        res.render("edit.ejs",{user});
      })  
   }
  catch(err){
      console.log(err);
      res.send("Some error occured");
  }
  console.log(id);
  
})


//update (db) for edit username route
app.patch("/user/:id",(req,res)=>{
  let {id} = req.params;
  let q = `SELECT * FROM USER WHERE id = '${id}'`;
  let {password : formPass , username : newUser} = req.body;
  try{  
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user = result[0];

        if(formPass != user.password)
        {
          res.send("Wrong password");
        }
        else{
          let q2 = `UPDATE USER SET username='${newUser}' WHERE id='${id}'`;

          connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");

          })
        }
       
      })  
   }
  catch(err){
      console.log(err);
      res.send("Some error occured");
  }
})

//add new user
app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
})

//adding new user to  database
app.post("/user/new",(req,res)=>{
  let {username,email,password} = req.body;
  let  id = uuidv4();

  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
  

});


app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

//listen 
app.listen(8080,()=>{
    console.log("app listening on 8080");
})

  

// //for inserting multiple user in one go use [users] else use /*  users */             
// try{  
//     connection.query(q, [data],(err,result)=>{
//         if(err) throw err;
//         console.log(result);
//         // console.log(result.length);
//         // console.log(result[0]);
//         // console.log(result[1]);
//     })  
// }
// catch(err){
//     console.log(err);
// }

// //close connection 
// connection.end();

