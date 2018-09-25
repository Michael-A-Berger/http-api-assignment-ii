// undefinedOrNull()
const undefinedOrNull = object => (object === null) || (object === undefined);

// Defining the users object
const users = {};

// returnJSON()
const returnJSON = (rq, rp, statusCode, object) => {
  rp.writeHead(statusCode, { 'Content-Type': 'application/json' });
  rp.write(JSON.stringify(object));
  rp.end();
};

// returnHeader()
const returnHeader = (rq, rp, statusCode) => {
  rp.writeHead(statusCode, { 'Content-Type': 'application/json' });
  rp.end();
};

// addUser()
const addUser = (rq, rp, params) => {
  if (undefinedOrNull(params.name) || undefinedOrNull(params.age)
      || params.name === '' || params.age === '') {
    const response = {
      message: 'Name and age are both required.',
      id: 'missingParams',
    };
    returnJSON(rq, rp, 400, response);
  } else if (users[params.name]) {
    users[params.name].age = params.age;
    returnHeader(rq, rp, 204);
  } else {
    users[params.name] = {
      name: params.name,
      age: params.age,
    };
    const response = { message: 'Created Successfully' };
    returnJSON(rq, rp, 201, response);
  }
};

// getUsers()
const getUsers = (rq, rp) => {
  if (rq.method === 'HEAD') {
    returnHeader(rq, rp, 200);
  } else {
    returnJSON(rq, rp, 200, { users });
  }
};

// notReal()
const notReal = (rq, rp) => {
  const response = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  if (rq.method === 'HEAD') {
    returnHeader(rq, rp, 404);
  } else {
    returnJSON(rq, rp, 404, response);
  }
};

// Exports
module.exports = {
  addUser,
  getUsers,
  notReal,
};
