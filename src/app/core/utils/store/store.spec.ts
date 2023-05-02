import { tap } from 'rxjs';
import { Store } from './store';
import { TestScheduler } from 'rxjs/testing';

class User {
  name?: string;
}

let testScheduler: TestScheduler;

describe('StoreClass Basics', () => {
  const userName = 'test name';
  const userNewName = 'new name';

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('gets the data', () => {
    const objTest = new Store<User>({ name: userName });

    expect(objTest.value.name).toBe(userName);
  });

  it('sets the data', () => {
    const objTest = new Store<User>({ name: userName });

    objTest.value = { name: userNewName };
    expect(objTest.value.name).toBe(userNewName);
  });

  it('checks the Observable emits', () => {
    const objTest = new Store<User>({ name: userName });

    const expectedMarbles = 'ab';
    const expectedValues = {
      a: { name: userName },
      b: { name: userNewName },
    };
    const triggerMarbles = '-a';
    const triggerValues = {
      a: () => (objTest.value = { name: userNewName }),
    };
    testScheduler.run(({ expectObservable, cold }) => {
      expectObservable(objTest.value$).toBe(expectedMarbles, expectedValues);
      expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())));
    });
  });

  it('checks with empty Store Object', () => {
    const startEmpty: Store<User> = new Store<User>({});

    const expectedMarbles = 'abca';
    const expectedValues = {
      a: {},
      b: { name: userName },
      c: { name: userNewName },
    };
    const triggerMarbles = '-abc';
    const triggerValues = {
      a: () => (startEmpty.value = { name: userName }),
      b: () => (startEmpty.value = { name: userNewName }),
      c: () => (startEmpty.value = {}),
    };
    testScheduler.run(({ expectObservable, cold }) => {
      expectObservable(startEmpty.value$).toBe(expectedMarbles, expectedValues);
      expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())));
    });
  });

  it('checks with empty Array', () => {
    const startEmpty: Store<User[]> = new Store<User[]>([]);

    const expectedMarbles = 'abca';
    const expectedValues = {
      a: [],
      b: [{ name: userName }],
      c: [{ name: userName }, { name: userNewName }],
    };
    const triggerMarbles = '-abc';
    const triggerValues = {
      a: () => (startEmpty.value = [{ name: userName }]),
      b: () => startEmpty.add({ name: userNewName }),
      c: () => (startEmpty.value = []),
    };

    testScheduler.run(({ expectObservable, cold }) => {
      expectObservable(startEmpty.value$).toBe(expectedMarbles, expectedValues);
      expectObservable(cold(triggerMarbles, triggerValues).pipe(tap((fn) => fn())));
    });
  });
});

// describe('StoreClass with Expire Time', () => {
//   const userName = 'test name';

//   beforeEach(() => {
//     testScheduler = new TestScheduler((actual, expected) => {
//       expect(actual).toEqual(expected);
//     });
//   });

//   it('checks when expired', () => {
//     const objTest = new Store<string>('', -10);

//     objTest.value = userName; // This value should not be returned as the store is considered 'expired'

//     const expectedMarbles = 'a';
//     const expectedValues = {
//       a: '',
//     };

//     testScheduler.run(({ expectObservable }) => {
//       expectObservable(objTest.value$).toBe(expectedMarbles, expectedValues);
//     });
//   });

//   it('checks when not expired', () => {
//     const objTest = new Store<string>('', 10);
//     objTest.value = userName;

//     const expectedMarbles = 'a';
//     const expectedValues = {
//       a: userName,
//     };

//     testScheduler.run(({ expectObservable }) => {
//       expectObservable(objTest.value$).toBe(expectedMarbles, expectedValues);
//     });
//   });
// });
