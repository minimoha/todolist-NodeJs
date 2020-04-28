const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://admin-root:Test123@cluster0-qqomq.mongodb.net/todolistDb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// mongoose.connect("mongodb://localhost:27017/todolistDb", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.set("useFindAndModify", false);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome",
});

const item2 = new Item({
  name: "Make Food",
});

const item3 = new Item({
  name: "Eat Food",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);
// let todoItems = [];
// let workItems = [];

app.get("/", function (req, res) {
  const day = "Today";
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successful!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        newtodoItems: foundItems,
      });
    }
  });
  // res.render("list", {
  //   listTitle: day,
  //   newtodoItems: todoItems,
  // });
});

app.post("/", function (req, res) {
  // let todoItem = req.body.todoItem;
  const itemName = req.body.todoItem;
  const listName = req.body.list;
  const day = "Today";

  const newItem = new Item({
    name: itemName,
  });

  if (listName === day) {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, found) {
      found.items.push(newItem);
      found.save();
      res.redirect("/" + listName);
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(todoItem);
  //   res.redirect("/work");
  // } else {
  //   todoItems.push(todoItem);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  const day = "Today";

  if (listName === day) {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      //findByIdAndRemove
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      function (err, found) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.get("/:other", function (req, res) {
  const customRoute = _.capitalize(req.params.other);

  List.findOne({ name: customRoute }, function (err, found) {
    if (found === null) {
      const list = new List({
        name: customRoute,
        items: defaultItems,
      });

      list.save();
      res.redirect("/" + customRoute);
    } else {
      res.render("list", {
        listTitle: found.name,
        newtodoItems: found.items,
      });
    }
  });
});

// app.get("/work", function (req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newtodoItems: workItems,
//   });
// });

// app.post("/work", function (req, res) {
//   let todoItem = req.body.todoItem;

//   workItems.push(todoItem);

//   res.redirect("/work");
// });

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});

// <%  for (let i = 0; i<newtodoItems.length; i++) { %>
//   <div class="item">
//     <input type="checkbox">
//     <p> <%=  newtodoItems[i].name  %> </p>
//   </div>
//   <% } %></div>
