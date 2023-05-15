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
        .get('/home/6')
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
            res.body.should.be.a('object');
        done();
        })
    })
    it('Should render new post screen', (done) => {
        chai.request(server)
        .get('/home/6/new-post')
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
            res.body.should.be.a('object');
        done();
        })
    })
    it('Should render view post screen with post content populated', (done) => {
        chai.request(server)
        .get('/home/6/1/view')
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
        .post('/home/6/new-post/submit')
        .send(blog_post)
        .end((err, res) => {
            res.should.have.status(200);
            expect(res).to.have.header('content-type', 'text/html; charset=utf-8');
            res.body.should.be.a('object');
        done();
        })
    })
    






    it('should test two values', () => {
        let expectedVal = 10;
        let actualVal = 10;

        expect(actualVal).to.be.equal(expectedVal);
    })
})