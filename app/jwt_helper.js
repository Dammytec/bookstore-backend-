/*const JTW = require('jsonwebtoken')
const createError = require('http-errors')



module.exports = {
    signAccessToken: (userId) => {
       return new Promise((resolve, reject) => {
        const payload = {
            name:'yours truly'
        }
        const secret = 'some top secret'
        const options = {}
        
        JTW.sign(payload, secret, options, (error , token)=>{
            if(error) reject(error)
                resolve(token)
        })
       })
    }
}*/