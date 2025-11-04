console.log('Test starting...');

class User {
  constructor(data) {
    this.id = data.id || 1;
    this.hasDiabetes = data.hasDiabetes || false;
  }
}

const user = new User({ id: 1, hasDiabetes: true });
console.log('User created:', user);
console.log('Test complete!');
