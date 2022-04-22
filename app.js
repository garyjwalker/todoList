const dbURI = "mongodb://localhost:27017/"
const todolistCollection = "todolist"
const port = 3000

const mongoose = require("mongoose")
const express = require("express")
const date = require(__dirname + "/date.js")

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
const item1 = new Item({name: "Hello"})
const item2 = new Item({name: "World"})
const item3 = new Item({name: "!"})

const defaultItems = [item1, item2, item3]

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

app.get("/about", (req, res) => {
    res.render("about")
})

app.post("/", (req,res) => {
    const item = req.body.newTask
    const newItem = new Item({name: item})
    newItem.save()
    res.redirect("/")
})

app.post("/delete", (req, res) => {
    Item.findByIdAndRemove(req.body.checkbox, err=>console.error)
    res.redirect("/")
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})