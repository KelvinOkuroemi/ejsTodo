//jshint esversion:6

// ***APP SETUP***
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();

app.set("view engine", "ejs");
``;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kelvin:okus4baba@cluster0-todolist.56qrhmz.mongodb.net/todolistDB");

// ***MONGO SETUP***

// items schema
const itemsSchema = {
  name: String,
};

// items model
const item = mongoose.model("item", itemsSchema);

// item documents
const item1 = new item({
  name: "Welcome",
});

const item2 = new item({
  name: "Hit + to add an item",
});

const item3 = new item({
  name: "Hit checkbox to delete an item",
});

const defaultItems = [item1, item2, item3];

//New list schema
const listSchema = {
  name: String,
  items: [itemsSchema],
};

// list model
const list = mongoose.model("list", listSchema);

// ***APP FEATURES***

// display home page
app.get("/", function (req, res) {
  // list items
  item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {
      item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved");
        }
      });
      res.redirect("/");
    } else {
      // mongoose.collection.close()
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

// display new lists
app.get("/:route", (req, res) => {
  const newListName = _.capitalize(req.params.route);

  list.findOne({ name: newListName }, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //create new list
        const newList = new list({
          name: newListName,
          items: defaultItems,
        });
        newList.save();
        res.redirect(`/${newListName}`);
      } else {
        //show existing list
        res.render("list", {
          listTitle: newListName,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

// Post new items route
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list.trim();

  // itemName gives the name of the text, and it is what is used to create an entry in
  // mongoDB. So anytime itemName is used, an id is created, this is what we use to access
  // its text and id, and delete it from mongoDB
  const newListItem = new item({
    name: itemName,
  });

  if (listName === "Today") {
    newListItem.save();
    res.redirect("/");
  } else {
    list.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(newListItem);
      foundList.save();
      res.redirect(`/${listName}`);
    });
  }
});

// Delete with checkbox
app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName.trim();

  if (listName === "Today") {
    item.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("Successfully Deleted");
      } else {
        console.log(err);
      }
      res.redirect("/");
    });
  }else{
    list.findOneAndUpdate({name : listName},{$pull: {items:{_id: checkedItemId}}},(err,foundList)=>{
      foundList.save();
      res.redirect(`/${listName}`)
    })
  }
});

// run server
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server started");
});
