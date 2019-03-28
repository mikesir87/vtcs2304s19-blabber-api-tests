const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;

chai.use(chaiHttp);

const API_BASE = `http://${process.env.SERVICE_NAME || 'api'}:${process.env.API_PORT || 80}`;
console.log(`Using API_BASE: ${API_BASE}`);

const NEW_BLAB = {
    message : "Test message",
    author : {
        name : "Michael Irwin",
        email : "mikesir87@gmail.com"
    }
};

const get = (url) => chai.request(API_BASE).get(`${url}`);
const post = (url, data) => chai.request(API_BASE).post(`${url}`).send(data);
const del = (url) => chai.request(API_BASE).del(`${url}`);

describe('/blabs', () => {

    describe('GET /blabs', () => {

        it('should get empty array when nothing exists', async () => {
            const res = await get('/blabs');
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            expect(res).to.have.header('content-type', /application\/json/)
        });

        it('should honor createdSince parameter', async () => {
            const createRequest = await post('/blabs', NEW_BLAB);
            const createdBlab = createRequest.body;
            
            const postTime = createRequest.body.postTime;

            const pastTime = await get(`/blabs?createdSince=${postTime - 5}`);
            const pastBlabs = pastTime.body;
            expect(pastBlabs).to.be.a('array');
            expect(pastBlabs.find(b => b.id === createdBlab.id), 'Newly created blab should be in response if using an older createdSince value')
                .not.to.be.undefined;

            const futureBlabResponse = await get(`/blabs?createdSince=${postTime + 5}`);
            const futureBlabs = futureBlabResponse.body;
            expect(futureBlabs).to.be.a('array');
            expect(futureBlabs, 'Newly created blab should NOT be in response if using a future createdSince value').to.have.length(0);
        });

    });

    describe('POST /blabs', () => {

        it('creates a blab successfully', async () => {
            const res = await post('/blabs', NEW_BLAB);
            res.should.have.status(201, 'Expected a 201 response code');
            res.body.should.be.a('object');

            const body = res.body;

            expect(body.message, 'Should have gotten message back')
                .to.equal(NEW_BLAB.message);
            expect(body.author.name, 'Should have gotten author name back')
                .to.equal(NEW_BLAB.author.name);
            expect(body.author.email, 'Should have gotten author email back')
                .to.equal(NEW_BLAB.author.email);

            expect(body.id, 'New blab should have an id')
                .to.not.be.undefined;
            expect(body.postTime, 'New blab should have a post time added')
                .to.not.be.undefined;

            const postTime = body.postTime;
            const now = Math.floor(Date.now() / 1000);
            expect(postTime, 'Post time should be a UNIX timestamp, in seconds')
                .to.be.greaterThan(now - 5).and.lessThan(now + 5);
        });

        it('displays blab after creation', async () => {
            const response = await post('/blabs', NEW_BLAB);
            const body = response.body;

            const allBlabs = (await get('/blabs')).body;
            expect(allBlabs).to.have.length.greaterThan(0);
            
            const blab = allBlabs.find(b => b.id === body.id);
            expect(blab, 'Expected new blab to be in /blabs after creation')
                .not.to.be.undefined;
        });
    });


    describe('DELETE /blabs/:id', () => {
        it('deletes a blab correctly', async () => {
            const response = await post('/blabs', NEW_BLAB);
            const body = response.body;

            const delResponse = await del(`/blabs/${body.id}`);
            expect(delResponse.status).to.equal(200);
    
            const allBlabsRequest = await get('/blabs');
            const allBlabs = allBlabsRequest.body;

            const blab = allBlabs.find(b => b.id === body.id);
            expect(blab, 'Expected blab to be gone after deleting')
                .to.be.undefined;
                console.log('done');
        });    
    });


});
