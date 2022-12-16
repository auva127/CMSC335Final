const path = require("path");
const http = require("http");
const express = require("express");
const bcrypt = require('bcrypt')
var {ObjectId} = require('mongodb'); // or ObjectID Not Working

let fs = require("fs");
const bodyParser = require("body-parser");
let user = "";
let userPokemon = "Charmander";

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') }) 
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;


const databaseAndCollection = {db: db, collection: collection};
const { MongoClient, ServerApiVersion } = require('mongodb');
const { type } = require("os");
const { response } = require("express");
const { NONAME } = require("dns");
//mongodb+srv://spaghevin:<password>@cluster0.l2irowg.mongodb.net/?retryWrites=true&w=majority
const uri = `mongodb+srv://${userName}:${password}@cluster0.l2irowg.mongodb.net/${db}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect();
// document.getElementById("createUserButton").addEventListener("click", function() {
//     response.render("happy")
//     //document.querySelector("form.login-form").action = "/create";
// });

const app = express();  

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false})); 

//==================Log In functionality=================
app.get("/", async function(request, response) {
    //await deleteAll(client, databaseAndCollection)
    response.render("login");
});

// //new code
// app.post("/", async function(request, response) {
//     const hashedPassword = await bcrypt.hash(request.body.password, 10)
//     user = request.body.username; //important since we are now user
//     let filter = {user: user};

//     const check = await client.db(databaseAndCollection.db)
//     .collection(databaseAndCollection.collection)
//     .findOne(filter);

//     if (check.password === hashedPassword) {
//         userPokemon = check.pokemon
//         response.render("random")
//     } else {
//         response.send("Wrong Password")
//     }

//     await find(client, databaseAndCollection, {
//                 user: user,
//                 password: hashedPassword
//             });
//     response.render("random")
// });

//new code
app.post("/login", async function(request, response) {
    //const hashedPassword = await bcrypt.hash(request.body.password, 10)
    const password = request.body.password;
    user = request.body.username; //important since we are now user
    let filter = {user: user};
    try {
        const check = await client.db(databaseAndCollection.db)
        .collection(databaseAndCollection.collection)
        .findOne(filter);
        if (check.password == password) {
            userPokemon = check.pokemon
            response.render("random")
        } else {
            response.send("Wrong Password")
        }
    } catch {
        response.send("Wrong Login Information")

    }
   

});
//==================Registration functionality=================
app.get("/createUser", function(request, response) {
    
    response.render("createUser");
});

app.post("/createUser", async function(request, response) {
    const password = request.body.password;

    //const hashedPassword = await bcrypt.hash(request.body.password, 10)
    user = request.body.username; //important since we are now user
    await insert(client, databaseAndCollection, {
                user: user,
                password: password,
                pokemon: null
            });
    response.render("starter")
});

app.get("/starter", function(request, response) {
    response.render("starter");
});

app.post("/starter", async function(request, response) {
       let pokemonSelected = request.body.starterChoice;

       await updateOne(client, databaseAndCollection, user, {"pokemon": pokemonSelected})
       userPokemon = pokemonSelected;
       response.render("random", {user: user, userPokemon: userPokemon, userPokemon2: userPokemon}) //to change

});

//NEW CHANGES
app.get("/random", function(request, response) {
 
    response.render("random");
});

//================== about
app.get("/about", function(request,response) {
    response.render("about");
});

//===================insert
async function insert(client, databaseAndCollection, newPerson) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newPerson);
}

//==================search by email
async function find(client, databaseAndCollection, email) {
    let filter = {email: email};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);

   
    return result; 
}


//===============delete op
async function deleteAll(client, databaseAndCollection) {
    const result = await client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .deleteMany({});

    return result.deletedCount;
}

//===============update op
async function updateOne(client, databaseAndCollection, targetName, newValues) {
    let filter = {user : targetName};
    let update = { $set: newValues, };

    const result = await client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .updateOne(filter, update);

}
//terminal listener
let host = process.argv[2];

process.stdout.write("stop to shutdown the server: ");
process.stdin.on('readable', function() {
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.toString().trim();
		if (command === "stop") {
            process.exit(1);
        } 
        else {
			console.log(`Invalid command: ${command}, has to be stop`);
		}
        process.stdout.write("stop to shutdown the server: ");
        process.stdin.resume();
    }
});
app.use(express.static(__dirname + '/public'));

app.listen(5000); 