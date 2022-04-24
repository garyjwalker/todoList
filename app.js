const mongoose = require("mongoose")
const express = require("express")
const date = require(__dirname + "/date.js")
const _ = require("lodash")
require("dotenv").config()

const todolistCollection = "todolist"
const port = 3000

const dbURI = "mongodb+srv://admin-gary:" + process.env.PASS + "@cluster0.fhxzz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const dbURI = "mongodb://localhost:27017/" + todolistCollection


const app = express()

// Set express variables.
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

mongoose.connect(dbURI + todolistCollection, (err) => {if (err) console.log(err)})

// mongoose item schema.
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})

// Compile schema to model.
const Item = mongoose.model("Item", itemsSchema)

// Some default items for empty db.
const item1 = new Item({name: "Welcome to your todolist."})
const item2 = new Item({name: "Hit + button to add a new item."})
const item3 = new Item({name: "<-- Hit this to delete an item.>"})

const defaultItems = [item1, item2, item3]

// Schema for custom lists.
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema)


app.get("/", (req,res) => {
    Item.find({}, "name", (err, foundItems) => {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if (err) console.log(err)
                else console.log("Successfully saved default items to database.")
            })
            res.redirect("/")
        } else {
            res.render("list", {listTitle: "Today", todoList: foundItems})
        }
        
    })
})


app.get("/:listName", (req, res) => {
    const customListName = _.capitalize(req.params.listName)

    List.findOne({name: customListName}, (err, listFound) => {
        if (err) console.log(err)
        else {
            if (!listFound) {
                // If list isn't found then create and populate a new one.
                console.log("Creating new list for " + customListName)
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
            
                list.save((err, result) => res.redirect("/" + customListName))
            } else {
                // Else, display list.
                res.render("list", {listTitle: customListName, todoList: listFound.items})
            }
        }
    })
})


app.get("/about", (req, res) => {
    res.render("about")
})


app.post("/", (req,res) => {
    const item = req.body.newTask
    const listName = req.body.list

    const newItem = new Item({name: item})

    if (listName === "Today") {     
        newItem.save()
        res.redirect("/")
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(newItem)
            foundList.save()
            res.redirect("/" + listName)
        })
    }
})


app.post("/delete", (req, res) => {
    const listName = _.capitalize(req.body.listName)
    const checkedItemId = req.body.checkbox

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, err=>console.error)
        res.redirect("/")
    } else {
        List.findOneAndUpdate({name: listName},
            {$pull: {items: {_id: checkedItemId}}}, 
            (err, foundList) => {
                if (!err) {
                    res.redirect("/" + listName)
                } 
            }
        )
    }
})


app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})