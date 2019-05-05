const database = require("./database")
const mongoHelpers = require("./mongo")
const Hapi = require("@hapi/hapi")
const { ObjectID } = require("mongodb")

async function main() {
    const { client, Debt, User, Ledger } = await database
    const {
        newUser,
        closeDebt,
        newExpense,
        addDebt,
        getUserDebts,
    } = mongoHelpers({
        Debt,
        User,
        Ledger,
    })

    // Debt.collection.deleteMany({}, console.log)
    // User.collection.deleteMany({}, console.log)
    // Ledger.collection.deleteMany({}, console.log)

    const server = Hapi.server({
        port: +process.env.PORT || 3000,
        host: process.env.PORT ? "0.0.0.0" : "localhost",
        routes: {
            cors: true,
        },
    })

    server.route({
        method: "GET",
        path: "/users",
        handler: async (request, h) => {
            return (await User.findAll({})).map(user => ({
                name: user.name,
                _id: user._id,
            }))
        },
    })
    server.route({
        method: "GET",
        path: "/users/{userId}/debts",
        handler: async (request, h) => {
            return await getUserDebts(request.params.userId)
        },
    })
    server.route({
        method: "DELETE",
        path: "/users/{debtorId}/debts/{debteeId}",
        handler: async (request, h) => {
            console.log("called delete")
            return await closeDebt(
                request.params.debtorId,
                request.params.debteeId
            )
        },
    })
    server.route({
        method: "POST",
        path: "/expenses",
        handler: async (request, h) => {
            const {
                amount,
                description,
                spender,
                beneficiaries,
            } = request.payload

            return await newExpense(amount, description, spender, beneficiaries)
        },
    })
    server.route({
        method: "POST",
        path: "/users",
        handler: async (request, h) => {
            const { name } = request.payload
            return await newUser(name)
        },
    })

    await server.start()
    console.log("Server running on %s", server.info.uri)
}

main()

// const andrea = await newUser("andrea")
// const bosco = await newUser("bosco")
// const dossi = await newUser("dossi")

// await newExpense(10, "spesa", andrea.id, [andrea.id, bosco.id])
// await newExpense(3, "spesa", andrea.id, [dossi.id])

// console.log(await Debt.findAll({}))
// console.log(await User.findOne({ name: "andrea" }))
