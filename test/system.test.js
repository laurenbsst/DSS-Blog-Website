const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../server');

chai.use(chaiHttp);

describe('Home routes', () => {
    // GET requests
    it('Should render home screen with user posts', (done) => {
        chai.request(server)
        .get('/home/1f2768b7-d50f-4141-ba5c-b388413e9b44')
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
            res.body.should.be.a('object');
        done();
        })
    })
    it('Should render new post screen', (done) => {
        chai.request(server)
        .get('/home/1f2768b7-d50f-4141-ba5c-b388413e9b44/new-post')
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
            res.body.should.be.a('object');
        done();
        })
    })
    it('Should render view post screen with post content populated', (done) => {
        chai.request(server)
        .get('/home/1f2768b7-d50f-4141-ba5c-b388413e9b44/e98b35d1-e3b5-42e7-908c-fd17ef88a11e/view')
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
            res.body.should.be.a('object');
        done();
        })
    })
    // POST requests
    it('Should POST a new blog post', (done) => {

        let blog_post = {
            title: "Test title!",
            content: "Testing with Mocha!"
        }

        chai.request(server)
        .post('/home/1f2768b7-d50f-4141-ba5c-b388413e9b44/new-post/submit')
        .send(blog_post)
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
            res.body.should.be.a('object');
        done();
        })
    })
    //it('Should create a new account', (done) => {
        //let account = {
           // username: 'admin',
            //email: '1234@gmail.com',
            //password: '1234',
            //confirmpassword: '1234'
        //}
        //chai.request(server)
        //.post('/create-account')
        //.send(account)
        //.end((err, res) => {
            //res.should.have.status(500);
            //expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
           // res.body.should.be.a('object');
        //done();
        //})
    //})
})