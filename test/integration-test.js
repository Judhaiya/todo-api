const mocha = require('mocha')
const chai = require('chai')
const dotenv = require('dotenv')
const chaiHttp = require('chai-http')
const UsersData = require('../models/UserModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

dotenv.config()
chai.use(chaiHttp)
const expect = chai.expect
const should = chai.should()
// test cases - signup
// 1. on hitting api with right params ,it should give 200 response
// 2. email is not undefined
// 3, userName is not undefined
// 4.password is not undefined
// 5. email is in regex format
// 6. password should be  equal to characters in length
// 7. hashed password and password is same
// 8. check if username already exists in db
// 9.comparing password
// 10.jwt verification

// login
// 1. email is not undefined
// 2. password is not undefined
// 3. password and hashed password is same
// 4. check if username already exists in db
let userDetails = {
    userName: 'Flynn',
    email: 'BrandonFlynn12@gmail.com',
    password: 'gemininerd'
}
describe('sign api prep', () => {
    let token
    before(() => {
        chai.request(`${process.env.SERVER_URL}`)
            .delete('api/signup')
            .send(userDetails)
            .end((err, res) => {
                expect(err).to.be(undefined)
                expect(200)
                token = res.body.token
            })
    })

    describe('when signup is called', () => {
        it('does the api process registration correctly', async (done) => {
            const findEmail = UsersData.findOne({ email: userDetails.email })
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send(userDetails)
                .end(async (err, res) => {
                    expect(200)
                    res.body.should.have.property('msg')
                    expect(res.body.msg).to.be.eql('user details has been successfully stored in db')
                    if (findEmail) {
                        expect(userDetails).to.deep.equal(findEmail)
                    }
                    jwt.verify(token, process.env.JWT_SECRET).then(jwtDetails => {
                        return expect(userDetails).to.deep.equal(jwtDetails)
                    })
                    const isPasswordMatched = await bcrypt.compare(userDetails?.password, findEmail?.password)
                    expect(isPasswordMatched).to.not.be(false)
                    done()
                })
        })
        it('does it should throw 400 if password has more than 6 characters in length'
            , (done) => {
                chai.request('http://localhost:8080')
                    .post('/api/auth/signup')
                    .send({ ...userDetails, password: 123457890 })
                    .end((err, res) => {
                        expect(res.statusCode).to.equal(400)
                        expect(err).to.be(undefined)
                        expect(res.body.should.have.property('msg').eql("password length should not be less than 6"))
                        done()
                    })
            })
        it('does it should if password has less than 6 characters in length', (done) => {
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send({ ...userDetails, password: 1234 })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400)
                    expect(err).to.be(undefined)
                    expect(res.body.should.have.property('msg').eql("password length should not be less than 6"))
                    done()
                })
        })
        it('negative cases - show 400 error when no userName', (done) => {
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send({ email: userDetails.email, password: userDetails.password })
                .end((err, res) => {
                    expect(400)

                    done()
                })
        })
        it('negative cases - show 400 error when no email', (done) => {
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send({ userName: userDetails.userName, password: userDetails.password })
                .end((err, res) => {
                    expect(400)
                    expect(err).to.be(undefined)
                    done()
                })
        })
        it('negative cases - should return 400 when email format is wrong', (done) => {
            chai.request('http://localhost:8080')
                .post('/api/auth/signup')
                .send({ ...userDetails, email: 'udhaiya' })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400)
                    console.log(res, 'res')
                    expect(err).to.be(undefined)
                    expect(res.body.should.have.property('msg').eql('Please enter a valid email'))
                    done()
                })
        })
    })
})

describe('login-test-cases', () => {
    describe('when login is called', () => {
        before(() => {
            request(`${process.env.SERVER_URL}`)
                .post('api/signup')
                .send(userDetails)
                .end((err, res) => {
                    token = res.body.token
                    expect(res.statusCode).to.equal(200).or.to.equal(400)
                    expect(res.body.should.have.property('msg').eql('Please enter a valid email'))
                    expect(err).to.be(undefined)
                })
        })
        it('if user already has an account in db ', async (done) => {
            const findEmail = UsersData.findOne({ email: userDetails.email })
            expect(findEmail?.email).to.equal(userDetails?.email)
            done()
            chai.request('http://localhost:8080')
                .post('/api/auth/login')
                .send(userDetails)
                .end((err, res) => {
                    expect(err).to.be(undefined)
                    expect(res.statusCode).to.equal(200)
                })
        })
        it('if email empty,it should throw 400', (done) => {
            chai.request('http://localhost:8080')
                .post('/api/auth/login')
                .send({ userName: userDetails.userName, password: userDetails.password })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400)
                     expect(err).to.be(undefined)
                    done()
                })
        })
        it('if email empty,it should throw 400', (done) => {
            const userDetails = {
                email: 'flynn@gmail.com'
            }
            chai.request('http://localhost:8080')
                .post('/api/auth/login')
                .send({ userName: userDetails.userName, email: userDetails.email })
                .end((err, res) => {
                    expect(res.statusCode).to.equal(400)
                    expect(err).to.be(undefined)
                    done()
                })
        })
    })
})

// test cases - delete
// when we pass username,password,token  it should respond with status 200
// no jwt token is pass,it should respond with status 400
// no password,it should respond with status 400
// no username it should respond with status 400

describe('delete-test-cases', () => {
    describe('positive-test-cases', () => {
        let token
        before(() => {
            request(`${process.env.SERVER_URL}`)
                .post('api/signup')
                .send(userDetails)
                .end((err, res) => {
                    token = res.body.token
                    expect(res.statusCode).to.equal(200).or.to.equal(400)
                })
        })
        it('prerequisites are present ,should respond with status 200', (done) => {
            chai.request('http://localhost:8080')
                .delete('api/auth/delete')
                .send({ ...userDetails, token })
                .end((err, res) => {
                    expect(200)
                })
            // token
        })
        it('no password is given,it should respond with status 400', (done) => {
            delete userDetails.password
            chai.request('http://localhost:8080')
                .delete('api/auth/delete')
                .send(userDetails)
                .end((err, res) => {
                    expect(400)
                })
            done()
        })
        it('no email is given,it should respond with status 400', (done) => {
            delete userDetails.email
            chai.request('http://localhost:8080')
                .delete('api/auth/delete')
                .send(userDetails)
                .end((err, res) => {
                    expect(400)
                    done()
                })
        })
    })
})
describe('delete-test-cases', () => {
    it('no token is passed,it should respond with status 400', (done) => {
        delete userDetails.token
        chai.request('http://localhost:8080')
            .delete('api/auth/delete')
            .send(userDetails)
            .end((err, res) => {
                expect(400)
                done()
            })
    })
})
