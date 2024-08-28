import fetchAX from '../src';

// const instance = fetchAX.create();

// 지정된 ID를 가진 유저에 대한 요청
fetchAX
  .get('https://example.com/user?ID=12345')
  .then(function (response) {
    // 성공 핸들링
    console.log('response', response);
  })
  .catch(function (error) {
    // 에러 핸들링
    console.log(error);
  })
  .finally(function () {
    // 항상 실행되는 영역
  });

fetchAX
  .get('https://example.com/user', {
    params: {
      ID: 12345,
    },
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  })
  .finally(function () {
    // 항상 실행되는 영역
  });

// async/await
async function getUser() {
  try {
    const response = await fetchAX.get('https://example.com/user?ID=12345');
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

fetchAX
  .post('/user', {
    firstName: 'Fred',
    lastName: 'Flintstone',
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });



function getUserAccount() {
  return fetchAX.get('https://jsonplaceholder.typicode.com/todos/1');
}

function getUserPermissions() {
  return fetchAX.get('https://jsonplaceholder.typicode.com/todos/1');
}

Promise.all([getUserAccount(), getUserPermissions()]).then(function (results) {
  const acct = results[0];
  const perm = results[1];
  console.log('병렬', acct, perm);
});
