const { ObjectID } = require("mongodb")

module.exports = ({ Debt, User, Ledger }) => {
    async function newUser(name) {
        const allUsers = await User.findAll({})
        const newUserId = (await User.insertOne({ name })).insertedId

        const newDebts = allUsers.map(otherUser => ({
            debtor: newUserId,
            debtee: otherUser._id,
            amount: 0,
        }))

        if (newDebts.length !== 0) {
            await Debt.insertMany(newDebts)
        }

        return newUserId
    }
    async function closeDebt(debtor, debtee) {
        const p1 = Debt.updateOne(
            { debtor: ObjectID(debtor), debtee: ObjectID(debtee) },
            { $set: { amount: 0 } }
        )
        const p2 = Debt.updateOne(
            { debtee: ObjectID(debtor), debtor: ObjectID(debtee) },
            { $set: { amount: 0 } }
        )

        console.log(await Promise.all([p1, p2]))

        return true
    }
    async function newExpense(amount, description, spender, beneficiaries) {
        deltaDebt = amount / beneficiaries.length
        const newExpense = await Ledger.insertOne({
            amount,
            description,
            spender,
            beneficiaries,
        })

        await Promise.all(
            beneficiaries
                .filter(beneficiary => beneficiary !== spender)
                .map(beneficiary => addDebt(beneficiary, spender, deltaDebt))
        )

        return newExpense
    }
    async function addDebt(debtor, debtee, amount) {
        const p1 = Debt.updateOne(
            { debtor: ObjectID(debtor), debtee: ObjectID(debtee) },
            { $inc: { amount: amount } }
        )
        const p2 = Debt.updateOne(
            { debtee: ObjectID(debtor), debtor: ObjectID(debtee) },
            { $inc: { amount: -amount } }
        )

        await Promise.all([p1, p2])
    }

    async function getUserDebts(userId) {
        const users = await User.findAll({})
        const getDebteeName = id => {
            const usersFound = users.filter(
                user => user._id.toString() === id.toString()
            )

            if (usersFound.length !== 0) return usersFound[0].name
            else return null
        }
        const fromDebts = (await Debt.findAll({
            debtor: ObjectID(userId),
        })).map(({ debtor, debtee, amount }) => ({
            debtor,
            debtee,
            amount,
        }))
        const toDebts = (await Debt.findAll({
            debtee: ObjectID(userId),
        })).map(({ debtor, debtee, amount }) => ({
            debtor: debtee,
            debtee: debtor,
            amount: -amount,
        }))

        return [...fromDebts, ...toDebts].map(debt => ({
            ...debt,
            debteeName: getDebteeName(debt.debtee),
        }))
    }

    return {
        newUser,
        closeDebt,
        newExpense,
        addDebt,
        getUserDebts,
    }
}
