import { nextFetch } from '../src';

// 사용자가 설정한 타입이 데이터 타입으로 잘 오는지 확인
const fetch = nextFetch.create({ responseType: 'json' });
const a = await fetch.get<{
  zpp: number;
}>('http://localhost:3001/json');
console.log(a.data);
