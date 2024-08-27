import fetchAX from '../src';

// const instance = fetchAX.create();

// 지정된 ID를 가진 유저에 대한 요청
fetchAX
  .get('https://jsonplaceholder.typicode.com/todos/1')
  .then(function (response) {
    // 성공 핸들링
    console.log('response',response);
  })
  .catch(function (error) {
    // 에러 핸들링
    console.log(error);
  })
  .finally(function () {
    // 항상 실행되는 영역
  });
