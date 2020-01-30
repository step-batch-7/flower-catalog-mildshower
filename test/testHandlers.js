const request = require('supertest');
const {app} = require('../handlers');

describe('GET', function() {
  it('\'/\' should give index.html', function(done) {
    request((req, res) => app.serve(req, res))
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Content-Length', '751')
      .expect('Date', /./)
      .expect(/Flower Catalogue/, done);
  });

  it('validFilePath should give the file', function(done){
    request((req, res) => app.serve(req, res))
      .get('/agerantum.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Content-Length', '1273')
      .expect('Date', /./)
      .expect(/Agerantum/, done);
  });

  it('guestPage.html should give dynamic guestPages', function(done){
    request((req, res) => app.serve(req, res))
      .get('/guestPage.html')
      .expect(200)
      .expect('Content-Type', 'text/html')
      .expect('Date', /./)
      .expect(/Guest Book/, done);
  });

  it('should give NOT FOUND response for nonExisting file', function(done) {
    request((req, res) => app.serve(req, res))
      .get('/doesNotExist')
      .expect(404, done);
  });
});