class User {
    constructor(userName, email) {
        this._userName = userName;
        this._email = email;
  }
  
    get userName() {
        return this.userName;
    }
  
    get email() {
         return this.email;
    }
    set userName(userName){
        this.userName = userName;
    }
    
    set email(email){
        this.email = email;
    }
}

module.exports = User