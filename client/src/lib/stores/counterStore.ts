import { makeAutoObservable } from "mobx";

export default class CounterStore {
  title = "Counter Store";
  count = 34;
  events: string[] = [`Initial count is ${this.count}`];

  constructor() {
    makeAutoObservable(this);
  }

  increment = (amount = 1) => {
    this.count += amount;
    this.events.push(`Incremented by ${amount}`);
  };

  decrement = (amount = 1) => {
    this.count -= amount;
    this.events.push(`Decremented by ${amount}`);
  };

  get eventCount() {
    return this.events.length;
  }
}
