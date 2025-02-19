const Airtable = require('airtable');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

class User {
    constructor(username, email, password) {
        this.userId = uuidv4();
        this.username = username;
        this.email = email;
        this.password = password;
    }
    async setPassword() {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    async checkPassword(inputPassword) {
        return await bcrypt.compare(inputPassword, this.password);
    }
    async save() {
        await base('users').create([
            {
                fields: {
                    userId: this.userId,
                    username: this.username,
                    email: this.email,
                    password: this.password,
                },
            },
        ]);
    }
    static async findByEmail(email) {
        const records = await base('users')
            .select({
                filterByFormula: `{Email} = '${email}'`,
            })
            .firstPage();
        return records.length > 0 ? records[0].fields : null;
    }
}

module.exports = User; 