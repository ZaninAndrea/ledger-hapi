const MongoClient = require("mongodb").MongoClient
require("dotenv").config()
const uri = process.env.MONGODB_URI

const client = new MongoClient(uri, { useNewUrlParser: true })

function collectionToHandler(collection) {
    return {
        collection,
        findAll: query =>
            new Promise((resolve, reject) => {
                collection.find(query).toArray(function(err, result) {
                    if (err) return reject(err)
                    resolve(result)
                })
            }),
        findOne: query =>
            new Promise((resolve, reject) => {
                collection.findOne(query, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            }),
        insertOne: doc =>
            new Promise((resolve, reject) => {
                collection.insertOne(doc, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            }),
        insertMany: docs =>
            new Promise((resolve, reject) => {
                collection.insertMany(docs, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            }),
        updateOne: (query, newValue) =>
            new Promise((resolve, reject) => {
                collection.updateOne(query, newValue, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            }),
        updateMany: (query, newValue) =>
            new Promise((resolve, reject) => {
                collection.updateMany(query, newValue, function(err, result) {
                    if (err) reject(err)
                    resolve(result)
                })
            }),
    }
}

module.exports = new Promise((resolve, reject) => {
    client.connect(err => {
        if (err) return reject(err)
        const debtsCollection = client.db("test").collection("debts")
        const usersCollection = client.db("test").collection("users")
        const ledgerCollection = client.db("test").collection("ledger")

        resolve({
            client,
            Debt: collectionToHandler(debtsCollection),
            User: collectionToHandler(usersCollection),
            Ledger: collectionToHandler(ledgerCollection),
        })
    })
})
