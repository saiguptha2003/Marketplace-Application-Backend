const Airtable = require('airtable');
const { v4: uuidv4 } = require('uuid');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

class Product {
    constructor(name, description, price, imageUrl, userId) {
        this.productId = uuidv4();
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.userId = String(userId);
    }

    async save() {
        const record = await base('products').create([
            {
                fields: {
                    productId: this.productId,
                    Name: this.name,
                    Description: this.description,
                    Price: this.price,
                    'Image URL': this.imageUrl,
                    userId: this.userId,
                },
            },
        ]);
        return record;
    }

    // Static method to find all products
    static async findAll() {
        const records = await base('products').select().all();
        return records.map(record => ({ id: record.id, ...record.fields }));
    }

    // Static method to find a product by ID
    static async findById(id) {
        const record = await base('products').find(id);
        return { id: record.id, ...record.fields };
    }

    // Static method to update a product by productId
    static async update(productId, updatedFields) {
        console.log(`Searching for productId: ${productId}`); // Debug log
        const record = await base('products').select({
            filterByFormula: `{productId} = '${productId}'`
        }).firstPage();

        console.log(`Records found: ${JSON.stringify(record)}`); // Debug log

        if (record.length === 0) {
            throw new Error('Product not found');
        }

        const updatedRecord = await base('products').update(record[0].id, updatedFields);
        return { id: updatedRecord.id, ...updatedRecord.fields };
    }

    // Static method to delete a product by productId
    static async delete(productId) {
        const records = await base('products').select({
            filterByFormula: `{productId} = '${productId}'`
        }).firstPage();

        if (records.length === 0) {
            throw new Error('Product not found');
        }

        await base('products').destroy(records[0].id);
        return { productId };
    }

    // Static method to find a product by productId
    static async findByProductId(productId) {
        const records = await base('products').select({
            filterByFormula: `{productId} = '${productId}'` // Use Airtable's formula to filter by productId
        }).firstPage();

        if (records.length > 0) {
            return { id: records[0].id, ...records[0].fields }; // Return the first matching product
        } else {
            return null; // Return null if no product is found
        }
    }
}

module.exports = Product; 