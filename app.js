//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require ("mongoose");
const _= require("lodash");

mongoose.connect("mongodb+srv://admin-vedu:admin-123@cluster0.4aav3.mongodb.net/todolistDB"); //url before todolistDB is taken from mongodb server after setting up the connection

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemSchema = {
  name: String
}

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your To Do List"
});

const item2 = new Item({
  name: "Hit the + to add a new item"
});

const item3 = new Item({
  name: "<-- Hit button to delete an item"
});


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

Item.find({}, function(err, items){

if (err){
  console.log(err);
}
//check to see if the defaultItems is empty or not if it is empty then we add the default items otherwise not in oredr to prevent redundancy.
else if (items.length === 0){

    Item.insertMany(defaultItems, function(error){
    if(error){
      console.log(error);
    }
    else{
      console.log("Success fully inserted!");
    }
    res.redirect("/");
    });

  }
  else{   // if items array isn't empty this else part will be executed
        res.render("list", {listTitle: "Today", newListItems: items});    
    }
  })
})

app.post("/", function(req, res){

  const listName = req.body.list;

  const itemName = req.body.newItem;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
  newItem.save();
  res.redirect("/"); 
  }
  else{
    List.findOne({name : listName}, function(err, foundList){
      if(err){
        console.log(err);
      }
      else{
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/" + listName); 
      }
    })
  }
  
});

app.post("/delete", function(req, res){

  const checkedItem = req.body.delItem;
  const listNAme = req.body.listNAme;

  if(listNAme === "Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Item Deleted !");
      }
    })
    res.redirect("/");
    }
  else{
    List.findOneAndUpdate({name: listNAme}, {$pull: {items: {_id: checkedItem}}}, function(err, foundItem){
      if(!err){
        res.redirect("/" + listNAme);
      }
    });
  }
})

app.get("/:titleName", function(req, res){

  const title =_.capitalize(req.params.titleName);

  List.findOne({name: title}, function(err, foundList){

    if(err){
      console.log(err);
    }
    else if(!foundList){ 
      //creating the new list if the list isn't present in database
      console.log("List is getting created");
      const list = new List({
      name: title,
      items: defaultItems
      })
      list.save();
      res.redirect("/"+ title);
    }
    else{
      //show existing list
       console.log("List Found");
      res.render("list", {listTitle: title, newListItems: foundList.items});
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000
}
app.listen(port, function(){
  console.log("Server started");
});

 